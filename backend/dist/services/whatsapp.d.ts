/**
 * WhatsApp Notification Service
 * Uses Twilio WhatsApp API for COD booking notifications
 */
import type { WhatsAppNotificationData, ApiResponse } from '../types';
/**
 * Send WhatsApp notification for COD bookings
 */
export declare const sendWhatsAppNotification: ({ booking, service, }: WhatsAppNotificationData) => Promise<ApiResponse>;
/**
 * Send custom WhatsApp message
 */
export declare const sendCustomWhatsAppMessage: (to: string, message: string) => Promise<ApiResponse>;
declare const _default: {
    sendWhatsAppNotification: ({ booking, service, }: WhatsAppNotificationData) => Promise<ApiResponse>;
    sendCustomWhatsAppMessage: (to: string, message: string) => Promise<ApiResponse>;
};
export default _default;
//# sourceMappingURL=whatsapp.d.ts.map