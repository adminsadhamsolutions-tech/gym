# Gym ERP System

Professional Gym ERP Management System built with React.js frontend, Core PHP backend, and MySQL.

## Folder Structure

- `frontend/` — Vite + React + Tailwind UI application
- `backend/` — PHP REST API with JWT auth and upload support
- `database/` — MySQL schema script and initial seed data

## Features

- Admin login with JWT authentication
- Dashboard metrics, charts, expiry alerts
- Member management with photo upload and filters
- Package management with CRUD operations
- Payment recording and payment history (in Indian Rupees ₹)
- Renewal alerts and expiry calculations
- **WhatsApp Integration**: Send welcome messages when creating members
- **WhatsApp Expiry Alerts**: Send automatic renewal reminders to expired members
- Responsive mobile-friendly UI with Tailwind CSS

## Setup Instructions

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Update `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASS`.
3. Create the MySQL database using `database/gym_erp_schema.sql`.
4. Run the PHP server from `backend/` or configure Apache/Nginx.

Example local server:

```bash
cd backend
php -S localhost:8000 router.php
```

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Default Admin Credentials

- Email: `admin@gymerp.com`
- Password: `admin123`

## Notes

- The backend uses `backend/api/.htaccess` for routing when served with Apache.
- File uploads are stored under `backend/uploads/members/`.
- JWT tokens are issued with expiration and verified on every protected API request.
- WhatsApp messages are logged locally in `backend/uploads/whatsapp_log.txt`.
- To enable real WhatsApp integration (Twilio, MessageBird, AWS SNS), update `backend/helpers/whatsapp.php` with your API credentials.
