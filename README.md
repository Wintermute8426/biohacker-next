# Biohacker - Peptide Protocol Tracker

A cyberpunk-themed web app for tracking peptide cycles, protocols, and doses with precision.

## Features

- 🔐 **Authentication** - Email/password signup & login (Supabase Auth)
- 🎨 **Cyberpunk UI** - Neon-accented dark theme with glowing effects
- 📱 **Responsive** - Mobile-first design
- 🔒 **Type-safe** - Built with TypeScript

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom Cyberpunk Theme
- **Auth & Database:** Supabase
- **Payments:** Stripe (coming soon)
- **Fonts:** Orbitron, Inter, JetBrains Mono

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials from https://supabase.com/dashboard

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to http://localhost:3000

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations in `supabase/migrations/` (in order)

## Project Structure

```
biohacker-next/
├── app/
│   ├── (app)/           # Protected app routes
│   ├── auth/            # Auth pages (login, signup, reset)
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # Reusable UI components
│   ├── auth/            # Auth-specific components
│   └── shared/          # Shared components
├── lib/
│   ├── supabase/        # Supabase client setup
│   ├── utils.ts         # Utility functions
│   └── hooks/           # Custom React hooks
└── supabase/
    └── migrations/      # Database migrations
```

## Development Roadmap

### Phase 1: Foundation (Complete)
- [x] Next.js 14 setup
- [x] Tailwind CSS cyberpunk theme
- [x] Supabase auth integration
- [x] Login/signup/reset password pages
- [x] Protected app layout

### Phase 2: Core Features (Next - Use Cursor)
- [ ] User profile management
- [ ] Peptide cycle CRUD
- [ ] Calendar view
- [ ] Dose logging
- [ ] Protocol builder

### Phase 3: Premium Features
- [ ] Stripe subscription integration
- [ ] Feature gates (free vs premium)
- [ ] Pep-Pedia integration
- [ ] Supplement tracking
- [ ] Data export

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

This project was scaffolded by Wintermute (AI agent). Rooz is building the features using Cursor.

## License

Private project - All rights reserved
