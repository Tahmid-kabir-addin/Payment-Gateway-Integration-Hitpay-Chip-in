const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  apiKey: process.env.CHIP_API_KEY,
  apiEndpoint: process.env.CHIP_API_ENDPOINT,
  webhookSecret: process.env.CHIP_WEBHOOK_SECRET,
  secretKey: process.env.CHIP_SECRET_KEY,
  brandId: process.env.CHIP_BRAND_ID,
  redirectUrl: process.env.REDIRECT_URL,
  webhookUrl: process.env.WEBHOOK_URL,
};
