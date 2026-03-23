# Pueblo (AquiAhora) 📍

A modern location-based journaling web application that allows users to create and manage journal entries tied to specific municipalities. Built with Next.js 16, deployed on Vercel, and wrapped with Capacitor for native mobile experiences.

**🌐 Live Demo:** https://pueblo-six.vercel.app/

![Demo](./demo.gif)

---

## 📱 Overview

Pueblo (also known as AquiAhora) is a responsive web application that enables users to:

- **Journal by Location** — Create entries associated with specific municipalities
- **Interactive Map** — Visual representation of nearby locations using Leaflet
- **Secure Authentication** — Login/logout with Supabase Auth
- **Real-Time Sync** — Automatic data synchronization with Supabase backend
- **Cross-Platform** — Works on web, iOS, and Android via Capacitor

---

## ✨ Features

### Core Functionality

- ✅ **User Authentication** — Secure login and logout
- ✅ **Create Entries** — Add journal entries with title and description
- ✅ **View Entries** — Browse complete entry history
- ✅ **Location-Based** — Entries tied to specific municipalities
- ✅ **Interactive Maps** — Leaflet maps showing nearby locations
- ✅ **Real-Time Updates** — Live data synchronization with Supabase
- ✅ **Responsive Design** — Works seamlessly on mobile, tablet, and desktop

### User Experience

- 🎨 Modern, clean UI with Tailwind CSS
- 🗺️ Interactive map visualization
- 📱 Mobile-first responsive design
- ⚡ Fast page loads with Next.js App Router
- 🔄 Smart caching and background sync with TanStack Query
- 💾 Persistent UI state with Zustand
- 🌍 Geolocation support via Capacitor

---

## 🏗️ Architecture

### Technology Stack

**Frontend Framework**

- **Next.js 16.1.1** — React framework with App Router
- **React 19.2.0** — Latest React with concurrent features
- **TypeScript 5** — Type-safe development

**State Management**

- **TanStack Query 5** — Server state: fetching, caching, and synchronization
- **Zustand 5** — Client state: UI preferences and selected municipality

**Backend & Database**

- **Supabase** — Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Built-in authentication

**Styling**

- **Tailwind CSS 4** — Utility-first CSS framework
- **PostCSS** — CSS transformations

**Maps & Geolocation**

- **Leaflet 1.9.4** — Interactive maps library
- **React Leaflet 5.0.0** — React components for Leaflet
- **Capacitor Geolocation 7.1.5** — Native geolocation API

**Mobile Integration**

- **Capacitor 7.4.4** — Cross-platform native runtime
  - iOS support
  - Android support
  - Web support (PWA)

**Package Manager**

- **Bun** — Fast JavaScript runtime and package manager

---

## 📦 Project Structure

```
pueblo/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout with ReactQueryProvider
│   ├── page.tsx                      # Home page
│   ├── login/                        # Login page
│   ├── entries/                      # Entries page
│   └── auth/callback/                # Supabase auth callback
│
├── components/                       # React components
│   ├── EntryForm.tsx                 # Create entry form
│   ├── HomePage.tsx                  # Main map view
│   ├── LocationCapture.tsx           # Background geolocation
│   ├── Menu.tsx                      # Side menu with logout
│   ├── Navbar.tsx                    # Navigation bar
│   └── providers/
│       └── ReactQueryProvider.tsx    # QueryClient + auth state sync
│
├── lib/                              # Core utilities
│   ├── supabase/
│   │   └── client.ts                 # Supabase client setup
│   │
│   ├── queries/                      # TanStack Query hooks
│   │   ├── client.ts                 # QueryClient configuration
│   │   ├── keys.ts                   # Query key factory
│   │   ├── useMunicipiosQuery.ts     # Nearby municipios queries
│   │   ├── useEntriesQuery.ts        # Entries queries
│   │   └── useSession.ts             # Auth session query
│   │
│   ├── store/                        # Zustand stores
│   │   └── useAppStore.ts            # UI state (selected municipio)
│   │
│   ├── platform/                     # Platform utilities
│   │   ├── location.ts               # Geolocation helpers
│   │   └── storage.ts                # Local storage wrapper
│   │
│   └── types.ts                      # TypeScript types
│
├── public/                           # Static assets
├── android/                          # Android Capacitor project
├── ios/                              # iOS Capacitor project
├── capacitor.config.ts               # Capacitor configuration
├── next.config.ts                    # Next.js configuration
└── package.json                      # Project dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** or **Bun 1.0+**
- **Git**
- **Supabase Account** — [Sign up for free](https://supabase.com)
- **Xcode** (for iOS development) — macOS only
- **Android Studio** (for Android development)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/kebuenokebueno/pueblo.git
cd pueblo
```

#### 2. Install dependencies

```bash
bun install
```

#### 3. Configure Supabase

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get your credentials from: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

#### 4. Set up the database

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create municipios table
CREATE TABLE municipios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create entries table
CREATE TABLE "Entries" (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  entry_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  municipio_id TEXT REFERENCES municipios(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entries" ENABLE ROW LEVEL SECURITY;

-- Municipios policies (public read)
CREATE POLICY "Municipios are viewable by everyone"
  ON municipios FOR SELECT USING (true);

-- Entries policies (user-specific)
CREATE POLICY "Users can view their own entries"
  ON "Entries" FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
  ON "Entries" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON "Entries" FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON "Entries" FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX entries_user_id_idx ON "Entries"(user_id);
CREATE INDEX entries_municipio_id_idx ON "Entries"(municipio_id);
CREATE INDEX entries_created_at_idx ON "Entries"(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON "Entries"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC: get latest entries for current user
CREATE OR REPLACE FUNCTION ultimas_entradas()
RETURNS TABLE (
  id bigint,
  entry_date text,
  title text,
  description text,
  municipio_id text,
  user_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.entry_date, e.title, e.description, e.municipio_id, e.user_id
  FROM "Entries" e
  WHERE e.user_id = auth.uid()
  ORDER BY e.entry_date DESC LIMIT 50;
END;
$$;

-- RPC: insert entry for current user
CREATE OR REPLACE FUNCTION insert_entry(
  title text,
  description text,
  entry_date text,
  municipio_id text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO "Entries" (title, description, entry_date, municipio_id, user_id)
  VALUES (title, description, entry_date, municipio_id, auth.uid());
END;
$$;

-- RPC: get nearby municipios
CREATE OR REPLACE FUNCTION municipios_cercanos(lat_input float, lon_input float)
RETURNS TABLE (
  id int,
  nombre text,
  provincia text,
  latitud text,
  longitud text,
  distancia_metros float
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id, m.nombre, m.provincia, m.latitud, m.longitud,
    ST_Distance(
      ST_MakePoint(lon_input, lat_input)::geography,
      ST_MakePoint(m.longitud::float, m.latitud::float)::geography
    ) AS distancia_metros
  FROM municipios m
  ORDER BY distancia_metros ASC
  LIMIT 20;
END;
$$;
```

#### 5. Run the development server

```bash
bun dev
```

Open http://localhost:3000 in your browser.

---

## 📊 State Management

The app uses a two-layer state management architecture with a clear separation of concerns.

### TanStack Query — Server State

Handles all data that lives on the server: fetching, caching, background sync, and invalidation.

```ts
// Fetch entries with automatic caching
const { data: entries, isLoading } = useEntriesQuery(!!session)

// Invalidate after mutation so the list refreshes
await queryClient.invalidateQueries({ queryKey: entriesQueryKey })

// Clear user data on logout
queryClient.removeQueries({ queryKey: entriesQueryKey })
queryClient.removeQueries({ queryKey: municipiosQueryKey })
```

Query keys are defined in a central factory (`lib/queries/keys.ts`) for consistency:

```ts
export const sessionQueryKey    = ['supabase', 'session']    as const
export const municipiosQueryKey = ['municipios', 'cercanos'] as const
export const entriesQueryKey    = ['entries', 'ultimas']     as const
```

Default query config (`lib/queries/client.ts`):

```ts
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime:   10 * 60 * 1000,  // 10 minutes
  retry: 1,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
}
```

### Zustand — Client State

Handles UI-only state that doesn't need to be fetched from the server.

```ts
// lib/store/useAppStore.ts
const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        selectedMunicipio: null,
        setSelectedMunicipio: (m) => set({ selectedMunicipio: m }),
        clearSelectedMunicipio: () => set({ selectedMunicipio: null }),
        sidebarOpen: true,
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ selectedMunicipio: state.selectedMunicipio }),
      }
    ),
    { name: 'pueblo/ui' }
  )
)
```

`selectedMunicipio` is persisted to localStorage so it survives page refreshes. The Zustand store is visible under `pueblo/ui` in the Redux DevTools browser extension.

### Auth Sync

`ReactQueryProvider` bridges Supabase's auth listener with TanStack Query's cache, so session state is always consistent without extra fetches:

```ts
supabase.auth.getSession().then(({ data }) => {
  client.setQueryData(sessionQueryKey, data.session ?? null)
})

supabase.auth.onAuthStateChange((_event, session) => {
  client.setQueryData(sessionQueryKey, session ?? null)
})
```

---

## 📱 Mobile Development (Capacitor)

### iOS

```bash
bun run build
bun run cap:sync
bun run cap:open:ios
```

**Requirements:** macOS, Xcode 15+, CocoaPods

### Android

```bash
bun run build
bun run cap:sync
bun run cap:open:android
```

**Requirements:** Android Studio, Android SDK 33+, JDK 17+

---

## 🌐 Deployment

The app uses `output: 'export'` for static export and is deployed on Vercel.

**Live:** https://pueblo-six.vercel.app/

```bash
# Deploy via Vercel CLI
vercel --prod
```

Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

---

## 🔐 Security

- ✅ **Row Level Security (RLS)** — Users can only access their own data
- ✅ **Authentication Required** — All entry operations require a valid session
- ✅ **HTTPS Only** — All communication encrypted via Vercel/Supabase
- ✅ **No API Keys in Code** — Environment variables for all sensitive data
- ✅ **SQL Injection Protection** — Prepared statements via Supabase RPC

---

## 📈 Roadmap

- [ ] Edit and delete entries
- [ ] Photo attachments
- [ ] Search and filter by date, location, or keyword
- [ ] Export to PDF/CSV
- [ ] Dark mode
- [ ] Full offline support with background sync
- [ ] Push notifications

---

## 👨‍💻 Author

**kebuenokebueno**

- GitHub: [@kebuenokebueno](https://github.com/kebuenokebueno)
- Live Demo: [pueblo-six.vercel.app](https://pueblo-six.vercel.app/)

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
