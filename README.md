# Payment Gateway Integration

A Node.js Express server that integrates multiple payment gateways (HitPay and Chip) to provide a unified payment processing solution.

## Features

- **Multiple Payment Gateways**:
  - HitPay (Singapore-based payment gateway)
  - Chip (Malaysia-based payment gateway)
- **Comprehensive API**: RESTful endpoints for payment creation, status checking
- **Frontend Demo**: Simple UI for testing payment flows
- **Error Handling**: Robust error handling and logging

## Frontend Testing Interface

For testing purposes, the project includes a simple frontend interface in `public/index.html`. This interface provides:

- A form to enter payment details (amount, currency, customer information)
- Buttons to test both HitPay and Chip payment gateways
- Visual feedback on payment status
- Easy testing of the complete payment flow

To access the testing interface, simply run the server and navigate to `http://localhost:3000` in your browser.

## Architecture

The project follows a modular architecture:

- **Routes**: API endpoints for each payment gateway
- **Services**: Business logic for payment processing
- **Config**: Configuration for each payment gateway
- **Public**: Frontend demo for testing

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- Payment gateway accounts:
  - [HitPay](https://www.hitpayapp.com/) account
  - [Chip](https://www.chip-in.asia/) account

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env` file with the following variables:

```
# Server Configuration
PORT=3000

# HitPay Configuration
HITPAY_API_KEY=your_hitpay_api_key
HITPAY_API_ENDPOINT=https://api.hit-pay.com/v1

# Chip Configuration
CHIP_API_ENDPOINT=https://gate.chip-in.asia/api/v1
CHIP_BRAND_ID=your_chip_brand_id
CHIP_SECRET_KEY=your_chip_secret_key

# General Configuration
REDIRECT_URL=http://localhost:3000/payment/callback
REDIRECT_URL_SUCCESS=http://localhost:3000/payment/success
REDIRECT_URL_FAILURE=http://localhost:3000/payment/failure
```

## Usage

### Starting the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### HitPay

- **Create Payment**

  - `POST /api/hitpay/create-payment`
  - Request Body:
    ```json
    {
      "amount": 10.0,
      "currency": "SGD",
      "reference": "ORDER-123456",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+1234567890"
    }
    ```
  - Response:
    ```json
    {
      "url": "https://hit-pay.com/payment-link",
      "id": "payment_id"
    }
    ```
### Chip

- **Create Payment**

  - `POST /api/chip/create-payment`
  - Request Body:
    ```json
    {
      "amount": 10.0,
      "email": "customer@example.com",
      "name": "Customer Name"
    }
    ```
  - Response:
    ```json
    {
      "checkout_url": "https://gate.chip-in.asia/checkout/..."
    }
    ```

### Centralized Callback

The application now uses centralized routes for handling callbacks:

- **Payment Callback**: `GET /payment/callback`

  - Automatically detects the payment gateway based on query parameters
  - Redirects to the appropriate gateway-specific handler

## Project Structure

The project structure has been simplified:

```
/
├── config/                 # Configuration files
│   ├── hitpay.js           # HitPay configuration
│   └── chip.js             # Chip configuration
├── public/                 # Static frontend files
│   └── index.html          # Demo payment form with loading indicator
├── routes/                 # API routes
│   ├── hitpay.js           # HitPay routes (simplified)
│   └── chip.js             # Chip routes (using fetch API)
├── services/               # Business logic
│   ├── hitpay.js           # HitPay service
│   └── chip.js             # Chip service
├── index.js                # Main application with centralized routing
├── .env                    # Environment variables
└── package.json            # Dependencies and scripts
```

## Implementation Notes

- The Chip integration now uses the native `fetch` API instead of axios
- A loading indicator has been added to the frontend for better UX
- The application automatically detects which payment gateway to use for callbacks

## Security Considerations

- **API Keys**: Keep your API keys and secrets secure in the `.env` file
- **HTTPS**: Use HTTPS in production to secure data transmission
- **Input Validation**: All inputs are validated before processing

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Proper HTTP status codes and error messages
- **Payment Gateway Errors**: Detailed error messages from the payment gateways
- **Logging**: Console logging for debugging

## Troubleshooting

### Common Issues

- **Payment Creation Failed**: Check your API keys and request format

### Debugging

- Check the console logs for detailed error messages
- Verify your `.env` configuration
- Test with the frontend demo to isolate issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [HitPay](https://www.hitpayapp.com/) for their payment gateway API
- [Chip](https://www.chip-in.asia/) for their payment gateway API
- [Express](https://expressjs.com/) for the web framework
- [Node.js](https://nodejs.org/) for the runtime environment
