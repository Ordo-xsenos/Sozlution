# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Отвечай пользователю на русском языке, если он пишет на русском, и на английском, если он пишет на английском. Всегда отвечай на языке пользователя.

## Project Overview

Sozlution is an English learning platform with IELTS preparation features. The frontend is a Next.js 16.2.0 (React 19) application that communicates with a separate Django backend API.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Generate API types from backend OpenAPI spec
pnpm gen:api-types

# Run end-to-end tests with Playwright
pnpm test:e2e
```

## Architecture

### Frontend Stack
- **Framework**: Next.js 16.2.0 with React 19, App Router
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS 4.2.0 with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context (`context/app-context.tsx`) for global user data, stats, and learning plans
- **3D Graphics**: @react-three/fiber for interactive animations
- **Testing**: Playwright for E2E tests

### Backend Integration
- Backend is a separate Python/Django service at `https://sozlution-backend-production.up.railway.app`
- API types are generated from `openapi.yml` (located in this repo but sourced from backend)
- Run `pnpm gen:api-types` after backend schema changes to regenerate `lib/api-types.ts`
- Authentication uses JWT tokens stored in localStorage (`lib/auth.ts`)
- API client utilities in `lib/api.ts` handle URL construction and legacy path compatibility

### Key Architectural Patterns

**Global State via AppContext**
- `context/app-context.tsx` provides `AppProvider` and `useApp` hook
- Manages user profile, learning stats, vocabulary words, and daily plans
- Handles authenticated API requests with automatic token injection
- Use this context for all user-related data rather than prop drilling

**API Type Safety**
- All API types are generated from OpenAPI spec in `lib/api-types.ts`
- Use `PathResponse` and `PathRequestBody` helper types for type-safe API calls
- Backend endpoints follow `/api/v1/*` pattern

**Multi-language Support**
- Components accept `lang` prop (English/Uzbek/Russian)
- Translation objects use `en`/`uz`/`ru` keys
- No external i18n library; translations are inline objects

**Authentication Flow**
- Login/register pages use `lib/auth-api.ts` for session management
- Tokens stored via `setAuthToken()` in `lib/auth.ts`
- Protected routes check token presence and redirect to `/login`
- Device ID tracking for analytics via `getOrCreateDeviceId()`

**AI Chatbot**
- `components/ai-chatbot.tsx` provides floating chat widget
- Routes through `/app/api/chat/route.ts` which proxies to external AI API
- Topic filtering enforces Sozlution/English learning scope via keyword matching
- Falls back to hardcoded responses if AI API unavailable

## Project Structure

```
app/
├── page.tsx              # Landing page with features/pricing
├── login/                # Authentication pages
├── register/
├── reset-password/
├── mvp/                  # Main application (authenticated)
│   ├── learn/            # Daily vocabulary lessons
│   ├── progress/         # Stats and streak tracking
│   ├── test/             # Placement tests
│   ├── coach/            # AI coaching features
│   └── settings/         # User preferences
├── ielts/                # IELTS-specific features
│   ├── dashboard/
│   ├── mock-tests/
│   ├── vocabulary/
│   └── writing/
└── api/
    └── chat/route.ts     # AI chatbot proxy endpoint

components/
├── ui/                   # shadcn/ui components
├── effects/              # Visual effects (click-spark, etc.)
├── auth/                 # Login/register forms
├── mvp/                  # MVP-specific components
└── ielts/                # IELTS-specific components

lib/
├── api.ts                # API URL builder
├── api-types.ts          # Generated from openapi.yml
├── auth.ts               # Token/device ID management
├── auth-api.ts           # Authentication API calls
└── utils.ts              # Utility functions

context/
└── app-context.tsx       # Global state provider
```

## Important Files

- `openapi.yml` - Backend API schema (regenerate types after changes)
- `context/app-context.tsx` - Global state management for user data
- `lib/api-types.ts` - Generated TypeScript types (do not edit manually)
- `components/ai-chatbot.tsx` - Chatbot widget with topic filtering
- `app/api/chat/route.ts` - AI proxy with keyword-based scope enforcement
- `tailwind.config.ts` - Theme configuration with CSS variable integration

## Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL (client-side accessible)
- `AI_API_KEY` - API key for AI chatbot service
- `AI_API_URL` - AI service endpoint URL

## Development Notes

**Path Aliases**
- Use `@/*` imports for all project files (configured in `tsconfig.json`)
- Example: `import { Button } from '@/components/ui/button'`

**Styling Conventions**
- CSS variables defined in `styles/globals.css` for theme colors
- Use Tailwind utility classes; avoid inline styles
- Dark mode supported via `next-themes` with `ThemeProvider`

**Component Patterns**
- Server components by default; add `'use client'` only when needed
- Forms use React Hook Form + Zod schemas
- Async data fetching in components via `useApp` context methods

**Testing**
- E2E tests in `tests/e2e/` using Playwright
- Tests run against `localhost:3000` (auto-started by Playwright config)
- Single worker, sequential execution to avoid race conditions

**Type Generation Workflow**
1. Backend team updates `openapi.yml`
2. Run `pnpm gen:api-types` to regenerate `lib/api-types.ts`
3. Fix any type errors in components using updated types
4. Never manually edit `lib/api-types.ts`

**AI Chatbot Scope**
- Only responds to Sozlution/English learning topics
- Keyword filtering in `app/api/chat/route.ts` (ALLOWED_KEYWORDS array)
- Add new allowed topics by updating keyword list
- Refusal messages localized for en/uz/ru

## Common Tasks

**Adding a new API endpoint integration**
1. Ensure endpoint exists in `openapi.yml`
2. Run `pnpm gen:api-types`
3. Use generated types from `lib/api-types.ts`
4. Make requests via `useApp` context methods or `buildApiUrl` helper

**Adding a new page**
1. Create in appropriate `app/` subdirectory
2. Use `@/` imports for components
3. Add authentication check if needed (check token, redirect to `/login`)
4. Pass `lang` prop for multi-language support

**Updating UI components**
- shadcn/ui components in `components/ui/` can be modified
- Follow existing patterns for variant props and styling
- Use `cn()` utility from `lib/utils.ts` for conditional classes

**Working with the learning plan system**
- Plans fetched via `useApp().fetchPlan()`
- Structure: Plan → DayPlan[] → word_ids[]
- Day status: 'locked' | 'current' | 'completed'
- Words include phonetics, translations (en/uz/ru), and audio URLs
