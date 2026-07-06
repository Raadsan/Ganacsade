import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const devLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

class WaafiPayService {
  constructor() {
    this.apiUrl = process.env.WAAFIPAY_API_URL || 'https://api.waafipay.com/asm';
    this.merchantUid = process.env.WAAFIPAY_MERCHANT_UID;
    this.apiUserId = process.env.WAAFIPAY_API_USER_ID;
    this.apiKey = process.env.WAAFIPAY_API_KEY;
    this.storeId = process.env.WAAFIPAY_STORE_ID;
    this.hppKey = process.env.WAAFIPAY_HPP_KEY;
  }

  /**
   * Format phone number to WaafiPay format (252XXXXXXXXX)
   * Removes +, spaces, and leading zeros
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 00, remove it
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }

    // If already has 252 prefix (12 digits total), use as is
    if (cleaned.startsWith('252') && cleaned.length === 12) {
      return cleaned;
    }

    // If starts with 252 but wrong length, strip it and re-add
    if (cleaned.startsWith('252')) {
      cleaned = cleaned.substring(3);
    }

    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Add 252 prefix
    return `252${cleaned}`;
  }

  /**
   * Process a purchase payment using PreAuthorize + Commit flow
   * This is the recommended approach for better user experience
   * Step 1: PreAuthorize - Sends USSD popup, user enters PIN, holds funds
   * Step 2: Commit - Completes the transaction
   *
   * @param {Object} params - Payment parameters
   * @param {string} params.phoneNumber - Customer's phone number
   * @param {number} params.amount - Amount to charge
   * @param {string} params.currency - Currency (USD, default)
   * @param {string} params.referenceId - Order reference ID
   * @param {string} params.description - Payment description
   * @returns {Promise<Object>} - Payment result
   */
  async purchase({ phoneNumber, amount, currency = 'USD', referenceId, description }) {
    // Step 1: PreAuthorize - This sends USSD popup to user's phone
    const preAuthResult = await this.preAuthorize({
      phoneNumber,
      amount,
      currency,
      referenceId,
      description,
    });

    if (!preAuthResult.success) {
      return preAuthResult;
    }

    // Step 2: Commit the transaction to complete the payment
    const commitResult = await this.commitTransaction({
      transactionId: preAuthResult.transactionId,
      referenceId: preAuthResult.referenceId,
      description: `Payment committed for order #${referenceId}`,
    });

    return commitResult;
  }

  /**
   * PreAuthorize - Sends USSD popup to user, holds funds after PIN entry
   */
  async preAuthorize({ phoneNumber, amount, currency = 'USD', referenceId, description }) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp,
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE',
      serviceParams: {
        merchantUid: this.merchantUid,
        apiUserId: this.apiUserId,
        apiKey: this.apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: this.formatPhoneNumber(phoneNumber),
        },
        transactionInfo: {
          referenceId: referenceId.toString(),
          invoiceId: referenceId.toString(),
          amount: parseFloat(amount),
          currency,
          description: description || `Payment for order #${referenceId}`,
        },
      },
    };

    try {
      devLog('WaafiPay PreAuthorize Request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minute timeout for user to enter PIN
      });

      devLog('WaafiPay PreAuthorize Response:', JSON.stringify(response.data, null, 2));

      const {
        responseCode, responseMsg, params, errorCode,
      } = response.data;

      // Check if preauthorization was successful
      if (responseCode === '2001' && (params?.state === 'APPROVED' || params?.state === 'approved')) {
        return {
          success: true,
          transactionId: params.transactionId,
          issuerTransactionId: params.issuerTransactionId,
          referenceId: params.referenceId,
          amount: params.txAmount,
          accountNo: params.accountNo,
          state: params.state,
          message: 'PreAuthorization successful',
        };
      }
      return {
        success: false,
        errorCode: errorCode || responseCode,
        message: responseMsg || 'Payment failed',
        state: params?.state || 'FAILED',
      };
    } catch (error) {
      console.error('WaafiPay PreAuthorize Error:', error.message);

      if (error.response) {
        return {
          success: false,
          errorCode: error.response.data?.errorCode || 'NETWORK_ERROR',
          message: error.response.data?.responseMsg || 'Payment request failed',
          state: 'FAILED',
        };
      }

      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
        state: 'FAILED',
      };
    }
  }

  /**
   * Commit a preauthorized transaction to complete the payment
   */
  async commitTransaction({ transactionId, referenceId, description }) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp,
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE_COMMIT',
      serviceParams: {
        merchantUid: this.merchantUid,
        apiUserId: this.apiUserId,
        apiKey: this.apiKey,
        transactionId: transactionId.toString(),
        referenceId: referenceId.toString(),
        description: description || 'Transaction committed',
      },
    };

    try {
      devLog('WaafiPay Commit Request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      devLog('WaafiPay Commit Response:', JSON.stringify(response.data, null, 2));

      const {
        responseCode, responseMsg, params, errorCode,
      } = response.data;

      if (responseCode === '2001' && (params?.state === 'approved' || params?.state === 'APPROVED')) {
        return {
          success: true,
          transactionId: params.transactionId,
          referenceId: params.referenceId,
          message: 'Payment successful',
        };
      }
      return {
        success: false,
        errorCode: errorCode || responseCode,
        message: responseMsg || 'Payment commit failed',
        state: params?.state || 'FAILED',
      };
    } catch (error) {
      console.error('WaafiPay Commit Error:', error.message);

      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
        state: 'FAILED',
      };
    }
  }

  /**
   * Cancel a preauthorized transaction (if user loses connection or cancels)
   */
  async cancelTransaction({ transactionId, referenceId, description }) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp,
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE_CANCEL',
      serviceParams: {
        merchantUid: this.merchantUid,
        apiUserId: this.apiUserId,
        apiKey: this.apiKey,
        transactionId: transactionId.toString(),
        referenceId: referenceId.toString(),
        description: description || 'Transaction cancelled',
      },
    };

    try {
      devLog('WaafiPay Cancel Request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      devLog('WaafiPay Cancel Response:', JSON.stringify(response.data, null, 2));

      const { responseCode, responseMsg, params } = response.data;

      return {
        success: responseCode === '2001',
        transactionId: params?.transactionId,
        message: responseMsg,
      };
    } catch (error) {
      console.error('WaafiPay Cancel Error:', error.message);
      return {
        success: false,
        message: error.message || 'Cancel request failed',
      };
    }
  }

  /**
   * Reverse/Cancel a purchase (within 24 hours, before settlement)
   * @param {string} transactionId - Original transaction ID
   * @param {string} description - Reason for reversal
   * @returns {Promise<Object>} - Reversal result
   */
  async reversePurchase(transactionId, description = 'Order cancelled') {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp,
      channelName: 'WEB',
      serviceName: 'API_REVERSAL',
      serviceParams: {
        merchantUid: this.merchantUid,
        apiUserId: this.apiUserId,
        apiKey: this.apiKey,
        transactionId,
        description,
      },
    };

    try {
      devLog('WaafiPay Reversal Request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      devLog('WaafiPay Reversal Response:', JSON.stringify(response.data, null, 2));

      const {
        responseCode, responseMsg, params, errorCode,
      } = response.data;

      if (responseCode === '2001' && params?.state?.toLowerCase() === 'approved') {
        return {
          success: true,
          transactionId: params.transactionId,
          referenceId: params.referenceId,
          message: 'Reversal successful',
        };
      }
      return {
        success: false,
        errorCode: errorCode || responseCode,
        message: responseMsg || 'Reversal failed',
      };
    } catch (error) {
      console.error('WaafiPay Reversal Error:', error.message);

      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      };
    }
  }

  /**
   * HPP (Hosted Payment Page) - Redirects user to WaafiPay's secure page
   * This bypasses the pre-balance check issue
   */
  async initiateHPP({
    phoneNumber, amount, currency = 'USD', referenceId, description, successUrl, failureUrl,
  }) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp,
      channelName: 'WEB',
      serviceName: 'HPP_PURCHASE',
      serviceParams: {
        merchantUid: this.merchantUid,
        storeId: this.storeId,
        hppKey: this.hppKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        hppSuccessCallbackUrl: successUrl,
        hppFailureCallbackUrl: failureUrl,
        hppRespDataFormat: 1,
        payerInfo: {
          subscriptionId: this.formatPhoneNumber(phoneNumber),
        },
        transactionInfo: {
          referenceId: referenceId.toString(),
          amount: parseFloat(amount),
          currency,
          description: description || `Payment for order #${referenceId}`,
        },
      },
    };

    try {
      devLog('WaafiPay HPP Request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      devLog('WaafiPay HPP Response:', JSON.stringify(response.data, null, 2));

      const {
        responseCode, responseMsg, params, errorCode,
      } = response.data;

      if (responseCode === '2001') {
        return {
          success: true,
          hppUrl: params.hppUrl,
          directPaymentLink: params.directPaymentLink,
          orderId: params.orderId,
          referenceId: params.referenceId,
          message: 'HPP initiated successfully',
        };
      }
      return {
        success: false,
        errorCode: errorCode || responseCode,
        message: responseMsg || 'HPP initiation failed',
      };
    } catch (error) {
      console.error('WaafiPay HPP Error:', error.message);

      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      };
    }
  }

  /**
   * Get HPP transaction info to check payment status
   */
  async getHPPTransactionInfo(orderId) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp,
      channelName: 'WEB',
      serviceName: 'HPP_GETORDERINFO',
      serviceParams: {
        merchantUid: this.merchantUid,
        storeId: this.storeId,
        hppKey: this.hppKey,
        orderId: orderId.toString(),
      },
    };

    try {
      devLog('WaafiPay HPP GetOrderInfo Request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      devLog('WaafiPay HPP GetOrderInfo Response:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error('WaafiPay HPP GetOrderInfo Error:', error.message);
      return null;
    }
  }
}

export default new WaafiPayService();
