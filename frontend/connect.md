# Luxe Salon - Frontend Connection Guide

This document provides comprehensive information about connecting the Luxe Salon Next.js frontend to the backend API.

## Table of Contents

1. [Overview](#overview)
2. [API Configuration](#api-configuration)
3. [Authentication](#authentication)
4. [Endpoints Reference](#endpoints-reference)
5. [Type Definitions](#type-definitions)
6. [Error Handling](#error-handling)
7. [Environment Variables](#environment-variables)
8. [Development Setup](#development-setup)

---

## Overview

The Luxe Salon frontend is built with Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui. It communicates with a Node.js/Express backend via RESTful APIs.

### Technology Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 4.0.4
- **UI Components**: shadcn/ui + Radix UI
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **Charts**: Recharts

---

## API Configuration

### Base URL Configuration

The API base URL is configured via environment variable:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

### API Clients

Two Axios instances are provided:

1. **`api`** - Public API client (no authentication)
2. **`adminApi`** - Admin API client (with JWT authentication)

```typescript
import { api, adminApi } from '@/lib/api';

// Public endpoints
const response = await api.get('/api/services');

// Admin endpoints (auto-authenticated)
const response = await adminApi.get('/api/bookings');
```

---

## Authentication

### JWT Authentication Flow

The admin panel uses JWT-based authentication:

```typescript
// Admin Login
const adminLogin = async (secretKey: string) => {
  const response = await api.post('/api/admin/login', { secretKey });
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('admin_token', response.data.data.token);
    localStorage.setItem('admin_token_expiry', String(Date.now() + 24 * 60 * 60 * 1000));
  }
  return response;
};
```

### Token Storage

Tokens are stored in localStorage:

- `admin_token` - JWT access token
- `admin_token_expiry` - Token expiration timestamp
- `admin_key` - Legacy fallback key (for backwards compatibility)

### Authentication Check

```typescript
// Check if admin is authenticated
import { isAdminAuthenticated } from '@/lib/api';

if (!isAdminAuthenticated()) {
  redirect('/admin/login');
}
```

### Auto-Logout on 401

The adminApi interceptor automatically clears invalid tokens on 401 responses:

```typescript
adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_key');
    }
    return Promise.reject(error);
  }
);
```

---

## Endpoints Reference

### Services

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/services` | List all active services | No |
| GET | `/api/services/:id` | Get service by ID | No |
| GET | `/api/services/categories` | Get service categories | No |
| POST | `/api/services` | Create new service | Yes |
| PUT | `/api/services/:id` | Update service | Yes |
| DELETE | `/api/services/:id` | Delete service | Yes |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | No |
| GET | `/api/bookings/:id` | Get booking by ID | No |
| GET | `/api/bookings/available-slots` | Get available time slots | No |
| GET | `/api/bookings` | List all bookings | Yes |
| PATCH | `/api/bookings/:id/status` | Update booking status | Yes |
| DELETE | `/api/bookings/:id` | Cancel booking | Yes |
| GET | `/api/bookings/stats` | Get booking statistics | Yes |

### Payments (Razorpay)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create Razorpay order | No |
| POST | `/api/payments/verify` | Verify payment signature | No |
| POST | `/api/payments/:id/retry` | Retry failed payment | No |
| GET | `/api/payments/:id/status` | Get payment status | No |
| POST | `/api/payments/abandoned-cleanup` | Cleanup abandoned bookings | Yes |

### Staff Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/staff` | List all staff | No |
| GET | `/api/staff/:id` | Get staff by ID | No |
| POST | `/api/staff` | Create staff member | Yes |
| PUT | `/api/staff/:id` | Update staff member | Yes |
| DELETE | `/api/staff/:id` | Delete staff member | Yes |
| PATCH | `/api/staff/:id/status` | Toggle active status | Yes |

### Settings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/settings` | Get all settings | No |
| GET | `/api/settings/public` | Get public settings | No |
| PUT | `/api/settings` | Update settings | Yes |
| PUT | `/api/settings/business-hours` | Update business hours | Yes |
| POST | `/api/settings/holidays` | Add holiday | Yes |
| DELETE | `/api/settings/holidays/:date` | Remove holiday | Yes |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews` | List reviews | No |
| GET | `/api/services/:id/reviews` | Get service reviews | No |
| POST | `/api/reviews` | Create review | No |
| GET | `/api/admin/reviews` | List all reviews (admin) | Yes |
| PATCH | `/api/admin/reviews/:id/moderate` | Moderate review | Yes |
| DELETE | `/api/admin/reviews/:id` | Delete review | Yes |
| GET | `/api/admin/reviews/stats` | Get review stats | Yes |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/login` | Admin login | No |

---

## Type Definitions

### Service Types

```typescript
interface Service {
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

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url?: string;
  is_active?: boolean;
}
```

### Booking Types

```typescript
type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type PaymentMethod = 'online' | 'cod';

interface Booking {
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
  services?: Service;
  created_at: string;
  updated_at: string;
}

interface BookingFormData {
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
```

### Staff Types

```typescript
interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  designation: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  image_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StaffFormData {
  name: string;
  email?: string;
  phone?: string;
  designation: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  image_url?: string;
  bio?: string;
  is_active?: boolean;
}
```

### Settings Types

```typescript
interface BusinessHours {
  day: string;
  day_index: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  slot_duration_minutes: number;
}

interface Holiday {
  date: string;
  name: string;
}

interface ShopSettings {
  id: string;
  salon_name: string;
  salon_tagline?: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  pincode?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
  timezone: string;
  currency: string;
  advance_booking_days: number;
  max_bookings_per_slot: number;
  allow_cod: boolean;
  business_hours: BusinessHours[];
  holidays: Holiday[];
  created_at: string;
  updated_at: string;
}
```

### Review Types

```typescript
interface Review {
  id: string;
  booking_id: string;
  service_id: string;
  staff_id?: string;
  customer_name: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  service?: Service;
  staff?: Staff;
  created_at: string;
  updated_at: string;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { rating: number; count: number }[];
  recent_reviews: Review[];
}
```

---

## Error Handling

### API Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    msg: string;
    param?: string;
    location?: string;
  }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Error Handling Example

```typescript
try {
  const response = await createBooking(bookingData);
  if (response.data.success) {
    // Handle success
    router.push('/booking-confirmation');
  }
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'Something went wrong';
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }
}
```

---

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Optional: Analytics
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
```

### Production Environment

For production deployment:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
```

---

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- Running backend API server

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Component Architecture

### Key Components

```
components/
├── ui/                 # shadcn/ui components
├── Navbar.tsx         # Site navigation with mobile menu
├── Footer.tsx         # Site footer
├── ServiceCard.tsx    # Service display card
└── ReviewsSection.tsx # Customer reviews carousel

app/
├── page.tsx           # Homepage
├── book/page.tsx      # Booking page
├── booking-confirmation/page.tsx  # Confirmation page
├── admin/
│   ├── layout.tsx     # Admin layout with auth
│   ├── page.tsx       # Admin dashboard
│   ├── bookings/page.tsx   # Bookings management
│   ├── services/page.tsx   # Services management
│   ├── staff/page.tsx      # Staff management
│   ├── analytics/page.tsx  # Analytics & reports
│   └── settings/page.tsx   # Shop settings
```

### Admin Layout Authentication

The admin layout (`app/admin/layout.tsx`) checks for authentication:

```typescript
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      redirect('/admin/login');
    } else {
      setIsAuth(true);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) return <div>Loading...</div>;
  return <AdminSidebar>{children}</AdminSidebar>;
}
```

---

## Razorpay Payment Integration

### Payment Flow

1. Create booking (status: `pending`)
2. Create Razorpay order
3. Display payment modal
4. Verify payment signature
5. Update booking status to `confirmed`

### Implementation

```typescript
import { createRazorpayOrder, verifyPayment } from '@/lib/api';

// Initialize Razorpay payment
const handlePayment = async () => {
  const order = await createRazorpayOrder(bookingId, amount);
  
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.data.data.amount,
    order_id: order.data.data.order_id,
    handler: async (response: RazorpayResponse) => {
      await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        booking_id: bookingId,
      });
    },
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

---

## Slot Availability System

### API Endpoint

```typescript
GET /api/bookings/available-slots?date=YYYY-MM-DD&service_id=optional
```

### Response

```typescript
interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
  slot_duration_minutes: number;
}

interface TimeSlot {
  time: string;      // "HH:MM" format
  available: boolean;  // true if slot is bookable
}
```

### Usage in Booking

```typescript
const [selectedDate, setSelectedDate] = useState<string>('');
const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

useEffect(() => {
  if (selectedDate) {
    getAvailableSlots(selectedDate, selectedServiceId)
      .then(response => {
        setAvailableSlots(response.data.data.slots);
      });
  }
}, [selectedDate, selectedServiceId]);
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS configured for frontend domain
2. **401 Unauthorized**: Check admin token is valid and not expired
3. **404 Not Found**: Verify API URL and endpoint paths
4. **Razorpay not loading**: Include Razorpay script in layout

### Debug Mode

Enable console logging for API calls:

```typescript
// lib/api.ts
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url);
  return config;
});
```

---

## Support & Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Razorpay Docs**: https://razorpay.com/docs

---

*Last Updated: 2024*
