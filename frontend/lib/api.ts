import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Admin API with auth
export const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add admin key interceptor
adminApi.interceptors.request.use((config) => {
  const adminKey = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;
  if (adminKey) {
    config.headers['x-admin-key'] = adminKey;
  }
  return config;
});

// ─── Services ────────────────────────────────────────────────────────────────
export const getServices = () => api.get('/api/services');
export const getServiceById = (id: string) => api.get(`/api/services/${id}`);
export const getCategories = () => api.get('/api/services/categories');

// Admin service operations
export const createService = (data: ServiceFormData) => adminApi.post('/api/services', data);
export const updateService = (id: string, data: Partial<ServiceFormData>) =>
  adminApi.put(`/api/services/${id}`, data);
export const deleteService = (id: string) => adminApi.delete(`/api/services/${id}`);

// ─── Bookings ────────────────────────────────────────────────────────────────
export const createBooking = (data: BookingFormData) => api.post('/api/bookings', data);
export const getBookingById = (id: string) => api.get(`/api/bookings/${id}`);

// Admin booking operations
export const getAllBookings = (params?: Record<string, string | number>) =>
  adminApi.get('/api/bookings', { params });
export const updateBookingStatus = (id: string, status: string, payment_status?: string) =>
  adminApi.patch(`/api/bookings/${id}/status`, { status, payment_status });
export const cancelBooking = (id: string) => adminApi.delete(`/api/bookings/${id}`);
export const getBookingStats = () => adminApi.get('/api/bookings/stats');

// ─── Payments ────────────────────────────────────────────────────────────────
export const createRazorpayOrder = (booking_id: string, amount: number) =>
  api.post('/api/payments/create-order', { booking_id, amount });
export const verifyPayment = (data: PaymentVerification) =>
  api.post('/api/payments/verify', data);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
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

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  payment_method: 'online' | 'cod';
  address: string;
  city?: string;
  pincode?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  payment_method: 'online' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  address: string;
  city?: string;
  pincode?: string;
  notes?: string;
  total_amount: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  services?: Service;
  created_at: string;
  updated_at: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}
