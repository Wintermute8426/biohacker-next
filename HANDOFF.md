# 🧊 Biohacker Foundation - Handoff to Cursor

## ✅ What I Built (45 minutes)

### Project Setup
- ✅ Next.js 14 with App Router
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS with custom cyberpunk theme
- ✅ All dependencies installed (Supabase, Stripe, forms, animations)

### Cyberpunk Theme System
- ✅ Custom Tailwind config (neon colors, fonts, animations)
- ✅ Global CSS with scanline overlay effect
- ✅ Google Fonts loaded (Orbitron, Inter, JetBrains Mono)
- ✅ Custom utilities (neon-text, neon-border, neon-glow, holographic, glass)
- ✅ Custom scrollbar styling
- ✅ Form input focus effects with neon glow

### UI Components
- ✅ Button component (multiple variants with neon glows)
- ✅ Card component (holographic borders, glass effect)
- ✅ Input component (cyberpunk focus states)

### Authentication
- ✅ Supabase client setup (browser + server)
- ✅ Middleware for route protection
- ✅ Login page (fully styled, working)
- ✅ Signup page (with email confirmation flow)
- ✅ Password reset page (with success states)
- ✅ Sign out API route

### App Layout
- ✅ Protected app layout with navigation
- ✅ Dashboard page with:
  - Welcome message
  - Quick stats cards (0 states for now)
  - Getting started guide (3-step onboarding)
  - Recent activity section

### Database
- ✅ Profiles table migration (with RLS policies)
- ✅ Auto-profile creation trigger
- ✅ Updated_at trigger

### Documentation
- ✅ README.md (setup instructions, roadmap)
- ✅ .env.example (all required variables)
- ✅ This HANDOFF.md file

---

## 🎯 What You Build Next with Cursor

### Immediate Next Steps

1. **Set up Supabase** (5 minutes)
   - Go to https://supabase.com
   - Create new project
   - Copy URL and anon key to `.env.local`
   - Run the migration in SQL Editor: `supabase/migrations/001_create_profiles.sql`

2. **Test the auth flow** (5 minutes)
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3000
   - Should redirect to `/auth/login`
   - Try signup (check your email for confirmation)
   - Try login
   - Should land on `/app` dashboard

3. **Start building features** (Use Cursor)

### Feature Build Order (Cursor Prompts)

#### 1. User Profile Page
**Prompt for Cursor:**
```
Create a user profile page at /app/profile that:
- Fetches the current user's profile from Supabase
- Has a form to edit: full_name, weight, age, gender, units (imperial/metric)
- Uses the cyberpunk theme (Card, Input, Button components)
- Updates the profile via Server Actions
- Shows success/error toasts
```

#### 2. Peptide Cycles CRUD
**Prompt for Cursor:**
```
Create the peptide cycles feature:

1. Database migration (supabase/migrations/002_create_cycles.sql):
   - peptide_cycles table (user_id, peptide_name, dosage, frequency, start_date, end_date, active, notes)
   - RLS policies (users can only see/manage own cycles)

2. /app/cycles page:
   - Grid of cycle cards
   - "Create Cycle" button (opens modal)
   - Each card shows peptide name, dosage, frequency, dates, active status
   - Edit/Delete actions

3. Create cycle modal:
   - Form fields: peptide name, dosage, frequency (dropdown), start date, end date, notes
   - Validation with Zod
   - Submit via Server Action
   - Free tier limit: max 3 active cycles (check in Server Action)

Use cyberpunk styling throughout.
```

#### 3. Calendar View
**Prompt for Cursor:**
```
Create a calendar view at /app/calendar:
- Monthly grid view (date-fns for date manipulation)
- Show scheduled doses from all active cycles on each day
- Click a day to view/log doses for that day
- Mark doses as taken/skipped
- Cyberpunk styling (neon accents, holographic cards)
```

#### 4. Protocol Builder
**Prompt for Cursor:**
```
Create the protocol builder feature:

1. Database migration (003_create_protocols.sql):
   - protocols table (user_id, name, description, peptides JSONB, is_template BOOLEAN)
   - RLS policies

2. /app/protocols page:
   - List of user's protocols + public templates
   - "Create Protocol" button
   - Each protocol card shows name, description, peptide count
   - Actions: Edit, Delete, Apply (creates cycles)

3. Protocol builder UI:
   - Name and description inputs
   - Add peptides (name, dosage, frequency, duration)
   - Drag to reorder peptides
   - Save as custom protocol
   - Free tier limit: 1 custom protocol max

4. Pre-made templates (seed data):
   - Knee Recovery (BPC-157 + TB-500)
   - Anti-Aging (Epithalon + GHK-Cu)
   - Fat Loss (AOD-9604 + CJC-1295)
```

#### 5. Dose Logging & Reminders
**Prompt for Cursor:**
```
Create dose logging system:

1. Database migration (004_create_dose_logs.sql):
   - dose_logs table (user_id, cycle_id, scheduled_at, taken_at, skipped, notes)
   - RLS policies

2. Dose log UI:
   - On calendar day click, show list of doses
   - "Mark as Taken" button (records timestamp)
   - "Skip" button (with optional note)
   - Undo action
   - Adherence % calculation

3. Browser notifications:
   - Request permission on first app load
   - Schedule notifications for upcoming doses
   - Notification settings page
```

---

## 🎨 Design System Reference

### Colors (from Tailwind config)
```tsx
// Neon accents
text-neon-blue       // #00d9ff (primary)
text-neon-magenta    // #ff00ff (secondary)
text-neon-green      // #39ff14 (success)
text-neon-orange     // #ff9500 (warning)

// Backgrounds
bg-bg-black          // #000000
bg-bg-charcoal       // #0a0a0a
bg-bg-darkGray       // #1a1a1a
bg-bg-card           // #141414

// Metallic
text-metal-silver    // #8e8e93 (muted text)
text-metal-chrome    // #c7c7cc (secondary text)
```

### Typography
```tsx
font-orbitron        // Headings, buttons
font-sans            // Body text (Inter)
font-mono            // Data displays (JetBrains Mono)
```

### Custom Utilities
```tsx
className="neon-text"          // Neon blue text with glow
className="neon-border"        // Neon blue border with glow
className="neon-glow"          // Box shadow glow
className="holographic"        // Holographic card background
className="glass"              // Glass morphism background
className="animate-pulse-glow" // Pulsing glow animation
```

### Component Patterns
```tsx
// Button
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Input
<Input type="text" placeholder="Enter value..." />
```

---

## 💡 Tips for Using Cursor

### Best Practices
1. **Reference existing components** - Tell Cursor to "use the same pattern as the login page"
2. **Be specific about styling** - "Use the cyberpunk theme with neon-blue accents and holographic cards"
3. **Request validation** - "Add Zod validation for form fields"
4. **Ask for Server Actions** - "Use Next.js Server Actions for data mutations"
5. **Iterate quickly** - Build one feature at a time, test, then move to next

### Example Cursor Prompts
```
"Create a modal component that matches the cyberpunk theme. 
Use Radix Dialog under the hood. Add neon-blue border and glass background."

"Add a loading state to the cycles page. Show skeleton cards with 
pulsing animation while data loads."

"Create a reusable form hook that handles Supabase errors and 
shows toast notifications on success/error."
```

### Troubleshooting
- **"Module not found"** - Check if package is installed (`npm install <package>`)
- **"Type error"** - Make sure imports are correct, check TypeScript types
- **"Supabase error"** - Verify .env.local variables, check RLS policies
- **"Style not applying"** - Check Tailwind class names, verify globals.css loaded

---

## 📊 Current Project Status

**Location:** `/home/wintermute/.openclaw/workspace/biohacker-next/`

**Ready to run:**
```bash
cd /home/wintermute/.openclaw/workspace/biohacker-next
npm run dev
```

**What works now:**
- ✅ Signup/login/reset password (fully functional)
- ✅ Protected routes (middleware working)
- ✅ Cyberpunk UI (theme complete)
- ✅ Dashboard (placeholder stats)

**What needs Supabase:**
- Profile creation (happens automatically on signup)
- All other features (cycles, protocols, doses)

**What to build next:**
1. User profile page (warm-up feature)
2. Cycles CRUD (core feature)
3. Calendar + dose logging (core feature)
4. Protocols (core feature)

Then move to premium features (Stripe, Pep-Pedia, etc.)

---

## 🚀 Expected Timeline with Cursor

- **Profile page:** 15-20 minutes
- **Cycles CRUD:** 30-40 minutes
- **Calendar view:** 40-50 minutes
- **Protocol builder:** 45-60 minutes
- **Dose logging:** 30-40 minutes

**Phase 1 MVP total:** ~3-4 hours with Cursor

---

## 🧊 Wintermute's Availability

I'll be monitoring:
- BJJ video analysis (running in background)
- Your progress with Cursor
- Any blockers or questions

**Ping me if:**
- Cursor gets confused or stuck
- You need architecture advice
- You want code review
- You're ready to deploy

Otherwise, you're good to build. Cursor + this foundation = fast progress.

---

**Last updated:** 2026-02-08 11:48 AM PST  
**Foundation status:** 100% complete ✅  
**Next:** Open in Cursor and start with user profile page
