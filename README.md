# ✂️ Luxe Salon – Full-Stack Booking Platform

A complete, production-ready salon booking platform with customer-facing Next.js frontend, Express.js backend API, Supabase database, Razorpay payment integration, and WhatsApp COD notifications.

---

## 📁 Project Structure

```
salon-booking/
├── frontend/          → Next.js 15 customer website + admin panel
├── backend/           → Express.js REST API
├── database/          → Supabase SQL schema
└── README.md          → This file
```

---

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- Razorpay account (for online payments)
- Twilio account (for WhatsApp COD notifications)

---

## 🗄️ Step 1 — Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Open **SQL Editor** in your project
3. Paste the entire contents of `database/schema.sql` and click **Run**
4. This creates all tables, indexes, RLS policies, and seed data

**Copy these values from your Supabase project settings:**
- `SUPABASE_URL` → Project Settings → API → Project URL
- `SUPABASE_ANON_KEY` → Project Settings → API → `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY` → Project Settings → API → `service_role` key *(keep secret!)*

---

## ⚙️ Step 2 — Configure Backend

```bash
cd backend

# Copy env file
cp .env.example .env

# Fill in your values
nano .env
```

### `backend/.env` — Fill in these values:

```env
PORT=5000
NODE_ENV=development

# --- Supabase (required) ---
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# --- Razorpay (required for online payments) ---
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret

# --- Twilio WhatsApp (required for COD notifications) ---
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
SALON_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX

# --- Admin (required) ---
ADMIN_SECRET_KEY=choose_a_strong_secret_key_here

# --- Frontend URL for CORS ---
FRONTEND_URL=http://localhost:3000
```

### Start Backend:
```bash
cd backend
npm install
npm run dev         # Development with hot-reload
# OR
npm start           # Production
```
Backend runs on: **http://localhost:5000**

---

## 🖥️ Step 3 — Configure Frontend

```bash
cd frontend

# Copy env file
cp .env.local.example .env.local

# Fill in your values
nano .env.local
```

### `frontend/.env.local` — Fill in these values:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
```

### Start Frontend:
```bash
cd frontend
npm install
npm run dev         # Development server
# OR
npm run build && npm start   # Production
```
Frontend runs on: **http://localhost:3000**

---

## 📌 Application URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Customer-facing homepage |
| `http://localhost:3000/#services` | Browse salon services |
| `http://localhost:3000/book?service=ID` | Booking form |
| `http://localhost:3000/booking-confirmation?id=ID` | Confirmation page |
| `http://localhost:3000/admin` | Admin login |
| `http://localhost:3000/admin` | Admin dashboard |
| `http://localhost:3000/admin/bookings` | Manage bookings |
| `http://localhost:3000/admin/services` | Manage services |
| `http://localhost:3000/admin/analytics` | View analytics |
| `http://localhost:5000` | Backend API root |
| `http://localhost:5000/health` | Backend health check |

---

## 🔌 API Endpoints

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | Public | Get all active services |
| GET | `/api/services/categories` | Public | Get service categories |
| GET | `/api/services/:id` | Public | Get single service |
| POST | `/api/services` | Admin | Create service |
| PUT | `/api/services/:id` | Admin | Update service |
| DELETE | `/api/services/:id` | Admin | Deactivate service |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Public | Create booking |
| GET | `/api/bookings/:id` | Public | Get booking by ID |
| GET | `/api/bookings` | Admin | Get all bookings (paginated) |
| GET | `/api/bookings/stats` | Admin | Get booking statistics |
| PATCH | `/api/bookings/:id/status` | Admin | Update booking status |
| DELETE | `/api/bookings/:id` | Admin | Cancel booking |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-order` | Public | Create Razorpay order |
| POST | `/api/payments/verify` | Public | Verify payment signature |
| POST | `/api/payments/webhook` | Razorpay | Payment webhook |

### Admin Authentication
Send one of:
- Header: `x-admin-key: your_admin_secret_key`
- Header: `Authorization: Bearer your_admin_secret_key`

---

## 🗃️ Database Schema

### Table: `services`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Service name |
| description | TEXT | Full description |
| price | NUMERIC | Price in INR |
| duration_minutes | INTEGER | Duration in minutes |
| category | TEXT | e.g., Hair, Skin, Nails, Spa |
| image_url | TEXT | Optional image URL |
| is_active | BOOLEAN | Visibility toggle |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Table: `bookings`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_number | TEXT | Human-readable e.g., SLN12345678 |
| customer_name | TEXT | Full name |
| customer_phone | TEXT | Phone number |
| customer_email | TEXT | Email (optional) |
| service_id | UUID | FK → services |
| appointment_date | DATE | Appointment date |
| appointment_time | TEXT | e.g., "10:00 AM" |
| address | TEXT | Full address |
| city | TEXT | City |
| pincode | TEXT | Postal code |
| notes | TEXT | Special instructions |
| payment_method | TEXT | `online` or `cod` |
| payment_status | TEXT | `pending`, `paid`, `failed`, `refunded` |
| total_amount | NUMERIC | Amount in INR |
| razorpay_order_id | TEXT | Razorpay order reference |
| razorpay_payment_id | TEXT | Razorpay payment reference |
| status | TEXT | `pending`, `confirmed`, `in_progress`, `completed`, `cancelled` |

### Table: `payments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK → bookings |
| razorpay_order_id | TEXT | Order reference |
| razorpay_payment_id | TEXT | Payment reference |
| amount | NUMERIC | Amount |
| currency | TEXT | e.g., INR |
| status | TEXT | `pending`, `success`, `failed`, `refunded` |
| payment_method | TEXT | Payment type |

---

## 💳 Payment Flow

### Online Payment (Razorpay)
```
Customer selects service
    ↓
Fills booking form (Step 1: Personal → Step 2: Schedule → Step 3: Payment)
    ↓
Selects "Pay Online"
    ↓
POST /api/bookings → booking created (status: pending)
    ↓
POST /api/payments/create-order → Razorpay order created
    ↓
Razorpay checkout opens in browser
    ↓
Customer pays (UPI / Card / Net Banking)
    ↓
POST /api/payments/verify → signature verified
    ↓
Booking status: confirmed, payment_status: paid
    ↓
Redirect to confirmation page
```

### COD / Pay at Salon
```
Customer selects "Pay at Salon"
    ↓
POST /api/bookings → booking created
    ↓
WhatsApp message sent to salon owner via Twilio
    ↓
Redirect to confirmation page
```

---

## 📱 WhatsApp Notification Setup (Twilio)

1. Create a [Twilio account](https://twilio.com) (free trial available)
2. Enable **WhatsApp Sandbox** in Twilio Console
3. Get your Account SID, Auth Token
4. Set `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886` (Twilio sandbox number)
5. Set `SALON_WHATSAPP_NUMBER=whatsapp:+91YOUR_NUMBER`
6. For production: Apply for a dedicated WhatsApp Business number

**Message sent on COD booking:**
- Booking number, customer name, phone
- Service name, amount, duration
- Appointment date and time
- Full address with city and pincode
- Special notes

---

## 🔐 Admin Panel Access

1. Visit `http://localhost:3000/admin`
2. Enter the `ADMIN_SECRET_KEY` value from your backend `.env`
3. The key is stored in browser `localStorage` for the session

**Admin features:**
- Dashboard with real-time stats and monthly chart
- Bookings management with filters (status, payment method, search)
- One-click status updates (confirm / in-progress / complete / cancel)
- Services CRUD (create, edit, deactivate)
- Analytics page with revenue breakdown and top services

---

## 🎨 Frontend Features

- **Responsive design** — works on mobile, tablet, desktop
- **Service browsing** with category filter tabs
- **3-step booking wizard** (Personal Info → Schedule → Payment)
- **Razorpay checkout** embedded in the flow
- **Booking confirmation page** with full details
- **Admin login** with localStorage session
- **Loading skeletons** for better UX
- **Toast notifications** for all actions
- **Smooth animations** on page load

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | Supabase (PostgreSQL) |
| Payments | Razorpay |
| WhatsApp | Twilio WhatsApp API |
| Icons | Lucide React |
| HTTP Client | Axios |
| Notifications | React Hot Toast |

---

## 🚢 Production Deployment

### Backend (Railway / Render / VPS)
```bash
# Set all environment variables in your hosting platform
# Then:
npm start
```

### Frontend (Vercel — Recommended)
```bash
# Connect GitHub repo to Vercel
# Set environment variables:
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
```

### Important for Production:
- Change Razorpay keys from `rzp_test_` to `rzp_live_`
- Update `FRONTEND_URL` in backend `.env` to your production domain
- Use a strong `ADMIN_SECRET_KEY` (at least 32 characters)
- Set `NODE_ENV=production` in backend

---

## 📋 Features Implemented

- ✅ Customer website with hero, services, about, testimonials, contact
- ✅ Service listing with category filters
- ✅ 3-step booking form with validation
- ✅ Razorpay online payment integration
- ✅ COD/Pay at Salon option
- ✅ WhatsApp notification for COD bookings (Twilio)
- ✅ Booking confirmation page
- ✅ Admin login with session management
- ✅ Admin dashboard with stats and charts
- ✅ Admin bookings management (view, filter, update status)
- ✅ Admin services CRUD
- ✅ Admin analytics page
- ✅ Supabase database with full schema + seed data
- ✅ Row Level Security on all tables
- ✅ Express.js REST API with validation
- ✅ CORS, helmet, morgan security middleware

## 🔮 Recommended Next Steps

- [ ] Customer login / booking history
- [ ] Email confirmation via SendGrid/Resend
- [ ] SMS notifications via Twilio SMS
- [ ] Appointment calendar view in admin
- [ ] Staff management module
- [ ] Recurring booking / subscription packages
- [ ] Customer reviews and ratings
- [ ] Razorpay subscription for membership plans
- [ ] Mobile app (React Native)

---

*Built with ❤️ for beauty professionals*
