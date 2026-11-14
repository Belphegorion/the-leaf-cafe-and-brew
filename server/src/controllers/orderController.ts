import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store';
import { Order, OrderItemPayload, OrderType } from '../../../shared/types';
import { getIO } from '../socket';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  selectedCustomizations: z
    .array(
      z.object({
        groupId: z.string(),
        groupName: z.string(),
        selectedOptionId: z.string(),
        selectedOptionName: z.string(),
        priceDelta: z.number().default(0),
      })
    )
    .optional(),
  specialInstructions: z.string().optional(),
});

const createOrderSchema = z.object({
  orderType: z.enum(['dine-in-table', 'dine-in-arrival', 'takeaway-pickup', 'delivery-aggregator'] as [OrderType, ...OrderType[]]).default('dine-in-table'),
  tableNumber: z.coerce.number().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid customer phone is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  tipAmount: z.coerce.number().min(0).default(0),
  couponCode: z.string().optional(),
  scheduledArrivalTime: z.string().optional(),
  paymentMethod: z.enum(['razorpay', 'pay-at-counter', 'running-tab']).default('razorpay'),
  specialInstructions: z.string().optional(),
});

export const createOrder = (req: Request, res: Response) => {
  // 1. Idempotency Check
  const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;
  if (idempotencyKey) {
    const cached = store.getIdempotentResponse(idempotencyKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid order payload', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const data = parsed.data;

  // 2. Server-side recalculation of every item
  let subtotal = 0;
  const verifiedItems: OrderItemPayload[] = [];

  for (const clientItem of data.items) {
    const menuItem = store.getMenuItemById(clientItem.menuItemId);
    if (!menuItem) {
      throw new AppError(`Menu item '${clientItem.menuItemId}' does not exist.`, 400, 'ITEM_NOT_FOUND');
    }
    if (!menuItem.isAvailable) {
      throw new AppError(`'${menuItem.name}' is currently sold out (86).`, 400, 'ITEM_UNAVAILABLE');
    }

    // Customization price delta
    let customDelta = 0;
    if (clientItem.selectedCustomizations && Array.isArray(clientItem.selectedCustomizations)) {
      customDelta = clientItem.selectedCustomizations.reduce((acc, c) => acc + (c.priceDelta || 0), 0);
    }

    const unitPrice = menuItem.price + customDelta;
    const qty = clientItem.quantity;
    const itemTotal = unitPrice * qty;

    subtotal += itemTotal;

    verifiedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: qty,
      unitPrice,
      selectedCustomizations: (clientItem.selectedCustomizations as any) || [],
      specialInstructions: clientItem.specialInstructions,
      itemTotal,
    });
  }

  // 3. Coupon validation & discount
  let discountAmount = 0;
  let validCouponCode: string | undefined = undefined;

  if (data.couponCode && data.couponCode.trim()) {
    const couponResult = store.validateCoupon(data.couponCode, subtotal);
    if (!couponResult.valid) {
      throw new AppError(couponResult.message || 'Invalid coupon', 400, 'INVALID_COUPON');
    }
    discountAmount = couponResult.discountAmount;
    validCouponCode = data.couponCode.trim().toUpperCase();
  }

  // 4. Indian 5% Restaurant GST Calculation & Grand Total
  const gstAmount = Math.round(subtotal * 0.05);
  const totalAmount = Math.max(0, subtotal + gstAmount + data.tipAmount - discountAmount);

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber: orderId,
    orderType: data.orderType,
    tableNumber: data.tableNumber,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail || undefined,
    customer: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail || undefined,
    },
    items: verifiedItems,
    subtotal,
    gstAmount,
    gst: gstAmount,
    tipAmount: data.tipAmount,
    discountAmount,
    couponCode: validCouponCode,
    totalAmount,
    total: totalAmount,
    status: data.paymentMethod === 'pay-at-counter' || data.paymentMethod === 'running-tab' ? 'received' : 'pending-payment',
    estimatedPrepMinutes: 18,
    scheduledArrivalTime: data.scheduledArrivalTime,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === 'pay-at-counter' || data.paymentMethod === 'running-tab' ? 'pending' : 'pending',
    specialInstructions: data.specialInstructions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.createOrder(newOrder);

  // Broadcast to live KDS / staff dashboard
  const io = getIO();
  if (io) {
    io.emit('order:new', newOrder);
  }

  const responsePayload = {
    success: true,
    message: 'Order created successfully',
    data: newOrder,
    order: newOrder,
  };

  if (idempotencyKey) {
    store.setIdempotentResponse(idempotencyKey, responsePayload);
  }

  res.status(201).json(responsePayload);
};

export const getOrderById = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);
  if (!order) {
    throw new AppError(`Order '${id}' not found`, 404, 'NOT_FOUND');
  }
  res.json({ success: true, data: order, order: order });
};

export const getAllOrders = (req: Request, res: Response) => {
  const status = req.query.status as any;
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
  const page = Math.max(1, Number(req.query.page) || 1);

  const { orders, total } = store.getAllOrders(status, limit, page);

  res.json({
    success: true,
    count: orders.length,
    data: orders,
    orders: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const updateStatusSchema = z.object({
  status: z.enum([
    'pending-payment',
    'received',
    'preparing',
    'ready',
    'served',
    'completed',
    'cancelled',
  ]),
});

export const updateOrderStatus = (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid order status', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const { status } = parsed.data;
  const before = store.getOrderById(id);
  const updatedOrder = store.updateOrderStatus(id, status);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'UPDATE_ORDER_STATUS',
      entity: 'Order',
      entityId: id,
      before: { status: before?.status },
      after: { status: updatedOrder.status },
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const io = getIO();
  if (io) {
    io.emit('order:status_updated', updatedOrder);
    io.emit('order:status-changed', { orderId: id, status, order: updatedOrder });
    io.to(`order_${id}`).emit('order:updated', updatedOrder);
    io.to(`order_${id}`).emit('order:status_updated', updatedOrder);
  }

  res.json({
    success: true,
    message: `Order status advanced to ${status}`,
    data: updatedOrder,
  });
};

export const notifyArrival = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);
  if (!order) {
    throw new AppError(`Order '${id}' not found`, 404, 'NOT_FOUND');
  }

  const io = getIO();
  if (io) {
    io.emit('guest:arrived', {
      orderId: id,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      message: `${order.customerName} has arrived at the cafe! Ready to serve.`,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({ success: true, message: 'Kitchen alerted of guest arrival!' });
};
