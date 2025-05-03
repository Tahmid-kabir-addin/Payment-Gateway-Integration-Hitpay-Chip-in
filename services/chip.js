const axios = require("axios");
const crypto = require("crypto");
const config = require("../config/chip");
const { v4: uuid } = require("uuid");

/**
 * Create a payment request with Chip
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Chip payment response
 */
async function createPayment(paymentData) {
  try {
    const { 
      amount, 
      currency = "MYR", 
      reference = `ORD-${uuid()}`, 
      description, 
      email,
      name,
      phone
    } = paymentData;

    // Create the request body according to Chip API structure
    const requestData = {
      brand_id: config.brandId,
      client: {
        email: email,
        full_name: name,
        phone_number: phone
      },
      
      purchase: {
        reference: reference,
        amount: amount * 100, 
        currency: currency,
      },
      
      // Products array
      products: [
        {
          name: description || `Order ${reference}`,
          price: amount * 100,
          quantity: 1
        }
      ],
      
      // Redirect URLs
      success_redirect: config.redirectUrl,
      failure_redirect: config.redirectUrl,
      
      // Callback URL - only include if not using localhost
      ...(!/localhost/.test(config.webhookUrl) && {
        success_callback: config.webhookUrl
      })
    };

    console.log("Sending to Chip:", JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      "https://gate.chip-in.asia/api/v1/purchases/",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Chip payment creation failed:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Payment creation failed");
  }
}

/**
 * Verify Chip webhook signature
 * @param {Object} headers - Request headers
 * @param {string} rawBody - Raw request body
 * @returns {boolean} - Whether signature is valid
 */
function verifyWebhookSignature(headers, rawBody) {
  try {
    const signature = headers["x-signature"];

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
 * Get payment status from Chip
 * @param {string} purchaseId - Chip purchase ID
 * @returns {Promise<Object>} - Payment status response
 */
async function getPaymentStatus(purchaseId) {
  try {
    const response = await axios.get(
      `https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`,
      {
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Chip payment status check failed:",
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
