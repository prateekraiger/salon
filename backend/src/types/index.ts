/**
 * Core Type Definitions for Luxe Salon Backend
 */

// ─── Service Types ───────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url?: string;
  is_active?: boolean;
}

// ─── Booking Types ───────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'online' | 'cod';

export interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  address: string;
  city?: string;
  pincode?: string;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: BookingStatus;
  total_amount: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  services?: Service;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  payment_method: PaymentMethod;
  address: string;
  city?: string;
  pincode?: string;
  notes?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  payment_method?: PaymentMethod;
  date?: string;
  page?: number;
  limit?: number;
}

export interface BookingStats {
  total_bookings: number;
  today_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  monthly_data: { month: string; count: number }[];
}

// ─── Payment Types ───────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  booking_id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  created_at: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}

export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        error_code?: string;
        error_description?: string;
      };
    };
  };
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminPayload {
  adminId: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export interface AdminLoginCredentials {
  secretKey: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param?: string; location?: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── WhatsApp Types ──────────────────────────────────────────────────────────

export interface WhatsAppNotificationData {
  booking: Booking;
  service: Service;
}

// ─── Environment Types ─────────────────────────────────────────────────────────

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_WHATSAPP_FROM?: string;
  SALON_WHATSAPP_NUMBER?: string;
  ADMIN_SECRET_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}
