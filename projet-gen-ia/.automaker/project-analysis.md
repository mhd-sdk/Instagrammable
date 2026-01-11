# Project Analysis Summary

## 📋 Overview

**Project Name:** Automaker Starter Kit (Full Stack Campus)  
**Type:** Full-stack web application for online community and training platform

---

## 1. Project Structure and Architecture

### Directory Structure
```
projet-gen-ia/
├── src/                          # Main application source code
│   ├── routes/                   # File-based routing (TanStack Router)
│   ├── components/               # React UI components (91 files)
│   ├── db/                       # Database configuration and schema
│   ├── data-access/              # Data access layer (14 files)
│   ├── fn/                       # Server functions (18 files)
│   ├── hooks/                    # Custom React hooks (19 files)
│   ├── queries/                  # TanStack Query definitions (18 files)
│   ├── utils/                    # Utility functions
│   ├── lib/                      # Library utilities and helpers
│   ├── config/                   # Environment configuration
│   └── styles/                   # Global styles
├── drizzle/                      # Database migrations
├── docs/                         # Comprehensive documentation
├── public/                       # Static assets
├── docker-compose.yml            # PostgreSQL Docker setup
└── [config files]                # Various configuration files
```

### Layered Architecture (7 Layers)
```
Routes → Components → Hooks → Queries → Fn → Use Cases → Data Access
```

Each layer has strict responsibilities and dependencies only flow downward.

---

## 2. Main Technologies and Frameworks

### Core Stack
| Category | Technology |
|----------|------------|
| **Framework** | TanStack Start v1.137.0 |
| **UI Library** | React v19.2.0 |
| **Server** | Nitro v3.0.1-alpha.1 |
| **Database** | PostgreSQL (Docker) + Drizzle ORM v0.44.7 |
| **Authentication** | Better Auth v1.3.34 |
| **Payments** | Stripe v20.0.0 |

### Frontend
| Category | Technology |
|----------|------------|
| **Styling** | Tailwind CSS v4.1.17 |
| **UI Components** | Radix UI + shadcn/ui |
| **State Management** | TanStack React Query v5.90.10 |
| **Routing** | TanStack React Router v1.136.18 |
| **Forms** | React Hook Form v7.66.1 |
| **Validation** | Zod v4.1.12 |
| **Icons** | Lucide React v0.554.0 |

### Infrastructure
| Category | Technology |
|----------|------------|
| **Build Tool** | Vite v7.2.4 |
| **Language** | TypeScript v5.9.3 (strict mode) |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Container** | Docker Compose |

---

## 3. Key Components and Their Responsibilities

### Routes Layer (`src/routes/`)
- URL routing and page-level data loading
- Route guards and parameter handling
- Key routes: `dashboard/`, `profile/`, `api/auth`, `api/stripe`

### Components Layer (`src/components/`)
| Domain | Components |
|--------|------------|
| **Auth** | SignIn, SignUp forms |
| **Posts** | PostForm, CommentForm, CommentList |
| **Messaging** | ChatView, ConversationList, MessageInput |
| **Events** | EventDialog, Calendar, EventForm |
| **Portfolio** | PortfolioSection, PortfolioItemCard |
| **Subscriptions** | PricingSection, SubscriptionStatus |
| **Media** | MediaGallery, MediaDropzone, MediaLightbox |
| **UI Base** | Button, Card, Dialog, Input, etc. (shadcn/ui) |

### Hooks Layer (`src/hooks/`)
Custom hooks for data management:
- `usePosts`, `useComments`, `useMessages`
- `useSubscription`, `useStorage`
- `useNotifications`, `useProfile`

### Server Functions (`src/fn/`)
API endpoints with validation:
- CRUD operations for all entities
- Authentication middleware
- Stripe webhook handling

### Data Access Layer (`src/data-access/`)
Direct database operations using Drizzle ORM with type-safe queries.

---

## 4. Build and Test Commands

### Development
```bash
npm run dev              # Full dev environment (Docker + DB + Vite)
npm run dev:app          # Vite dev server only
```

### Build & Production
```bash
npm run build            # Production build with type checking
npm run start            # Start production server
```

### Database Management
```bash
npm run db:up            # Start PostgreSQL container
npm run db:down          # Stop PostgreSQL container
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate migrations from schema
npm run db:studio        # Open Drizzle Studio UI
```

### Payments
```bash
npm run stripe:listen    # Listen for Stripe webhooks locally
```

---

## 5. Conventions and Patterns

### File Naming
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PostForm.tsx` |
| Hooks | `use*` prefix | `usePosts.ts` |
| Utilities | camelCase | `storage.ts` |
| Routes | lowercase | `sign-in.tsx` |

### Path Aliases
```typescript
// Configured alias: ~/* → ./src/*
import { Button } from "~/components/ui/button"
```

### TypeScript Configuration
- **Strict mode** enabled
- Full type inference from Drizzle ORM schemas
- Path aliases configured

### Database Conventions
- UUID primary keys
- Timestamps on all records (`createdAt`, `updatedAt`)
- Explicit foreign key relations
- Drizzle ORM with PostgreSQL dialect

### Component Patterns
- **Headless composition** using Radix UI
- **CVA (Class Variance Authority)** for variants
- **React Hook Form** integration
- **ARIA** accessibility attributes

### Query Pattern
- Centralized query key management
- Query options pattern for reusability
- Automatic caching and invalidation

### Error Handling
- Custom error boundary components
- Toast notifications via Sonner
- Try-catch with context preservation

---

## 6. Key Features

| Feature | Description |
|---------|-------------|
| **Community Posts** | CRUD with media attachments |
| **User Profiles** | Skills, portfolio, bio |
| **Direct Messaging** | Private conversations |
| **Calendar Events** | Community event management |
| **Educational Modules** | Learning content |
| **Subscriptions** | 3-tier Stripe pricing (Free/Basic/Pro) |
| **File Uploads** | R2 storage with presigned URLs |
| **Notifications** | Real-time updates |

---

## 7. Documentation

The project includes comprehensive documentation in `docs/`:
- `architecture.md` - Layered architecture guide
- `authentication.md` - Better Auth setup
- `subscriptions.md` - Stripe integration
- `tanstack.md` - Routing and server functions
- `file-uploads.md` - R2 storage guide
- `theme.md` - Theming system
- `ux.md` - Design guidelines

Additional guides:
- `CLAUDE.md` - AI assistant guidance
- `README.md` - Project overview