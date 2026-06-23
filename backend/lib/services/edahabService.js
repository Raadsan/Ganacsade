import crypto from 'crypto';
import axios from 'axios';

/**
 * eDahab Payment Service
 * Integrates with eDahab API for mobile wallet payments
 * Documentation: https://edahab.net/api
 */
class EdahabService {
  constructor() {
    this.apiKey = process.env.EDAHAB_API_KEY;
    this.apiSecret = process.env.EDAHAB_API_SECRET;
    this.agentCode = process.env.EDAHAB_AGENT_CODE;
    this.baseUrl = process.env.EDAHAB_API_URL || 'https://edahab.net/api/api';

    // Sandbox URL for testing
    // this.baseUrl = 'https://edahab.net/sandbox/api';
  }

  /**
   * Generate SHA256 hash for API authentication
   * Hash = SHA256(rawBodyString + apiSecret)
   * Must use the exact same string that is sent as the request body.
   */
  generateHash(rawBodyString) {
    const textToHash = rawBodyString + this.apiSecret;
    return crypto.createHash('sha256').update(textToHash).digest('hex');
  }

  /**
   * Format phone number for eDahab (remove country code, just local number)
   * eDahab expects: 65####### or 659######
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.toString().replace(/\D/g, '');

    // Remove country code 252 if present
    if (cleaned.startsWith('252')) {
      cleaned = cleaned.substring(3);
    }

    // Remove leading zero if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    console.log(`eDahab: Formatted phone ${phoneNumber} -> ${cleaned}`);
    return cleaned;
  }

  /**
   * Issue Invoice - Create a payment request
   * This sends a USSD push notification to the customer's phone
   *
   * @param {Object} params
   * @param {string} params.phoneNumber - Customer's eDahab phone number
   * @param {number} params.amount - Amount to charge
   * @param {string} params.currency - USD or SLSH (default: USD)
   * @param {string} params.returnUrl - URL to redirect after payment (optional)
   */
  async issueInvoice({ phoneNumber, amount, currency = 'USD', returnUrl = null }) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const bodyObj = {
        apiKey: this.apiKey,
        edahabNumber: formattedPhone,
        amount: parseFloat(amount),
        agentCode: this.agentCode,
        currency,
      };

      // Add return URL if provided
      if (returnUrl) {
        bodyObj.returnUrl = returnUrl;
      }

      const bodyString = JSON.stringify(bodyObj);
      const hash = this.generateHash(bodyString);
      const url = `${this.baseUrl}/issueinvoice?hash=${hash}`;

      console.log('eDahab IssueInvoice Request:', {
        url,
        body: { ...bodyObj, apiKey: bodyObj.apiKey ? `${bodyObj.apiKey.substring(0, 8)}***` : 'MISSING' },
        agentCode: this.agentCode || 'MISSING',
        apiKeySet: !!this.apiKey,
        apiSecretSet: !!this.apiSecret,
      });

      const response = await axios.post(url, bodyString, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minutes timeout for USSD response
      });

      console.log('eDahab IssueInvoice Response:', response.data);

      // Check response status
      if (response.data.StatusCode === 0) {
        // Success - Invoice created, waiting for customer to pay
        return {
          success: true,
          invoiceStatus: response.data.InvoiceStatus,
          transactionId: response.data.TransactionId,
          invoiceId: response.data.invoiceId || response.data.InvoiceId,
          message: 'Invoice created successfully',
        };
      }
      // Error occurred
      return {
        success: false,
        statusCode: response.data.StatusCode,
        message: response.data.StatusDescription || this.getStatusMessage(response.data.StatusCode),
        validationErrors: response.data.ValidationErrors,
      };
    } catch (error) {
      console.error('eDahab IssueInvoice Error:', error.message);

      if (error.response) {
        console.error('eDahab Error Response:', error.response.data);
        return {
          success: false,
          message: error.response.data?.StatusDescription || 'Payment request failed',
          statusCode: error.response.data?.StatusCode,
        };
      }

      return {
        success: false,
        message: error.message || 'Failed to connect to eDahab',
      };
    }
  }

  /**
   * Check Invoice Status - Verify if payment was completed
   *
   * @param {string} invoiceId - The invoice ID returned from IssueInvoice
   */
  async checkInvoiceStatus(invoiceId) {
    try {
      const bodyObj = {
        apiKey: this.apiKey,
        invoiceId,
      };

      const bodyString = JSON.stringify(bodyObj);
      const hash = this.generateHash(bodyString);
      const url = `${this.baseUrl}/CheckInvoiceStatus?hash=${hash}`;

      console.log('eDahab CheckInvoiceStatus Request:', { url, invoiceId });

      const response = await axios.post(url, bodyString, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      console.log('eDahab CheckInvoiceStatus Response:', response.data);

      if (response.data.StatusCode === 0) {
        return {
          success: true,
          invoiceStatus: response.data.InvoiceStatus, // "Paid", "Unpaid", "Invalid"
          transactionId: response.data.TransactionId,
          invoiceId: response.data.invoiceId || response.data.InvoiceId,
          isPaid: response.data.InvoiceStatus === 'Paid',
        };
      }
      return {
        success: false,
        statusCode: response.data.StatusCode,
        message: response.data.StatusDescription || this.getStatusMessage(response.data.StatusCode),
      };
    } catch (error) {
      console.error('eDahab CheckInvoiceStatus Error:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to check invoice status',
      };
    }
  }

  /**
   * Agent Payment (Credit) - Send money to a phone number
   * This deducts from your merchant account and credits the customer
   *
   * @param {Object} params
   * @param {string} params.phoneNumber - Recipient's phone number
   * @param {number} params.amount - Amount to send
   * @param {string} params.transactionId - Unique transaction ID from your system
   * @param {string} params.currency - USD or SLSH
   */
  async agentPayment({ phoneNumber, amount, transactionId, currency = 'USD' }) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const bodyObj = {
        apiKey: this.apiKey,
        transactionAmount: parseFloat(amount),
        phoneNumber: formattedPhone,
        transactionId,
        currency,
      };

      const bodyString = JSON.stringify(bodyObj);
      const hash = this.generateHash(bodyString);
      const url = `${this.baseUrl}/agentPayment?hash=${hash}`;

      console.log('eDahab AgentPayment Request:', {
        url,
        body: { ...bodyObj, apiKey: '***' },
      });

      const response = await axios.post(url, bodyString, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });

      console.log('eDahab AgentPayment Response:', response.data);

      if (response.data.TransactionStatus === 'Approved') {
        return {
          success: true,
          transactionStatus: response.data.TransactionStatus,
          transactionMessage: response.data.TransactionMesage,
          phoneNumber: response.data.PhoneNumber,
          transactionId: response.data.TransactionId,
        };
      }
      return {
        success: false,
        transactionStatus: response.data.TransactionStatus,
        message: response.data.TransactionMesage || 'Payment failed',
      };
    } catch (error) {
      console.error('eDahab AgentPayment Error:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to process agent payment',
      };
    }
  }

  /**
   * Process payment - Main method for checkout
   * Issues invoice and waits for customer to pay via USSD
   */
  async purchase({ phoneNumber, amount, currency = 'USD', referenceId }) {
    console.log(`eDahab: Processing payment for ${phoneNumber}, amount: ${amount} ${currency}`);

    // Issue the invoice - this sends USSD to customer
    const invoiceResult = await this.issueInvoice({
      phoneNumber,
      amount,
      currency,
    });

    if (!invoiceResult.success) {
      return invoiceResult;
    }

    // For push/USSD method, the InvoiceStatus in the response indicates if paid
    // "Paid" = customer entered PIN and payment completed
    // "Unpaid" = customer hasn't responded yet or cancelled
    if (invoiceResult.invoiceStatus === 'Paid') {
      return {
        success: true,
        transactionId: invoiceResult.transactionId,
        invoiceId: invoiceResult.invoiceId,
        referenceId,
        amount,
        message: 'Payment successful',
      };
    }
    // Payment not completed (customer cancelled or timeout)
    return {
      success: false,
      invoiceId: invoiceResult.invoiceId,
      invoiceStatus: invoiceResult.invoiceStatus,
      message: 'Payment was not completed. Please try again.',
      errorCode: 'PAYMENT_NOT_COMPLETED',
    };
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(statusCode) {
    const messages = {
      0: 'Success',
      1: 'API Error - An error occurred on the API',
      2: 'Invalid JSON - The request JSON was invalid',
      3: 'Validation Error - Request failed validation',
      4: 'Invalid API Credentials',
      5: 'Insufficient Customer Balance',
      6: 'Invoice Not Found',
    };
    return messages[statusCode] || 'Unknown error';
  }
}

export default new EdahabService();
