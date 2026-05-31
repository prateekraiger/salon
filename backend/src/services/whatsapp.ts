/**
 * WhatsApp Notification Service
 * Uses Twilio WhatsApp API for COD booking notifications
 */

import axios from 'axios';
import env, { isWhatsAppConfigured } from '../config/env';
import type { WhatsAppNotificationData, ApiResponse } from '../types';

/**
 * Send WhatsApp notification for COD bookings
 */
export const sendWhatsAppNotification = async ({
  booking,
  service,
}: WhatsAppNotificationData): Promise<ApiResponse> => {
  // Check if WhatsApp is configured
  if (!isWhatsAppConfigured()) {
    console.warn('⚠️ WhatsApp credentials not configured. Skipping notification.');
    return {
      success: false,
      message: 'WhatsApp not configured',
    };
  }

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM,
    SALON_WHATSAPP_NUMBER,
  } = env;

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

📍 *Address:* ${booking.address}${booking.city ? `, ${booking.city}` : ''}${
    booking.pincode ? ` - ${booking.pincode}` : ''
  }

${booking.notes ? `📝 *Notes:* ${booking.notes}` : ''}

_Please confirm this appointment with the customer._`;

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        From: TWILIO_WHATSAPP_FROM!,
        To: SALON_WHATSAPP_NUMBER!,
        Body: message,
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID!,
          password: TWILIO_AUTH_TOKEN!,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ WhatsApp notification sent:', response.data.sid);

    return {
      success: true,
      data: {
        sid: response.data.sid,
        status: response.data.status,
      },
      message: 'WhatsApp notification sent successfully',
    };
  } catch (error) {
    console.error('❌ WhatsApp notification error:', error);
    throw error;
  }
};

/**
 * Send custom WhatsApp message
 */
export const sendCustomWhatsAppMessage = async (
  to: string,
  message: string
): Promise<ApiResponse> => {
  if (!isWhatsAppConfigured()) {
    return {
      success: false,
      message: 'WhatsApp not configured',
    };
  }

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        From: env.TWILIO_WHATSAPP_FROM!,
        To: to,
        Body: message,
      }),
      {
        auth: {
          username: env.TWILIO_ACCOUNT_SID!,
          password: env.TWILIO_AUTH_TOKEN!,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      success: true,
      data: {
        sid: response.data.sid,
      },
      message: 'Message sent successfully',
    };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
};

export default { sendWhatsAppNotification, sendCustomWhatsAppMessage };
