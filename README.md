
  # Website Perpustakaan Modern

  Sistem manajemen perpustakaan modern dengan React frontend + Node.js backend + MongoDB database.

  > Original design: https://www.figma.com/design/x26k5baTwLB0zLHVHLAFts/Website-Perpustakaan-Modern

  ## 🚀 Quick Start

  ### Development

  ```bash
  npm install
  npm run dev          # Start dev server (http://localhost:5173)
  npm start            # Start backend (http://localhost:3000)
  ```

  ### Production Build

  ```bash
  npm run build        # Build frontend to dist/
  npm start            # Serve both frontend + API from same host
  ```

  ## 📚 Technology Stack

  - **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite
  - **Backend:** Node.js + Express
  - **Database:** MongoDB Atlas
  - **UI Components:** Radix UI + shadcn/ui

  ## 🌐 Deployment

  > **Deploy ke Hostinger?** Baca: [DEPLOYMENT_HOSTINGER.md](./DEPLOYMENT_HOSTINGER.md)

  ### Environment Variables

  Copy `.env.example` ke `.env.local`:

  ```bash
  cp .env.example .env.local
  ```

  Edit `.env.local` dan set:
  - `MONGODB_URI` - MongoDB Atlas connection string
  - `MONGODB_DB` - Database name
  - `VITE_API_URL` - Leave empty if same host (recommended)

  ### Architecture

  ```
  ├── src/               # React frontend source
  │   ├── app/          # App pages & components
  │   ├── styles/       # Global styles
  │   └── main.tsx      # Entry point
  ├── api/              # Backend API endpoints
  │   ├── books.ts      # Books management
  │   ├── users.ts      # Users management
  │   ├── loans.ts      # Loan transactions
  │   └── auth/         # Authentication
  ├── dist/             # Built frontend (after npm run build)
  ├── server.js         # Express server
  └── vite.config.ts    # Vite configuration
  ```

  ### How it works

  1. **Development:** Vite dev server + separate Node backend
  2. **Production:** Frontend built to `dist/`, served by Express alongside API

  ## 📖 Documentation

  - [Deployment Guide](./DEPLOYMENT_HOSTINGER.md) - Setup & deploy ke Hostinger
  - [Production Config](./PRODUCTION_CONFIG.md) - Environment variables & troubleshooting
  - [Guidelines](./guidelines/Guidelines.md) - Design guidelines & conventions
  