const express = require("express");
const router = express.Router();
const hitpayService = require("../services/hitpay");

// Create a HitPay payment
router.post("/create-payment", async (req, res) => {
  try {
    const paymentData = req.body;

    // Validate required fields
    if (!paymentData.amount || !paymentData.reference) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const payment = await hitpayService.createPayment(paymentData);
    res.json(payment);
  } catch (error) {
    console.error("Error creating HitPay payment:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
