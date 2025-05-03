/**
 * POST /api/payments/create-payment
 *
 * Body → { amount: 125.50,  email: "foo@bar.com", name: "Foo Bar" }
 * Resp ← { checkout_url: "https://gate.chip-in.asia/checkout/…" }
 */

require("dotenv").config();
const express = require("express");
const { v4: uuid } = require("uuid");

const fetch =
  global.fetch ||
  ((...a) => import("node-fetch").then(({ default: f }) => f(...a)));

const router = express.Router();

router.post("/create-payment", async (req, res) => {
  try {
    const { amount, email, name } = req.body;
    const currency = "MYR"; // CHIP supports MYR only for settlement

    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Bad amount" });

    /* ---------- 1. Prepare order data ---------- */
    const reference = `ORD-${uuid()}`; // unique idempotency key
    const priceMinor = Math.round(amount * 100); // 1.23 RM → 123 (minor units)

    const body = {
      brand_id: process.env.CHIP_BRAND_ID, // from Developers › Brands
      reference,

      /* *** Redirects must sit on port 80/443 *** */
      success_redirect: process.env.REDIRECT_URL_SUCCESS,
      failure_redirect: process.env.REDIRECT_URL_FAILURE,

      /* Server-to-server callback — must also be :80/443 */
      success_callback: process.env.CALLBACK_URL,

      /* ---------- REQUIRED “purchase” wrapper ---------- */
      purchase: {
        currency,
        products: [
          {
            name: `Order ${reference}`,
            price: priceMinor,
            quantity: 1,
          },
        ],
      },

      /* Optional — let CHIP e-mail the receipt */
      client: email ? { email, full_name: name } : undefined,
    };

    /* ---------- 2. Call CHIP ---------- */
    const response = await fetch(
      "https://gate.chip-in.asia/api/v1/purchases/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHIP_SECRET_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": reference, // safe automatic retries
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const apiErr = await response.json().catch(() => ({}));
      console.error("Chip API error:", apiErr);
      return res
        .status(502)
        .json({ error: "Chip rejected request", details: apiErr });
    }

    const { checkout_url } = await response.json();
    return res.json({ checkout_url }); // front-end redirects here
  } catch (err) {
    console.error("Error creating Chip payment:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
