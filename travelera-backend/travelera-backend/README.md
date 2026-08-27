# Travel Era — Backend

Full working Node.js + Express + MongoDB backend for the Travel Era platform,
supporting 8 travel modes (Bus, Car, Flight, Train, Ferry, Tempo Traveller, Cab, Bike Taxi)
with authentication, bookings, payments, and a full admin panel API.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and edit values (or leave blank for dev/mock mode)
cp .env.example .env

# 3. Make sure MongoDB is running locally, or set MONGO_URI to your Atlas connection string

# 4. Seed the database with demo data (operators, buses, flights, trains, ferries, cars, tempo, drivers, admin+user accounts)
npm run seed

# 5. Start the server
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

Server runs at: `http://localhost:5000`
API base: `http://localhost:5000/api/v1`
Health check: `http://localhost:5000/health`

## Dev / Mock Mode

If you don't have SMTP or Razorpay credentials handy, the app still runs fully:
- **No SMTP configured** → OTP/booking emails are printed to the console instead of sent.
- **No Razorpay keys configured** → payment order creation and signature verification
  run in mock mode (always succeeds), so you can test the entire booking → payment →
  confirmation flow end-to-end without real payment credentials.

## Demo Accounts (after running `npm run seed`)

| Role  | Email                | Password   |
|-------|-----------------------|------------|
| Admin | admin@travelera.com   | Admin@123  |
| User  | ronak@example.com     | User@123   |

## Seat/Slot Locking

`src/utils/seatLock.js` implements an in-memory lock (Map + TTL) to prevent double
booking of the same seat by two users at once — this mirrors the Redis `SETNX`
approach described in the documentation. For a multi-instance production deployment,
swap this file's internals for Redis without changing the calling code in
`booking.service.js`.

## Folder Structure

```
src/
├── config/        # env, MongoDB connection
├── models/        # 15 Mongoose models (see docs Section 4)
├── controllers/    # route handlers
├── services/      # token, email (Nodemailer), payment (Razorpay), booking logic
├── routes/        # Express routers, mounted under /api/v1
├── middlewares/   # auth (JWT+RBAC), rate limiting, error handling, validation
├── utils/         # ApiResponse, ApiError, asyncHandler, seat lock, logger
├── validators/    # Zod request-body schemas
├── app.js         # Express app setup
└── server.js       # entrypoint + graceful shutdown
seed/
└── seed.js        # populates demo data for all 8 travel modes
```

## API Overview

All endpoints are documented in full in the "Travel Era — Full Stack Technical
Documentation" Word doc (Section 7). Summary:

- `POST /api/v1/auth/register|login|refresh|logout|verify-otp|forgot-password|reset-password`
- `GET  /api/v1/search/bus|car|flight|train|ferry|tempo|ride`
- `POST /api/v1/bookings/bus|car|flight|train|ferry|tempo` (auth required)
- `POST /api/v1/rides/request` + `/accept` `/track` `/complete` `/cancel` (Cab/Bike Taxi)
- `POST /api/v1/payments/create-order|verify|webhook`, `POST /payments/:id/refund` (admin)
- `GET/PATCH /api/v1/users/profile`, saved travelers CRUD
- `POST /api/v1/reviews`, `GET /api/v1/reviews/operator/:id`
- Full **Admin Panel API** under `/api/v1/admin/*`:
  - `GET /admin/dashboard` — analytics (users, bookings, revenue, bookings-by-type)
  - `/admin/operators` — CRUD
  - `/admin/routes` — CRUD
  - `/admin/bookings` — list/filter all bookings, update status
  - `/admin/users` — list users, update role
  - `/admin/drivers` — CRUD (cab/bike taxi drivers)
  - `/admin/:type` where type = bus|car|flight|train|ferry|tempo — generic inventory CRUD
    (e.g. `POST /admin/bus` adds a new bus, `GET /admin/flight` lists all flights)

## Notes / What's Simplified for This Deliverable

- **Redis** is not wired up — seat locks use an in-memory Map (works for single-instance
  dev/demo; swap for Redis in production per `seatLock.js` comments).
- **BullMQ** job queue is not wired up — emails send synchronously via Nodemailer.
- **Cloudinary** upload isn't wired up — avatar/logo endpoints accept a pre-hosted URL
  in the request body; plug in `multer` + Cloudinary SDK when ready.
- **Ticket PDF generation** is stubbed — `GET /bookings/:id/ticket` returns booking JSON;
  wire up `pdfkit` or `puppeteer` in a `ticket.service.js` for real PDF rendering.
- **Driver-side auth** for `/rides/:id/accept` and `/rides/:id/complete` is simplified
  (no separate driver JWT flow) — add a `driver` role + driver login flow for production.

These are exactly the pieces marked "extend for production" in the documentation —
the core booking, auth, payment, and admin logic is fully functional as-is.
