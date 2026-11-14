import { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { store } from '../services/store';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay';
import { getIO } from '../socket';
import { ENV } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const processedWebhookEvents = new Set<string>();

export const createPaymentOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    throw new AppError('orderId is required in request body', 400, 'VALIDATION_ERROR');
  }

  const order = store.getOrderById(orderId);
  if (!order) {
    throw new AppError(`Order '${orderId}' not found`, 404, 'NOT_FOUND');
  }

  try {
    const rzpOrder = await createRazorpayOrder({
      amountInRupees: order.totalAmount,
      currency: 'INR',
      receipt: `rcpt_${order.id}`,
      notes: {
        orderId: order.id,
        customerName: order.customerName,
        phone: order.customerPhone,
      },
    });

    order.razorpayOrderId = rzpOrder.id;

    res.json({
      success: true,
      data: {
        orderId: order.id,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: rzpOrder.key,
        isMock: rzpOrder.isMock,
      },
    });
  } catch (err: any) {
    throw new AppError(`Failed to initiate payment gateway: ${err.message}`, 500, 'GATEWAY_ERROR');
  }
};

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const verifyPayment = (req: Request, res: Response) => {
  const parsed = verifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid payment verification parameters', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = store.getOrderById(orderId);
  if (!order) {
    throw new AppError(`Order '${orderId}' not found`, 404, 'NOT_FOUND');
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    order.paymentStatus = 'failed';
    throw new AppError('Invalid cryptographic payment signature', 400, 'INVALID_SIGNATURE');
  }

  // Update order as captured and received
  order.paymentStatus = 'captured';
  order.status = 'received';
  order.razorpayPaymentId = razorpayPaymentId;
  order.updatedAt = new Date().toISOString();

  const io = getIO();
  if (io) {
    io.emit('order:payment-captured', { orderId: order.id, paymentId: razorpayPaymentId, order });
    io.emit('order:status-changed', { orderId: order.id, status: 'received', order });
  }

  res.json({
    success: true,
    message: 'Payment verified and captured successfully',
    data: order,
  });
};

/**
 * Webhook handler with RAW body verification and event-id idempotency
 */
export const handleWebhook = (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const eventId = req.headers['x-razorpay-event-id'] as string || `evt_${Date.now()}`;

  // 1. Webhook Idempotency
  if (processedWebhookEvents.has(eventId)) {
    return res.status(200).json({ success: true, message: 'Event already processed' });
  }

  // 2. RAW Body signature verification
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const secret = ENV.RAZORPAY_WEBHOOK_SECRET;

  if (signature && secret && !secret.includes('placeholder')) {
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expectedSignature !== signature) {
      throw new AppError('Invalid Razorpay webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
    }
  }

  processedWebhookEvents.add(eventId);

  const payload = req.body;
  const event = payload?.event;

  if (event === 'payment.captured') {
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.notes?.orderId;
    if (orderId) {
      const order = store.getOrderById(orderId);
      if (order && order.paymentStatus !== 'captured') {
        order.paymentStatus = 'captured';
        order.status = 'received';
        order.razorpayPaymentId = paymentEntity.id;
        order.updatedAt = new Date().toISOString();

        const io = getIO();
        if (io) {
          io.emit('order:payment-captured', { orderId: order.id, paymentId: paymentEntity.id, order });
        }
      }
    }
  }

  res.json({ success: true, status: 'acknowledged' });
};

const refundSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().min(1),
  reason: z.string().default('Customer cancellation / managerial refund'),
});

export const processRefund = (req: AuthenticatedRequest, res: Response) => {
  const parsed = refundSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid refund payload', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const { orderId, amount, reason } = parsed.data;
  const before = store.getOrderById(orderId);
  const updatedOrder = store.processRefund(orderId, amount, reason);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'PROCESS_REFUND',
      entity: 'Order',
      entityId: orderId,
      before: { totalAmount: before?.totalAmount, paymentStatus: before?.paymentStatus },
      after: { refundedAmount: amount, paymentStatus: updatedOrder.paymentStatus, reason },
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const io = getIO();
  if (io) {
    io.emit('order:refunded', { orderId, amount, order: updatedOrder });
    io.emit('order:status-changed', { orderId, status: updatedOrder.status, order: updatedOrder });
  }

  res.json({
    success: true,
    message: `Refund of ₹${amount} processed successfully for order ${orderId}.`,
    data: updatedOrder,
  });
};
