import { Request, Response } from 'express';
import { store } from '../services/store';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay';
import { io } from '../server';

export const createPaymentOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const order = store.getOrderById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
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
    res.status(500).json({ success: false, message: 'Failed to initiate Razorpay order', error: err.message });
  }
};

export const verifyPayment = (req: Request, res: Response) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = store.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    order.paymentStatus = 'failed';
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  // Update order as captured and received
  order.paymentStatus = 'captured';
  order.status = 'received';
  order.razorpayPaymentId = razorpayPaymentId;
  order.updatedAt = new Date().toISOString();

  if (io) {
    io.emit('order:payment-captured', { orderId: order.id, paymentId: razorpayPaymentId, order });
  }

  res.json({
    success: true,
    message: 'Payment verified and captured successfully',
    data: order,
  });
};
