# Nuvora - Premium E-Commerce Platform

A production-grade, single-vendor e-commerce platform built with modern full-stack technologies, following professional software engineering practices including SRS documentation, ER diagram design, and REST API architecture.

---

## Tech Stack

### Frontend
- **Next.js 15** - App Router, SSR, ISR
- **TypeScript** - Type-safe codebase
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **GSAP + Framer Motion** - Premium animations
- **Zustand** - Client state management
- **React Query** - Server state management

### Backend
- **NestJS** - Modular, scalable architecture
- **TypeScript** - End-to-end type safety
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **JWT** - Custom authentication (Access + Refresh tokens)
- **Passport.js** - Auth strategies

### Infrastructure
- **Docker** - Containerized development
- **GitHub Actions** - CI/CD pipeline
- **Cloudinary** - Image storage & CDN
- **Stripe** - Payment processing
- **Railway** - Backend deployment
- **Vercel** - Frontend deployment

---

## Features

### Customer
- Custom JWT authentication with email verification
- Google OAuth login
- Product browsing with advanced search & filter
- Product rating & review system (verified purchasers only)
- Persistent shopping cart
- Wishlist management
- Secure checkout with Stripe
- Promo code & discount system
- Order tracking & history
- Invoice PDF download
- Real-time notifications
- Dark mode support
- Fully responsive (mobile-first)

### Admin
- Analytics dashboard - revenue, orders, users
- Product & category management
- Order management with status updates
- User management
- Promo code management
- Banner management
- Low stock alerts
- Best sellers overview
- Bulk product upload via CSV

---

## Architecture

**Modular Monolith** - Deliberate architectural decision balancing development speed with maintainability and future scalability. Each module (auth, products, orders, etc.) owns its own controllers, services, and DTOs - making future extraction to microservices straightforward.

nuvora/
├── apps/
│   ├── web/          # Next.js 15 Frontend
│   └── api/          # NestJS Backend
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docker-compose.yml


---

## Engineering Documentation

This project follows professional software engineering practices:

- **SRS Document** - Complete Software Requirements Specification (30 pages)
- **ER Diagram** - 20 entities with full relationship mapping
- **API Design** - REST API documented with Swagger
- **Database Schema** - Prisma schema with indexes and relations

---

## API Documentation

After running the backend, Swagger docs available at:
http://localhost:3001/api/docs

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- pnpm

### Clone the repository
```bash
git clone https://github.com/devtanzir/nuvora.git
cd nuvora
```

### Start the database
```bash
docker compose up -d
```

### Backend setup
```bash
cd apps/api
pnpm install
cp .env.example .env
# You have to fill the .env file credentials.
pnpm prisma migrate dev
pnpm run start:dev
```

### Frontend setup
```bash
cd apps/web
pnpm install
cp .env.local.example .env.local
# You have to fill the .env file credentials.
pnpm run dev
```

### Access
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Swagger:** http://localhost:3001/api/docs
- **pgAdmin:** http://localhost:5050

---

## Environment Variables

### Backend (`apps/api/.env`)
```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
PORT=
FRONTEND_URL=
NODE_ENV=
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Project Status

> **Currently in active development**

| Module | Status |
|--------|--------|
| Project Setup | ✅ Complete |
| Database Schema | ✅ Complete |
| API Design | ✅ Complete |
| Auth Module | 🔄 In Progress |
| Upload Module | ⏳ Pending |
| Category Module | ⏳ Pending |
| Product Module | ⏳ Pending |
| Cart Module | ⏳ Pending |
| Wishlist Module | ⏳ Pending |
| Order Module | ⏳ Pending |
| Payment (Stripe) | ⏳ Pending |
| Review Module | ⏳ Pending |
| Admin Dashboard | ⏳ Pending |
| Frontend | ⏳ Pending |
| Deployment | ⏳ Pending |

---

## Author

**Tanzir Ibne Ali**
- Portfolio: [tanziribneali.vercel.app](https://tanziribneali.vercel.app)
- GitHub: [@devtanzir](https://github.com/devtanzir)
- LinkedIn: [tanziribneali](https://www.linkedin.com/in/tanziribneali)

---

## License

MIT License - feel free to use this project as a reference.