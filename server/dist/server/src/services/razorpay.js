"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpaySignature = exports.createRazorpayOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
const isPlaceholderKey = KEY_ID.includes('placeholder') || KEY_SECRET.includes('placeholder');
let razorpayInstance = null;
if (!isPlaceholderKey) {
    try {
        razorpayInstance = new razorpay_1.default({
            key_id: KEY_ID,
            key_secret: KEY_SECRET,
        });
    }
    catch (err) {
        console.warn('⚠️ Razorpay initialized in mock mode (placeholder keys detected).');
    }
}
const createRazorpayOrder = async (params) => {
    const amountInPaise = Math.round(params.amountInRupees * 100);
    if (razorpayInstance) {
        try {
            const order = await razorpayInstance.orders.create({
                amount: amountInPaise,
                currency: params.currency || 'INR',
                receipt: params.receipt,
                notes: params.notes || {},
            });
            return {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                key: KEY_ID,
                isMock: false,
            };
        }
        catch (err) {
            console.warn('Razorpay API call failed, falling back to secure test mock order:', err);
        }
    }
    // Graceful test mock order (for testing without live credentials)
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
        id: mockOrderId,
        amount: amountInPaise,
        currency: params.currency || 'INR',
        key: KEY_ID,
        isMock: true,
    };
};
exports.createRazorpayOrder = createRazorpayOrder;
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    // Allow test mock verification
    if (razorpayOrderId.startsWith('order_mock_')) {
        return true;
    }
    try {
        const generatedSignature = crypto_1.default
            .createHmac('sha256', KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');
        return generatedSignature === razorpaySignature;
    }
    catch (err) {
        return false;
    }
};
exports.verifyRazorpaySignature = verifyRazorpaySignature;
