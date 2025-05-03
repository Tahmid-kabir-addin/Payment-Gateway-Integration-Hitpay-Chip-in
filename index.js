const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const hitpayRoutes = require("./routes/hitpay");
const chipRoutes = require("./routes/chip");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/chip/webhook", express.raw({ type: "application/json" }));

// Routes
app.use("/api/hitpay", hitpayRoutes);
app.use("/api/chip", chipRoutes);

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Payment callback routes
app.get("/payment/callback", (req, res) => {
  // The gateway can come in the query string directly or in the reference (HitPay) or payment ID
  const gateway =
    req.query.gateway ||
    (req.query.reference && req.query.reference.includes("hitpay")
      ? "hitpay"
      : req.query.id && req.query.id.includes("chip")
      ? "chip"
      : null);

  if (gateway === "hitpay") {
    res.redirect(
      "/api/hitpay/callback?" + new URLSearchParams(req.query).toString()
    );
  } else if (gateway === "chip") {
    res.redirect(
      "/api/chip/callback?" + new URLSearchParams(req.query).toString()
    );
  } else {
    // If no gateway is specified, try to determine from the parameters
    if (req.query.reference) {
      // Likely HitPay
      res.redirect(
        "/api/hitpay/callback?" + new URLSearchParams(req.query).toString()
      );
    } else if (req.query.id) {
      // Likely Chip
      res.redirect(
        "/api/chip/callback?" + new URLSearchParams(req.query).toString()
      );
    } else {
      res.send("Unable to determine payment gateway");
    }
  }
});

// Global webhook handler
app.post("/payment/webhook", (req, res) => {
  const gateway = req.query.gateway;

  if (gateway === "hitpay") {
    res.redirect(307, "/api/hitpay/webhook");
  } else if (gateway === "chip") {
    res.redirect(307, "/api/chip/webhook");
  } else {
    res.status(400).send("Invalid payment gateway");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
