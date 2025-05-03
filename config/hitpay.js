const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  apiKey: process.env.HITPAY_API_KEY,
  apiEndpoint: process.env.HITPAY_API_ENDPOINT,
  webhookSecret: process.env.HITPAY_WEBHOOK_SECRET,
  redirectUrl: process.env.REDIRECT_URL,
  webhookUrl: process.env.WEBHOOK_URL,
};
