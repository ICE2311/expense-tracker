# 💰 Expense Tracker

A production-ready, full-stack expense tracking application built with Next.js App Router, featuring authentication, database integration, analytics, and export capabilities.

## ✨ Features

- 🔐 **Authentication**: Secure email/password authentication with NextAuth.js
- 💸 **Transaction Management**: Track income and expenses with categories
- 📊 **Analytics Dashboard**: Visualize spending patterns with charts
- 📁 **Category Management**: Organize transactions with custom categories
- 📤 **CSV Export**: Export transaction data for external analysis
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS and shadcn/ui
- 🔍 **Filtering & Pagination**: Easily find and navigate through transactions
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Core
- **Next.js 15+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment

### Database & ORM
- **PostgreSQL** - Production database (NeonDB recommended)
- **Prisma** - Type-safe ORM

### Authentication
- **NextAuth.js** - Authentication solution
- **bcryptjs** - Password hashing
- **JWT** - Session management

### Frontend
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Query (TanStack Query)** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** and npm
- **PostgreSQL database** (NeonDB recommended for easy setup)

## 🚀 Getting Started

### 1. Clone or Navigate to the Project

```bash
cd /home/icys/Documents/expense-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Database - Get this from NeonDB (https://neon.tech)
DATABASE_URL="postgresql://user:password@host:5432/expense_tracker?sslmode=require"

# NextAuth - Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set Up NeonDB (Recommended)

1. Go to [NeonDB](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it into your `.env` file as `DATABASE_URL`

**Alternative**: You can use any PostgreSQL database (local or cloud)

### 5. Initialize the Database

Generate Prisma client:
```bash
npm run db:generate
```

Run database migrations:
```bash
npm run db:migrate
```

Seed the database with default categories and demo user:
```bash
npm run db:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Login with Demo Account

```
Email: demo@example.com
Password: password123
```

## 📁 Project Structure

```
expense-tracker/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── transactions/      # Transaction CRUD
│   │   ├── categories/        # Category CRUD
│   │   ├── analytics/         # Analytics data
│   │   └── export/            # CSV export
│   ├── (auth)/                # Auth pages (login, register)
│   ├── (dashboard)/           # Protected dashboard pages
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── sidebar.tsx            # Navigation sidebar
│   ├── summary-cards.tsx      # Dashboard summary cards
│   ├── transaction-form.tsx   # Transaction form
│   └── providers.tsx          # React Query & NextAuth providers
├── hooks/
│   ├── use-transactions.ts    # Transaction queries & mutations
│   ├── use-categories.ts      # Category queries & mutations
│   ├── use-analytics.ts       # Analytics queries
│   └── use-toast.ts           # Toast notifications
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # NextAuth configuration
│   ├── api-utils.ts           # API helper functions
│   ├── validations.ts         # Zod schemas
│   └── utils.ts               # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
└── middleware.ts              # Route protection
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database with default data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Sessions**: Secure session management
- **Route Protection**: Middleware-based authentication
- **Input Validation**: Zod schema validation on all inputs
- **User Data Isolation**: Users can only access their own data
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 📊 Database Schema

### User
- `id`: UUID (primary key)
- `email`: Unique email address
- `password`: Hashed password
- `name`: User's display name
- `currency`: Default currency (e.g., INR, USD)
- `createdAt`, `updatedAt`: Timestamps

### Category
- `id`: UUID (primary key)
- `name`: Category name
- `type`: EXPENSE | INCOME
- `userId`: Foreign key to User
- Unique constraint on (userId, name, type)

### Transaction
- `id`: UUID (primary key)
- `userId`: Foreign key to User
- `type`: EXPENSE | INCOME
- `amount`: Decimal (12, 2)
- `currency`: Currency code
- `categoryId`: Foreign key to Category
- `description`: Optional text
- `transactionDate`: Date of transaction
- `createdAt`, `updatedAt`: Timestamps

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Analytics
- `GET /api/analytics/summary` - Monthly summary
- `GET /api/analytics/monthly-trend` - Yearly trend

### Export
- `GET /api/export/csv` - Export transactions as CSV

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret-32-chars-min"
NEXTAUTH_URL="https://your-domain.com"
```

### Database Migration in Production

```bash
npx prisma migrate deploy
```

## 🤝 Contributing

This is a complete, production-ready application. Feel free to fork and customize for your needs!

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

**Made with ❤️ using Next.js App Router**
