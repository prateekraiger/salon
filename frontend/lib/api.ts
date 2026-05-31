import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────────────────────
// Base API Configuration
// ─────────────────────────────────────────────────────────────────────────────

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

// Add admin token interceptor
adminApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Fallback to legacy admin key if no token
  const adminKey = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;
  if (!token && adminKey) {
    config.headers['x-admin-key'] = adminKey;
  }
  return config;
});

// Response interceptor for handling 401 errors
adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_key');
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────

export const adminLogin = async (secretKey: string) => {
  const response = await api.post('/api/admin/login', { secretKey });
  if (response.data.success && response.data.data.token) {
    // Store new JWT token
    localStorage.setItem('admin_token', response.data.data.token);
    localStorage.setItem('admin_token_expiry', String(Date.now() + 24 * 60 * 60 * 1000));
    // Also store legacy key for backwards compatibility
    localStorage.setItem('admin_key', secretKey);
  }
  return response;
};

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('admin_token');
  const expiry = localStorage.getItem('admin_token_expiry');
  
  if (!token) {
    // Fallback to legacy key check
    return !!localStorage.getItem('admin_key');
  }
  
  // Check token expiry
  if (expiry && Number(expiry) < Date.now()) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    return false;
  }
  
  return true;
};

export const adminLogout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_token_expiry');
  localStorage.removeItem('admin_key');
};

// ─────────────────────────────────────────────────────────────────────────────
// Services API
// ─────────────────────────────────────────────────────────────────────────────

export const getServices = () => api.get('/api/services');
export const getServiceById = (id: string) => api.get(`/api/services/${id}`);
export const getCategories = () => api.get('/api/services/categories');

// Admin service operations
export const createService = (data: ServiceFormData) => adminApi.post('/api/services', data);
export const updateService = (id: string, data: Partial<ServiceFormData>) =>
  adminApi.put(`/api/services/${id}`, data);
export const deleteService = (id: string) => adminApi.delete(`/api/services/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// Bookings API
// ─────────────────────────────────────────────────────────────────────────────

export const createBooking = (data: BookingFormData) => api.post('/api/bookings', data);
export const getBookingById = (id: string) => api.get(`/api/bookings/${id}`);
export const getAvailableSlots = (date: string, serviceId?: string) =>
  api.get('/api/bookings/available-slots', { params: { date, service_id: serviceId } });

// Admin booking operations
export const getAllBookings = (params?: Record<string, string | number>) =>
  adminApi.get('/api/bookings', { params });
export const updateBookingStatus = (id: string, status: string, payment_status?: string) =>
  adminApi.patch(`/api/bookings/${id}/status`, { status, payment_status });
export const cancelBooking = (id: string) => adminApi.delete(`/api/bookings/${id}`);
export const getBookingStats = () => adminApi.get('/api/bookings/stats');

// ─────────────────────────────────────────────────────────────────────────────
// Payments API
// ─────────────────────────────────────────────────────────────────────────────

export const createRazorpayOrder = (booking_id: string, amount: number) =>
  api.post('/api/payments/create-order', { booking_id, amount });

export const verifyPayment = (data: PaymentVerification) =>
  api.post('/api/payments/verify', data);

export const retryPayment = (booking_id: string) =>
  api.post(`/api/payments/${booking_id}/retry`);

export const getPaymentStatus = (booking_id: string) =>
  api.get(`/api/payments/${booking_id}/status`);

// Admin payment operations
export const cleanupAbandonedBookings = () =>
  adminApi.post('/api/payments/abandoned-cleanup');

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

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
  updated_at?: string;
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

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}

export interface PaymentStatusResponse {
  booking_id: string;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  amount: number;
  can_retry: boolean;
  razorpay_order_id?: string;
  payment_details: {
    id: string;
    status: PaymentStatus;
    amount: number;
    created_at: string;
  } | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
  slot_duration_minutes: number;
}

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
