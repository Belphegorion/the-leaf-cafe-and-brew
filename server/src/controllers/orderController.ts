import { Request, Response } from 'express';
import { store } from '../services/store';
import { Order, OrderItemPayload, OrderStatus } from '../../../shared/types';
import { io } from '../server';

export const createOrder = (req: Request, res: Response) => {
  const {
    orderType,
    tableNumber,
    customerName,
    customerPhone,
    customerEmail,
    items,
    tipAmount = 0,
    couponCode,
    scheduledArrivalTime,
    paymentMethod = 'razorpay',
  } = req.body;

  if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid order payload: items and contact info required.' });
  }

  // Server-side recalculation of every item
  let subtotal = 0;
  const verifiedItems: OrderItemPayload[] = [];

  for (const clientItem of items) {
    const menuItem = store.getMenuItemById(clientItem.menuItemId);
    if (!menuItem) {
      return res.status(400).json({ success: false, message: `Menu item ${clientItem.menuItemId} does not exist.` });
    }
    if (!menuItem.isAvailable) {
      return res.status(400).json({ success: false, message: `${menuItem.name} is currently sold out.` });
    }

    // Calculate customizations price delta
    let customDelta = 0;
    if (clientItem.selectedCustomizations && Array.isArray(clientItem.selectedCustomizations)) {
      customDelta = clientItem.selectedCustomizations.reduce((acc: number, c: any) => acc + (c.priceDelta || 0), 0);
    }

    const unitPrice = menuItem.price + customDelta;
    const qty = Math.max(1, clientItem.quantity || 1);
    const itemTotal = unitPrice * qty;

    subtotal += itemTotal;

    verifiedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: qty,
      unitPrice,
      selectedCustomizations: clientItem.selectedCustomizations || [],
      specialInstructions: clientItem.specialInstructions,
      itemTotal,
    });
  }

  // Calculate discounts
  let discountAmount = 0;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    if (code === 'LEAF10') {
      discountAmount = Math.round(subtotal * 0.1);
    } else if (code === 'BHOPALBEATS') {
      discountAmount = 100;
    }
  }

  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = Math.max(0, subtotal + gstAmount + (Number(tipAmount) || 0) - discountAmount);

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber: orderId,
    orderType: orderType || 'dine-in-table',
    tableNumber: tableNumber ? Number(tableNumber) : undefined,
    customerName,
    customerPhone,
    customerEmail,
    items: verifiedItems,
    subtotal,
    gstAmount,
    tipAmount: Number(tipAmount) || 0,
    discountAmount,
    couponCode,
    totalAmount,
    status: paymentMethod === 'pay-at-counter' || paymentMethod === 'running-tab' ? 'received' : 'pending-payment',
    estimatedPrepMinutes: 18,
    scheduledArrivalTime,
    paymentMethod,
    paymentStatus: paymentMethod === 'pay-at-counter' || paymentMethod === 'running-tab' ? 'pending' : 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.createOrder(newOrder);

  // Broadcast to KDS / staff dashboard via Socket.IO
  if (io) {
    io.emit('order:new', newOrder);
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: newOrder,
  });
};

export const getOrderById = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order, order: order });
};

export const getAllOrders = (_req: Request, res: Response) => {
  const orders = store.getAllOrders();
  res.json({ success: true, count: orders.length, data: orders, orders: orders });
};

export const updateOrderStatus = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = [
    'pending-payment',
    'received',
    'preparing',
    'ready',
    'served',
    'completed',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const updatedOrder = store.updateOrderStatus(id, status);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (io) {
    io.emit('order:status-changed', { orderId: id, status, order: updatedOrder });
  }

  res.json({ success: true, message: `Order status updated to ${status}`, data: updatedOrder });
};

export const notifyArrival = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (io) {
    io.emit('guest:arrived', {
      orderId: id,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      message: `${order.customerName} has arrived at the cafe! Ready to serve.`,
    });
  }

  res.json({ success: true, message: 'Kitchen alerted of guest arrival!' });
};
