# Herbalife E-Commerce Platform - PRD

## Problem Statement
Modern, mobile-friendly e-commerce website for Herbalife products with white, green, and black color palette.

## Core Features (Implemented)

### E-Commerce Core ✅
- Product browsing with categories
- Product variants (flavors) with individual images/stock
- Shopping cart functionality
- Order management with unique order codes (HRB-XXXXXX)
- Order tracking page

### Payment System ✅
- **Havale/EFT**: Admin-managed IBAN, customers upload payment proof
- **Credit/Bank Card (NEW)**: 
  - iyzico integration (form ready, API mocked)
  - PayTR integration (form ready, API mocked)
  - Admin can enable/disable and choose provider(s)
  - Customers choose payment method at checkout

### Admin Panel ✅
- **Dashboard**: Revenue overview, date range filters
- **Products**: CRUD, variants, display order, campaign badges
- **Orders**: Pagination (15/page), search, delete, status management
- **Slider**: YouTube videos + uploaded images
- **Blog/Banners**: Rich text editor, detail pages
- **Testimonials**: Customer reviews on homepage
- **Product Reviews**: Customer reviews with images, approval workflow
- **Payment Settings**: Bank info + Iyzico/PayTR configuration
- **Site Settings**: Logo, top bar, footer, popup, legal pages
- **User Management (NEW)**: Role-based admin management

### Admin Role System (NEW) ✅
- **Yönetici (Super Admin)**: Full access, can manage other admins
- **Admin**: Standard privileges, cannot access user management

### Customer Features ✅
- Product sorting (price)
- Product reviews with images
- Order tracking with order code
- WhatsApp contact button
- Legal pages in footer
- Welcome popup (customizable)

## Technical Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, React Quill
- **Backend**: FastAPI, Motor (MongoDB async), JWT Auth
- **Database**: MongoDB

## API Endpoints

### Auth
- `POST /api/auth/login` - Returns token + role
- `POST /api/auth/register` - Register new admin
- `GET /api/auth/me` - Current user info with role

### Admin Management (Yönetici only)
- `GET /api/admins` - List all admins
- `POST /api/admins` - Create admin
- `PUT /api/admins/{id}` - Update admin
- `DELETE /api/admins/{id}` - Delete admin

### Card Payment
- `GET /api/card-payment/status` - Check if card payment is enabled
- `POST /api/card-payment/init-iyzico` - Initialize iyzico payment
- `POST /api/card-payment/init-paytr` - Initialize PayTR payment
- Callback endpoints for payment verification

## Test Credentials
- **Super Admin**: admin@herbalife.com / admin123 (role: Yönetici)
- **Standard Admin**: standard_admin@herbalife.com / admin123 (role: Admin)

## What's MOCKED
- **Iyzico**: Form and settings ready, actual payment processing not configured
- **PayTR**: Form and settings ready, actual payment processing not configured
- Both require real API keys from the respective payment providers to work

## Database Schema Updates
```
admins: { id, email, password_hash, role: "Yönetici"|"Admin", created_at }
payment_settings: { 
  ..., 
  card_payment_enabled, 
  card_payment_provider: "iyzico"|"paytr"|"both",
  iyzico_api_key, iyzico_secret_key, iyzico_sandbox,
  paytr_merchant_id, paytr_merchant_key, paytr_merchant_salt, paytr_sandbox
}
pending_payments: { order_id, provider, payment_id/token, amount, status, customer_email }
```

## Completed This Session
1. ✅ Dual Payment System (Havale/EFT + Credit Card)
2. ✅ Admin Role Management (Yönetici/Admin)
3. ✅ iyzico integration structure
4. ✅ PayTR integration structure
5. ✅ User Management page
6. ✅ Role-based menu visibility
7. ✅ All tests passing (18/18)

## Backlog / Future Tasks
- [ ] Export orders to CSV/Excel
- [ ] Dashboard revenue graph
- [ ] Strikethrough price for campaigns
- [ ] Blog commenting system
- [ ] Social media sharing for blog posts
- [ ] Stock management alerts
- [ ] Email notifications for orders

---
Last Updated: January 20, 2026
