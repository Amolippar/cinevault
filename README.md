# CineVault 🎬
### Production-Grade Legal Movie Discovery & Public Domain Streaming Platform

> **IMPORTANT LEGAL DIRECTIVE**: CineVault does **NOT** host, stream, or distribute unauthorized copyrighted material. It is engineered specifically for:
> 1. Verified Public-Domain Films (e.g. *Night of the Living Dead*, *Charade*, *Metropolis*, *The General*)
> 2. Documented Licensed Streaming Content (Creative Commons / Open Culture)
> 3. Official Promotional Trailers
> 4. Authorized External Streaming Partner Links (e.g. Paramount+, YouTube Movies, Tubi, Archive.org)
> 5. Discovery metadata for cinema history and education

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v7, TanStack Query, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, Helmet, CORS, Express-Rate-Limit, Morgan, Zod |
| **Database** | PostgreSQL (Production target on Neon / Supabase), SQLite (Zero-config local development) |
| **Security** | bcrypt password hashing, JWT stateless authentication, Role-Based Access Control (`USER` & `ADMIN`), Strict License Validator guardrails |
| **Testing** | Vitest, Supertest integration testing |

---

## 📂 Project Architecture

```
cinevault/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Production PostgreSQL schema
│   │   ├── schema.sqlite.prisma       # Zero-config local development schema
│   │   ├── migrations/                # Generated SQL migration history
│   │   └── seed.ts                    # Complete seed script with public domain films
│   ├── src/
│   │   ├── config/                    # Typed environment configuration
│   │   ├── controllers/               # Auth, Movie, Search, Genre, Watchlist, History, Review, Admin
│   │   ├── middleware/                # JWT Auth, RoleCheck, Zod Validation, RateLimiter, ErrorHandler
│   │   ├── routes/                    # Express REST route definitions
│   │   ├── services/                  # Legal LicenseValidator & Content Enforcement Engine
│   │   ├── tests/                     # Unit & integration test suites
│   │   ├── types/                     # Shared TypeScript types & interfaces
│   │   ├── utils/                     # bcrypt, jwt, logger, apiResponse, slugify
│   │   ├── app.ts                     # Express factory with security headers & rate limiter
│   │   └── index.ts                   # Bootstrapping & graceful shutdown
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── logo.svg                   # Original CineVault emblem
│   │   ├── robots.txt                 # Search engine crawler policies
│   │   └── sitemap.xml                # SEO sitemap
│   ├── src/
│   │   ├── api/                       # Axios client & typed REST functions
│   │   ├── components/
│   │   │   ├── common/                # Navbar, Footer, LicenseBadge, RatingStars, SkeletonLoader, SEO
│   │   │   ├── movie/                 # MovieCard, MovieRow, TrailerModal
│   │   │   ├── player/                # Custom HTML5 VideoPlayer with progress tracking & resume
│   │   │   └── monetization/          # AdBanner, PremiumBanner, AffiliateProviderCard
│   │   ├── context/                   # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── Home.tsx               # OTT-style homepage with hero banner and carousels
│   │   │   ├── Movies.tsx             # Filterable catalog with pagination
│   │   │   ├── MovieDetails.tsx       # Detail view with player, reviews, and related titles
│   │   │   ├── SearchResults.tsx      # Advanced multi-attribute search
│   │   │   ├── Genres.tsx             # Genre collection cards
│   │   │   ├── GenreDetail.tsx        # Specific genre film listing
│   │   │   ├── Login.tsx              # User sign in with one-click demo
│   │   │   ├── Register.tsx           # User account creation
│   │   │   ├── UserProfile.tsx        # Activity stats and profile editor
│   │   │   ├── Watchlist.tsx          # Saved movies queue
│   │   │   ├── WatchHistory.tsx       # Viewing progress and resume sessions
│   │   │   ├── Reviews.tsx            # Member critique manager
│   │   │   ├── About.tsx              # Mission and public domain verification criteria
│   │   │   ├── Contact.tsx            # Support form & designated DMCA copyright agent
│   │   │   ├── PrivacyPolicy.tsx      # GDPR/CCPA privacy policy
│   │   │   ├── TermsOfService.tsx     # Acceptable use & copyright terms
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx     # Dedicated admin portal login
│   │   │       ├── AdminDashboard.tsx # DAU, view counts, and curatorial audit logs
│   │   │       ├── AdminMovieManagement.tsx # Add/Edit films with legal license checks
│   │   │       ├── AdminUserManagement.tsx  # User account status and moderation
│   │   │       ├── AdminReviewManagement.tsx# Review moderation queue
│   │   │       └── AdminAnalytics.tsx # Licensing distributions and traffic graphs
│   │   ├── App.tsx                    # React Router configuration (all 21 routes)
│   │   └── main.tsx                   # React root with React Query and providers
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 2. Backend Setup
```bash
cd backend
npm install

# Initialize local database and seed legal catalog
npx prisma db push --schema=prisma/schema.sqlite.prisma
npm run prisma:seed

# Run tests
npm test

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Run frontend tests
npm test

# Build production bundle
npm run build

# Start frontend dev server
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cinevault.org` | `AdminPass123!` | Full Admin Console, Catalog Publishing, User Moderation |
| **Regular User** | `user@cinevault.org` | `UserPass123!` | Watchlist, Watch History, Reviews, Ratings |

---

## ⚖️ Content Licensing Framework

CineVault enforces strict licensing categories:

1. **`PUBLIC_DOMAIN`**: Works whose term has naturally expired, failed statutory notice under the US 1909 Act, or unrenewed works. Enables direct in-browser streaming.
2. **`LICENSED`**: Independent or Creative Commons titles with documented rights agreements. Direct video playback is automatically disabled if `licenseExpiresAt` has lapsed.
3. **`AUTHORIZED_EXTERNAL`**: Contemporary titles linking out to authorized platforms (Paramount+, YouTube Movies, Tubi). Direct file hosting is strictly prohibited.
4. **`TRAILER_ONLY`**: Pure discovery catalog titles. The UI renders "Watch Trailer" or "Find where to watch". Direct streaming endpoints are blocked.
