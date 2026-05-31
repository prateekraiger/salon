const axios = require('axios');
require('dotenv').config();

/**
 * Send WhatsApp notification for COD bookings
 * Uses Twilio WhatsApp API
 */
const sendWhatsAppNotification = async ({ booking, service }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  const toNumber = process.env.SALON_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.warn('⚠️ WhatsApp credentials not configured. Skipping notification.');
    return { skipped: true };
  }

  const appointmentDate = new Date(booking.appointment_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: message
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ WhatsApp notification sent:', response.data.sid);
    return { success: true, sid: response.data.sid };
  } catch (error) {
    console.error('❌ WhatsApp notification error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppNotification };
