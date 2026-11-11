"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
const store_1 = require("../services/store");
const razorpay_1 = require("../services/razorpay");
const server_1 = require("../server");
const createPaymentOrder = async (req, res) => {
    const { orderId } = req.body;
    const order = store_1.store.getOrderById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    try {
        const rzpOrder = await (0, razorpay_1.createRazorpayOrder)({
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to initiate Razorpay order', error: err.message });
    }
};
exports.createPaymentOrder = createPaymentOrder;
const verifyPayment = (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = store_1.store.getOrderById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const isValid = (0, razorpay_1.verifyRazorpaySignature)(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
        order.paymentStatus = 'failed';
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    // Update order as captured and received
    order.paymentStatus = 'captured';
    order.status = 'received';
    order.razorpayPaymentId = razorpayPaymentId;
    order.updatedAt = new Date().toISOString();
    if (server_1.io) {
        server_1.io.emit('order:payment-captured', { orderId: order.id, paymentId: razorpayPaymentId, order });
    }
    res.json({
        success: true,
        message: 'Payment verified and captured successfully',
        data: order,
    });
};
exports.verifyPayment = verifyPayment;
