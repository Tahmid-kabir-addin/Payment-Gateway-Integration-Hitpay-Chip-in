const axios = require("axios");
const crypto = require("crypto");
const config = require("../config/hitpay");

/**
 * Create a payment request with HitPay
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - HitPay payment response
 */
async function createPayment(paymentData) {
  try {
    const { amount, currency, reference, name, email, phone } = paymentData;

    const requestData = {
      amount,
      currency: currency || "SGD",
      reference_number: reference,
      redirect_url: config.redirectUrl,
      // Only include webhook URL if it's not localhost (HitPay doesn't accept localhost webhooks)
      ...(!/localhost/.test(config.webhookUrl) && {
        webhook: config.webhookUrl,
      }),
      email: email,
      name: name,
      phone: phone,
    };

    const response = await axios.post(
      `${config.apiEndpoint}/payment-requests`,
      requestData,
      {
        headers: {
          "X-BUSINESS-API-KEY": config.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "HitPay payment creation failed:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Payment creation failed");
  }
}

/**
 * Verify HitPay webhook signature
 * @param {Object} headers - Request headers
 * @param {string} rawBody - Raw request body
 * @returns {boolean} - Whether signature is valid
 */
function verifyWebhookSignature(headers, rawBody) {
  try {
    const signature = headers["x-hitpay-signature"];

    if (!signature) {
      return false;
    }

    const hmac = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(rawBody)
      .digest("hex");

    return hmac === signature;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Get payment status from HitPay
 * @param {string} paymentId - HitPay payment ID
 * @returns {Promise<Object>} - Payment status response
 */
async function getPaymentStatus(paymentId) {
  try {
    const response = await axios.get(
      `${config.apiEndpoint}/payment-requests/${paymentId}`,
      {
        headers: {
          "X-BUSINESS-API-KEY": config.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "HitPay payment status check failed:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Payment status check failed"
    );
  }
}

module.exports = {
  createPayment,
  verifyWebhookSignature,
  getPaymentStatus,
};
