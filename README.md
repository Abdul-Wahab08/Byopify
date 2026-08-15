# Byopify

Byopify is a full-stack e-commerce platform for curated hardware and workspace products. Customers can browse a catalog, manage a cart, and checkout securely. After payment, they get order-level **support chat** and optional **video calls** with staff. Admins manage the product catalog with ImageKit-powered image uploads.

---

## Features

- **Product catalog** — Browse and filter products by category, view 7 product pages
- **Shopping cart** — Add, update quantities, and remove items client-side
- **Secure checkout** — Polar-hosted payments with webhook-based order fulfillment
- **Order management** — View order history, line items, and payment status
- **Customer support chat** — Stream Chat channels on paid orders
- **Video support** — Staff can send video invite links; customers join via Stream Video
- **Admin dashboard** — Create, update, and delete products with ImageKit image uploads
- **Role-based access** — `customer`, `support`, and `admin` roles synced from Clerk
- **Observability** — Sentry error tracking on frontend and backend

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, TanStack Query, Redux Toolkit, Tailwind CSS 4, DaisyUI |
| **Backend** | Node.js, Express 5, TypeScript, Drizzle ORM, Zod |
| **Database** | PostgreSQL |
| **Auth** | Clerk |
| **Payments** | Polar |
| **Realtime** | Stream Chat, Stream Video |
| **Media** | ImageKit |
| **Monitoring** | Sentry |

---

## Architecture

```
┌─────────────────┐     HTTPS / REST      ┌─────────────────┐
│  React (Vite)   │ ◄──────────────────► │  Express API    │
│  Clerk · Redux  │                       │  Drizzle · Zod  │
│  React Query    │                       └────────┬────────┘
└────────┬────────┘                                │
         │                                         ▼
         │                              ┌─────────────────┐
         │                              │   PostgreSQL    │
         │                              └─────────────────┘
         │
         ├── Clerk (auth)
         ├── Polar (checkout redirect)
         ├── Stream (chat & video)
         ├── ImageKit (product images)
         └── Sentry (errors)
```

**Request flow (typical):** React page → custom hook → `fetchApi()` → Express route → controller → Drizzle query → JSON response → React Query cache → UI.

---

## Project Structure

```
Byopify/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── main.tsx          # App entry: providers, routing
│   │   ├── App.tsx           # Layout shell
│   │   ├── pages/            # Route screens
│   │   ├── components/       # Reusable UI
│   │   ├── hooks/            # Data fetching & page logic
│   │   ├── store/            # Redux (cart)
│   │   ├── lib/              # API client, formatting, ImageKit helpers
│   │   └── types/            # Shared TypeScript types
│   └── index.html
│
└── backend/
    ├── src/
    │   ├── index.ts          # Express server entry
    │   ├── db/               # Drizzle schema & client
    │   ├── routes/           # API routers
    │   ├── controllers/      # Business logic
    │   ├── middlewares/      # Auth & Sentry middleware
    │   ├── lib/              # Checkout, roles, Stream, ImageKit helpers
    │   └── webhooks/         # Clerk & Polar webhook handlers
    └── scripts/
        └── seed.ts           # Seed product catalog
```

---

## Prerequisites

- **Node.js** 20+ (recommended)
- **npm** 10+
- **PostgreSQL** database
- Accounts / API keys for:
  - [Clerk](https://clerk.com)
  - [Polar](https://polar.sh)
  - [Stream](https://getstream.io)
  - [ImageKit](https://imagekit.io)
  - [Sentry](https://sentry.io) (optional for local dev)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abdul-Wahab08/Byopify
cd Byopify
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Create `backend/.env` and `frontend/.env` (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

```bash
cd backend
npm run db:push
npm run db:seed
```

### 5. Start the development servers

**Backend** (from `backend/`):

```bash
npm run dev
```

**Frontend** (from `frontend/`):

```bash
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Express server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Frontend origin (used in checkout redirect URLs) |
| `CLERK_SECRET_KEY` | Clerk secret key (used by `@clerk/express`) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `POLAR_API_BASE` | Polar API base URL |
| `POLAR_ACCESS_TOKEN` | Polar API access token |
| `POLAR_CHECKOUT_PRODUCT_ID` | Polar product ID used for dynamic checkout pricing |
| `POLAR_WEBHOOKS_SECRET` | Polar webhook signing secret |
| `STREAM_API_KEY` | Stream Chat / Video API key |
| `STREAM_API_SECRET` | Stream API secret |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `SENTRY_DSN` | Sentry DSN (optional) |
| `NODE_ENV` | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:3000/api`) |
| `VITE_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint for optimized image URLs |
| `VITE_PUBLIC_SENTRY_DSN` | Sentry DSN (optional) |

> Never commit `.env` files. They are ignored by `.gitignore`.

---

## Webhooks

For full checkout and user sync in development, expose your backend and configure webhooks:

| Provider | Endpoint | Events |
|----------|----------|--------|
| **Clerk** | `POST /webhooks/clerk` | `user.created`, `user.updated`, `user.deleted` |
| **Polar** | `POST /webhooks/polar` | `order.paid` |

Use a tunneling tool (e.g. ngrok) so external services can reach your local server. Webhook routes use raw JSON body parsing for signature verification.

### User roles (Clerk)

Roles are stored in Clerk `public_metadata.role` and synced to the database. Valid values:

- `customer` (default)
- `support`
- `admin`

Example Clerk metadata:

```json
{ "role": "admin" }
```

---

## Scripts

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |
| `npm run db:seed` | Seed sample products |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## API Overview

Base path: `/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/me` | Yes | Current logged-in user |
| `GET` | `/products/get-products` | No | List active products |
| `GET` | `/products/get-categories` | No | List product categories |
| `GET` | `/products/get-product-by-slug/:slug` | No | Product by slug |
| `POST` | `/checkout` | Yes | Create Polar checkout session |
| `GET` | `/orders/get-orders` | Yes | List orders (own or all for staff) |
| `GET` | `/orders/get-order-by-id/:id` | Yes | Order details |
| `POST` | `/orders/:id/create-stream-chat-channel` | Yes | Create support chat channel |
| `POST` | `/orders/:id/send-video-invite` | Staff | Send video call invite in chat |
| `POST` | `/stream/create-token` | Yes | Stream user token |
| `GET` | `/admin/list-admin-products` | Admin | List all products |
| `POST` | `/admin/create-admin-product` | Admin | Create product |
| `PATCH` | `/admin/update-admin-product/:id` | Admin | Update product |
| `DELETE` | `/admin/delete-admin-products/:id` | Admin | Delete product |
| `GET` | `/admin/get-imagekit-auth-parameters` | Admin | ImageKit upload credentials |

Authenticated requests must include:

```
Authorization: Bearer <Clerk session token>
```

---

## Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home & product catalog |
| `/product/:slug` | Public | Product details |
| `/cart` | Public | Shopping cart |
| `/checkout/return` | Public | Post-payment confirmation |
| `/orders` | Signed in | Order list |
| `/order/:id` | Signed in | Order summary |
| `/order/:id/chat` | Signed in | Support chat (paid orders) |
| `/order/:id/call` | Signed in | Video call |
| `/admin` | Admin | Product management |

---

## User Roles

| Role | Capabilities |
|------|--------------|
| **customer** | Shop, checkout, view own orders, use support chat on paid orders |
| **support** | View all orders, participate in chat, send video invites |
| **admin** | Full product CRUD + all support capabilities |

---

## Database Schema

Core tables (see `backend/src/db/schema.ts`):

- **users** — Synced from Clerk (`clerk_user_id`, email, role)
- **products** — Catalog (slug, price in cents, ImageKit fields)
- **checkout_sessions** — Pre-payment cart snapshot
- **orders** — Created after successful Polar payment
- **order_items** — Line items linked to products

---

## Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with your static host or reverse proxy
```

Ensure production environment variables, webhook URLs, and CORS settings are configured for your deployment domain.

---

## License

ISC

---

## Author

Abdul
