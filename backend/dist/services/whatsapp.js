"use strict";
/**
 * WhatsApp Notification Service
 * Uses Twilio WhatsApp API for COD booking notifications
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCustomWhatsAppMessage = exports.sendWhatsAppNotification = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importStar(require("../config/env"));
/**
 * Send WhatsApp notification for COD bookings
 */
const sendWhatsAppNotification = async ({ booking, service, }) => {
    // Check if WhatsApp is configured
    if (!(0, env_1.isWhatsAppConfigured)()) {
        console.warn('⚠️ WhatsApp credentials not configured. Skipping notification.');
        return {
            success: false,
            message: 'WhatsApp not configured',
        };
    }
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, SALON_WHATSAPP_NUMBER, } = env_1.default;
    const appointmentDate = new Date(booking.appointment_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const message = `🌟 *NEW SALON BOOKING (Pay at Salon)*

📋 *Booking #:* ${booking.booking_number}
👤 *Customer:* ${booking.customer_name}
📞 *Phone:* ${booking.customer_phone}
${booking.customer_email ? `📧 *Email:* ${booking.customer_email}` : ''}

✂️ *Service:* ${service.name}
💰 *Amount:* ₹${service.price}
⏱️ *Duration:* ${service.duration_minutes} mins

📅 *Date:* ${appointmentDate}
🕐 *Time:* ${booking.appointment_time}

📍 *Address:* ${booking.address}${booking.city ? `, ${booking.city}` : ''}${booking.pincode ? ` - ${booking.pincode}` : ''}

${booking.notes ? `📝 *Notes:* ${booking.notes}` : ''}

_Please confirm this appointment with the customer._`;
    try {
        const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, new URLSearchParams({
            From: TWILIO_WHATSAPP_FROM,
            To: SALON_WHATSAPP_NUMBER,
            Body: message,
        }), {
            auth: {
                username: TWILIO_ACCOUNT_SID,
                password: TWILIO_AUTH_TOKEN,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log('✅ WhatsApp notification sent:', response.data.sid);
        return {
            success: true,
            data: {
                sid: response.data.sid,
                status: response.data.status,
            },
            message: 'WhatsApp notification sent successfully',
        };
    }
    catch (error) {
        console.error('❌ WhatsApp notification error:', error);
        throw error;
    }
};
exports.sendWhatsAppNotification = sendWhatsAppNotification;
/**
 * Send custom WhatsApp message
 */
const sendCustomWhatsAppMessage = async (to, message) => {
    if (!(0, env_1.isWhatsAppConfigured)()) {
        return {
            success: false,
            message: 'WhatsApp not configured',
        };
    }
    try {
        const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${env_1.default.TWILIO_ACCOUNT_SID}/Messages.json`, new URLSearchParams({
            From: env_1.default.TWILIO_WHATSAPP_FROM,
            To: to,
            Body: message,
        }), {
            auth: {
                username: env_1.default.TWILIO_ACCOUNT_SID,
                password: env_1.default.TWILIO_AUTH_TOKEN,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return {
            success: true,
            data: {
                sid: response.data.sid,
            },
            message: 'Message sent successfully',
        };
    }
    catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        throw error;
    }
};
exports.sendCustomWhatsAppMessage = sendCustomWhatsAppMessage;
exports.default = { sendWhatsAppNotification: exports.sendWhatsAppNotification, sendCustomWhatsAppMessage: exports.sendCustomWhatsAppMessage };
//# sourceMappingURL=whatsapp.js.map