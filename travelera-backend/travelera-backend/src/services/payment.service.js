const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require("../config/env");
const crypto = require("crypto");
const logger = require("../utils/logger");

let razorpayInstance = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  const Razorpay = require("razorpay");
  razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
} else {
  logger.warn("Razorpay keys not configured — payment routes run in MOCK mode (auto-success).");
}

async function createOrder({ amount, currency = "INR", receipt }) {
  if (!razorpayInstance) {
    // Mock order for local/dev testing without real Razorpay keys
    return {
      id: `mock_order_${Date.now()}`,
      amount: amount * 100,
      currency,
      receipt,
      mocked: true
    };
  }

  const order = await razorpayInstance.orders.create({
    amount: amount * 100, // paise
    currency,
    receipt
  });
  return order;
}

function verifySignature({ orderId, paymentId, signature }) {
  if (!RAZORPAY_KEY_SECRET) {
    // Mock mode — always valid so the booking flow can be tested end-to-end
    return true;
  }
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

module.exports = { createOrder, verifySignature };
