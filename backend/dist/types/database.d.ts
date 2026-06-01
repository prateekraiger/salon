/**
 * Supabase Database Type Definitions
 * Generated types for the Luxe Salon database schema
 */
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export interface Database {
    public: {
        Tables: {
            services: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    price: number;
                    duration_minutes: number;
                    category: string;
                    image_url: string | null;
                    is_active: boolean;
                    is_deleted: boolean | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description: string;
                    price: number;
                    duration_minutes: number;
                    category: string;
                    image_url?: string | null;
                    is_active?: boolean;
                    is_deleted?: boolean | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    price?: number;
                    duration_minutes?: number;
                    category?: string;
                    image_url?: string | null;
                    is_active?: boolean;
                    is_deleted?: boolean | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    booking_number: string;
                    customer_name: string;
                    customer_phone: string;
                    customer_email: string | null;
                    service_id: string;
                    appointment_date: string;
                    appointment_time: string;
                    address: string;
                    city: string | null;
                    pincode: string | null;
                    notes: string | null;
                    payment_method: 'online' | 'cod';
                    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
                    total_amount: number;
                    razorpay_order_id: string | null;
                    razorpay_payment_id: string | null;
                    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    booking_number: string;
                    customer_name: string;
                    customer_phone: string;
                    customer_email?: string | null;
                    service_id: string;
                    appointment_date: string;
                    appointment_time: string;
                    address: string;
                    city?: string | null;
                    pincode?: string | null;
                    notes?: string | null;
                    payment_method: 'online' | 'cod';
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
                    total_amount: number;
                    razorpay_order_id?: string | null;
                    razorpay_payment_id?: string | null;
                    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    booking_number?: string;
                    customer_name?: string;
                    customer_phone?: string;
                    customer_email?: string | null;
                    service_id?: string;
                    appointment_date?: string;
                    appointment_time?: string;
                    address?: string;
                    city?: string | null;
                    pincode?: string | null;
                    notes?: string | null;
                    payment_method?: 'online' | 'cod';
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
                    total_amount?: number;
                    razorpay_order_id?: string | null;
                    razorpay_payment_id?: string | null;
                    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            payments: {
                Row: {
                    id: string;
                    booking_id: string;
                    razorpay_order_id: string | null;
                    razorpay_payment_id: string | null;
                    amount: number;
                    currency: string;
                    status: 'pending' | 'success' | 'failed' | 'refunded';
                    payment_method: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    booking_id: string;
                    razorpay_order_id?: string | null;
                    razorpay_payment_id?: string | null;
                    amount: number;
                    currency?: string;
                    status?: 'pending' | 'success' | 'failed' | 'refunded';
                    payment_method?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    booking_id?: string;
                    razorpay_order_id?: string | null;
                    razorpay_payment_id?: string | null;
                    amount?: number;
                    currency?: string;
                    status?: 'pending' | 'success' | 'failed' | 'refunded';
                    payment_method?: string | null;
                    created_at?: string;
                };
            };
            processed_webhooks: {
                Row: {
                    id: string;
                    razorpay_payment_id: string;
                    razorpay_order_id: string | null;
                    event_type: string;
                    processed_at: string;
                };
                Insert: {
                    id?: string;
                    razorpay_payment_id: string;
                    razorpay_order_id?: string | null;
                    event_type: string;
                    processed_at?: string;
                };
                Update: {
                    id?: string;
                    razorpay_payment_id?: string;
                    razorpay_order_id?: string | null;
                    event_type?: string;
                    processed_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
//# sourceMappingURL=database.d.ts.map