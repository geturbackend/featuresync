# urBackend Examples — Master Plan

This repo hosts production-quality example apps built on **urBackend** to showcase its core features.
Each example lives in its own sub-folder and is self-contained.

---

## Examples Roadmap

| # | App | Description | Status |
|---|-----|-------------|--------|
| 1 | `featuresync/` | Canny.io clone — Feature request board | Planning |

---

## Example 1 — FeatureSync (`featuresync/`)

> A **Canny.io clone** that demonstrates Auth, Database, RLS, and Admin Roles all in one Next.js app.

---

## Tech Stack

- **Framework:** Next.js (App Router, JavaScript — no TypeScript for simplicity as an example)
- **Styling:** Vanilla CSS (`globals.css` + component-scoped styles)
- **Auth + DB:** `@urbackend/react` + `@urbackend/sdk`
- **Font:** Inter from Google Fonts

### Install commands

```bash
npx -y create-next-app@latest featuresync --no-typescript --no-tailwind --eslint --app --src-dir --import-alias "@/*"
cd featuresync
npm install @urbackend/react @urbackend/sdk
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_URBACKEND_API_KEY=pk_live_...
URBACKEND_SECRET_KEY=sk_live_...
```

**Critical rules (from docs):**
- ONLY ever use `pk_live_...` (Publishable Key) on the frontend. NEVER `sk_live_...`.
- The env var must be prefixed `NEXT_PUBLIC_` to be accessible in the browser.
- The SDK logs a console warning if it detects `sk_live_` in a browser context.
- No `NEXT_PUBLIC_URBACKEND_PROJECT_ID` needed — the API key identifies the project.

---

## urBackend Dashboard Setup (Step-by-Step Guide)

Before running the app, you must configure your urBackend project exactly like this:

### Step 1 — Create the `users` Collection
This is required by the urBackend auth system.
1. Go to **Database** -> **Collections** -> **Create Collection**
2. Name it exactly: `users`
3. Add the following fields:
   - Field name: `email`, Type: `String`, check **Required**, check **Unique**
   - Field name: `password`, Type: `String`, check **Required**
   - Field name: `name`, Type: `String`
   - Field name: `role`, Type: `String`, Default Value: `"user"`
4. Click **Save Collection**.

### Step 2 — Create the `features` Collection
This will store all the feature requests.
1. Create a new collection named: `features`
2. Add the following fields:
   - Field name: `title`, Type: `String`, check **Required**
   - Field name: `description`, Type: `String`, check **Required**
   - Field name: `status`, Type: `String`, check **Required**, Default Value: `"under_review"`
   - Field name: `userId`, Type: `Ref` (Reference to `users` collection), check **Required** (This is for RLS)
   - Field name: `userName`, Type: `String`
   - Field name: `votes`, Type: `Array` (set array item type to `Ref` pointing to `users` collection)
   - Field name: `tags`, Type: `Array`
3. Go to the **Security / Rules (RLS)** tab for this collection:
   - Enable **Row Level Security (RLS)**
   - Set Mode to: `public-read` (anyone can read, but only owners can write)
   - Set Owner Field to: `userId`
4. Click **Save Collection**.

### Step 3 — Create the `comments` Collection
This will store the comments for each feature.
1. Create a new collection named: `comments`
2. Add the following fields:
   - Field name: `featureId`, Type: `Ref` (Reference to `features` collection), check **Required**
   - Field name: `content`, Type: `String`, check **Required**
   - Field name: `userId`, Type: `Ref` (Reference to `users` collection), check **Required**
   - Field name: `userName`, Type: `String`
3. Go to the **Security / Rules (RLS)** tab:
   - Enable **Row Level Security (RLS)**
   - Set Mode to: `public-read`
   - Set Owner Field to: `userId`
4. Click **Save Collection**.

### Step 4 — Enable Authentication
1. Go to the **Authentication** tab in the sidebar.
2. Ensure **Allow Public Signups** is toggled **ON** (so new users can register).
3. Optionally, enable Social Providers like Google or GitHub if you have Client IDs.

### Step 5 — Set Site URL (Important for Auth)
1. Go to **Project Settings**.
2. Find **Site URL** and set it to: `http://localhost:3000` (Update this when deploying to production).

---

## RLS Design — Critical Clarifications

### How `userId` auto-injection works (docs-verified)

When inserting with `pk_live` + user JWT + RLS enabled:
- If you **omit** `userId` from the body → urBackend auto-injects the authenticated user's ID. ✅
- If you **include** `userId` and it matches the JWT → allowed.
- If you **include** `userId` but it doesn't match JWT → 403 rejected.

**Consequence for our insert calls:**

```js
// CORRECT — omit userId, let urBackend inject it
db.insert('features', { title, description, tags, userName: user.name, votes: [], status: 'under_review' }, accessToken)

// ALSO CORRECT — include it explicitly (must match)
db.insert('features', { title, description, tags, userId: user._id, userName: user.name, votes: [], status: 'under_review' }, accessToken)
```

### How to pass the token from React hooks

`useDb()` returns the raw db client. For RLS writes you must pass the access token manually:

```js
const db = useDb();
const { user } = useUser();
const { getToken } = useAuth(); // useAuth exposes getToken()

// Pass token as 3rd argument to insert
await db.insert('features', { ... }, getToken());

// Pass token as 3rd argument to update/patch/delete
await db.patch('features', featureId, { status: 'planned' }, getToken());
await db.delete('features', featureId, getToken());
```

**Note:** `useAuth()` returns `{ login, logout, error, isLoading }` — check if `getToken()` is available or use `useUser()` to read `user` and store the token from login response. The React SDK manages the access token internally via the provider — access it via `client.auth.getToken()` if needed.

### Votes array — no `$push` operator

urBackend does NOT have MongoDB `$push`/`$pull` operators. The votes array must be managed client-side:

```js
// To vote:
const feature = await db.getOne('features', featureId);
const newVotes = [...feature.votes, user._id];
await db.patch('features', featureId, { votes: newVotes }, token);

// To unvote:
const newVotes = feature.votes.filter(id => id !== user._id);
await db.patch('features', featureId, { votes: newVotes }, token);
```

**RLS concern on votes:** `votes` patch is updating a feature the user does NOT own. This will be blocked by RLS (only owner can update). **Design decision needed:**
- Option A: Use `sk_live` on a Next.js API route (`/api/vote`) to perform the patch server-side. ✅ Recommended.
- Option B: Make votes a separate collection with its own RLS (each vote is a document owned by the voter).
- **Plan decision: Use Option A — a Next.js API Route with `sk_live` for votes and status updates.**

### Admin status updates — same RLS issue

An admin changing `status` on someone else's feature will hit a 403 RLS owner mismatch. Solution: same server-side API route pattern using `sk_live`.

---

## Pages — Docs-Validated Design

### `Providers.js` (required for Next.js App Router)

```js
// src/providers/Providers.js
"use client";
import { UrProvider } from '@urbackend/react';

export function Providers({ children }) {
  return (
    <UrProvider apiKey={process.env.NEXT_PUBLIC_URBACKEND_API_KEY}>
      {children}
    </UrProvider>
  );
}
```

### `layout.js`

```js
// src/app/layout.js
import { Providers } from '../providers/Providers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FeatureSync — Feature Request Board',
  description: 'Submit and vote on feature requests. Built on urBackend.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Page 1 — `/` Public Feature Board

**urBackend calls:**
```js
const db = useDb();
// Public read — no token needed (public-read RLS mode)
const features = await db.getAll('features', { sort: 'createdAt:desc', limit: 100 });
```

**Sort logic (client-side):**
```js
// Most voted
const sorted = [...features].sort((a, b) => b.votes.length - a.votes.length);
// Newest
const sorted = [...features].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

**Filter logic (can use db filter OR client-side):**
```js
// Server-side filter (preferred)
const features = await db.getAll('features', { filter: { status: 'planned' } });
// OR client-side filter
const filtered = features.filter(f => f.status === selectedStatus);
```

**isInitializing guard (important):**
```js
const { user, isInitializing } = useUser();
if (isInitializing) return <LoadingSkeleton />;
```

### Page 2 — `/login`

```js
// src/app/login/page.js
"use client";
import { GuestRoute, UrAuth } from '@urbackend/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  return (
    <GuestRoute fallback={<div>Loading...</div>} onRedirect={() => router.push('/')}>
      <UrAuth
        providers={['google', 'github']}
        enableEmailPassword={true}
        theme="light"
        branding={{ appName: 'FeatureSync', subtitle: 'Submit and vote on feature requests' }}
        onSuccess={() => router.push('/')}
      />
    </GuestRoute>
  );
}
```

**Notes from docs:**
- `GuestRoute` auto-redirects already-logged-in users away from the login page. Use it here.
- `onSuccess` callback fires after successful sign-in or sign-up.
- Social login redirects user to the provider then back to `<siteUrl>/auth/callback` — this is handled automatically by urBackend, NOT by our app.
- `providers` accepts array form `['google', 'github']` OR object form `{ google: true, github: true, emailPassword: true }`.
- `hideSignup={false}` is the default — no need to set it explicitly.

### Page 3 — `/submit` (Protected)

```js
"use client";
import { ProtectedRoute } from '@urbackend/react';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const router = useRouter();
  return (
    <ProtectedRoute fallback={<div>Loading...</div>} onRedirect={() => router.push('/login')}>
      <SubmitForm />
    </ProtectedRoute>
  );
}
```

**DB insert (omit userId — auto-injected):**
```js
const db = useDb();
const { user } = useUser();

// Get access token from auth context
// useAuth() gives login/logout — for token, read from user session
// The React SDK stores token internally; access via the underlying client if needed

await db.insert('features', {
  title,
  description,
  tags,
  userName: user.name || user.email,
  votes: [],
  status: 'under_review'
  // userId is intentionally OMITTED — urBackend auto-injects it
}, token);
```

**Accessing the token in React hooks:**
The React SDK's `useAuth()` exposes `login` / `logout` but NOT `getToken()` directly per the hooks docs. The access token is managed internally. Options:
- Store it in component state after login if building custom flow.
- Use the underlying `@urbackend/sdk` client that `useDb()` wraps — it calls its own `auth.getToken()` internally for authenticated requests.
- Check if `useAuth()` exposes additional methods in the actual SDK source.

**Action: verify `useAuth()` return shape in `sdks/urbackend-react` source before building `/submit`.**

### Page 4 — `/feature/[id]`

```js
// Fetch feature
const feature = await db.getOne('features', id);

// Fetch comments for this feature
const comments = await db.getAll('comments', { filter: { featureId: id }, sort: 'createdAt:asc' });

// Post comment (RLS write — userId auto-injected)
await db.insert('comments', { featureId: id, content, userName: user.name }, token);

// Vote / Unvote — goes through API route (see server-side routes section)
await fetch('/api/vote', { method: 'POST', body: JSON.stringify({ featureId: id, userId: user._id, action: 'toggle' }) });
```

**Owner check for edit/delete:**
```js
const canEdit = user && (user._id === feature.userId || user.role === 'admin');
```

**Note on `user.role`:** The `role` field must exist in the `users` collection schema in the dashboard. Set `role: "admin"` manually for admin users (or via a dashboard admin panel / direct DB seed).

### Page 5 — `/admin` (Admin Only)

Admin check:
```js
const { user, isInitializing } = useUser();
if (!isInitializing && (!user || user.role !== 'admin')) router.push('/');
```

Status update goes through server API route (to bypass RLS):
```js
await fetch('/api/admin/update-status', {
  method: 'POST',
  body: JSON.stringify({ featureId, status })
});
```

Delete also goes through server API route:
```js
await fetch('/api/admin/delete-feature', {
  method: 'DELETE',
  body: JSON.stringify({ featureId })
});
```

---

## Server-Side API Routes (Next.js Route Handlers)

These use `sk_live` on the server to bypass RLS for cross-user operations.

```
src/app/api/
├── vote/
│   └── route.js         ← Toggle vote on a feature (sk_live patch)
├── admin/
│   ├── update-status/
│   │   └── route.js     ← Admin status change (sk_live patch)
│   └── delete-feature/
│       └── route.js     ← Admin delete (sk_live delete)
```

**Example `vote/route.js`:**
```js
import urBackend from '@urbackend/sdk';
import { NextResponse } from 'next/server';

const client = urBackend({ apiKey: process.env.URBACKEND_SECRET_KEY });

export async function POST(req) {
  const { featureId, userId, action } = await req.json();
  const feature = await client.db.getOne('features', featureId);
  let newVotes = feature.votes || [];

  if (action === 'toggle') {
    if (newVotes.includes(userId)) {
      newVotes = newVotes.filter(id => id !== userId);
    } else {
      newVotes = [...newVotes, userId];
    }
  }

  const updated = await client.db.patch('features', featureId, { votes: newVotes });
  return NextResponse.json({ success: true, data: updated });
}
```

**Required additional env var (server-side only, NOT prefixed with NEXT_PUBLIC_):**
```env
URBACKEND_SECRET_KEY=sk_live_...
```

---

## Complete File Structure

```
featuresync/
├── src/
│   ├── app/
│   │   ├── layout.js                    <- Root layout (Providers + metadata)
│   │   ├── page.js                      <- Public board (/)
│   │   ├── globals.css                  <- Design system + CSS variables
│   │   ├── login/
│   │   │   └── page.js                 <- GuestRoute + UrAuth
│   │   ├── submit/
│   │   │   └── page.js                 <- ProtectedRoute + submit form
│   │   ├── feature/
│   │   │   └── [id]/
│   │   │       └── page.js             <- Detail + comments + vote
│   │   ├── admin/
│   │   │   └── page.js                 <- Admin dashboard (role check)
│   │   └── api/
│   │       ├── vote/
│   │       │   └── route.js            <- Server: toggle vote (sk_live)
│   │       └── admin/
│   │           ├── update-status/
│   │           │   └── route.js        <- Server: status update (sk_live)
│   │           └── delete-feature/
│   │               └── route.js        <- Server: delete feature (sk_live)
│   ├── components/
│   │   ├── Navbar.js                   <- Logo, nav links, UrUserButton
│   │   ├── FeatureCard.js              <- Card: title, desc, votes, status, tags
│   │   ├── VoteButton.js               <- Arrow-up icon + count, calls /api/vote
│   │   ├── StatusBadge.js              <- Color-coded pill badge
│   │   ├── TagBadge.js                 <- Tag chip
│   │   ├── CommentBox.js               <- Comment list + input
│   │   ├── FilterBar.js                <- Status filter tabs
│   │   ├── SortBar.js                  <- Most Voted / Newest toggle
│   │   └── LoadingSkeleton.js          <- Skeleton while isInitializing
│   └── providers/
│       └── Providers.js                <- "use client" UrProvider wrapper
├── .env.local                           <- NEXT_PUBLIC_ + URBACKEND_SECRET_KEY
├── .env.local.example                  <- Safe to commit — no real values
└── README.md                           <- Full setup guide
```

---

## urBackend Features Map (Docs-Verified)

| Feature | Where Used | Exact API |
|---------|-----------|-----------|
| `<UrProvider>` | `Providers.js` | `apiKey={process.env.NEXT_PUBLIC_URBACKEND_API_KEY}` |
| `<UrAuth>` | `/login` page | `providers`, `theme`, `branding`, `onSuccess` props |
| `<GuestRoute>` | `/login` page | `fallback` + `onRedirect` — redirects logged-in users away |
| `<ProtectedRoute>` | `/submit` page | `fallback` + `onRedirect` — redirects guests to login |
| `<UrUserButton>` | `Navbar.js` | `position="inline"`, `onProfileClick`, auto-hides if logged out |
| `useUser()` | All pages | `{ user, isAuthenticated, isLoading, isInitializing }` |
| `useAuth()` | Navbar (logout) | `{ login, logout, error, isLoading }` |
| `useDb()` | All data pages | `db.getAll()`, `db.getOne()`, `db.insert()`, `db.patch()`, `db.delete()` |
| Public Read (`pk_live`) | Board + Detail page | `db.getAll()` without token — works because `public-read` RLS |
| RLS Write (`pk_live` + JWT) | Submit + Comment | Pass `token` as 3rd arg to `db.insert()` |
| Server-side writes (`sk_live`) | API Routes | Used for vote toggle + admin actions that cross ownership |
| Admin Role Check | `/admin` + detail page | `user.role === 'admin'` — field must be in `users` schema |
| Soft Delete | Behind the scenes | `db.delete()` soft-deletes (30-day grace). Deleted docs excluded by default. |

---

## UI Design System

### Theme
- **Sidebar:** `#0f0f0f` dark — logo + nav links
- **Content area:** `#f8f8f8` light — feature cards
- **Accent:** `#5B4FFF` — brand purple (vote button, CTA, active states)
- **Font:** Inter (via `next/font/google`)

### Status Badge Colors
| Status | Color |
|--------|-------|
| `under_review` | `#9ca3af` — Grey |
| `planned` | `#3b82f6` — Blue |
| `in_progress` | `#f59e0b` — Amber |
| `done` | `#22c55e` — Green |

### CSS Variables (globals.css)
```css
:root {
  --color-bg: #f8f8f8;
  --color-sidebar: #0f0f0f;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-accent: #5B4FFF;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
}
```

### Vote Button States
- **Not voted:** outlined border, grey arrow
- **Voted:** solid `--color-accent` fill, white arrow
- **Transition:** `all 0.15s ease`

### UrUserButton in Navbar
```js
<UrUserButton
  position="inline"   // fits into flex navbar layout
  shape="circle"
/>
```

---

## Error Handling

From docs — SDK throws typed errors:
```js
import { AuthError, NotFoundError, RateLimitError, ValidationError } from '@urbackend/sdk';
```

Key errors to handle in the UI:
- `AuthError` (401/403) — session expired → redirect to login
- `NotFoundError` (404) — feature deleted → show "not found" state
- `ValidationError` (400) — bad input → show inline form error
- `RateLimitError` (429) — 100 req / 15 min per IP → show "too many requests" toast

---

## Known Gotchas & Edge Cases

1. **`isInitializing` vs `isLoading`**: Always check `isInitializing` first (SDK is reading from localStorage). Only check `isAuthenticated` after `isInitializing` is false.

2. **`userId` in votes patch**: Patching another user's document is blocked by RLS. Always use server-side API route for vote toggling.

3. **Owner field immutability**: Once a document is inserted, `userId` cannot be changed via `patch`/`update`. Don't include it in update bodies.

4. **Soft delete**: `db.delete()` is a soft delete (30-day grace). Deleted features won't appear in normal `getAll()` calls. This is the correct behaviour for our app.

5. **Refs not auto-populated**: `featureId` in `comments` is stored as a plain string ID. We must fetch the feature and comments separately, not via a join.

6. **Schema strictly typed**: `votes` is an `Array` type — send `[]` not `null` on insert. `tags` is also `Array`. Never send wrong types or you get a 400.

7. **`users` collection is blocked**: Never call `db.getAll('users')` or `db.getOne('users', id)`. Always use `useUser()` hook for the current user's data.

8. **Social auth redirect**: After Google/GitHub login, urBackend redirects to `<siteUrl>/auth/callback`. We do NOT need to build this page — the React SDK handles the exchange automatically via `socialExchange()` under the hood when the user lands back.

9. **`getToken()` availability**: The React SDK manages tokens internally. If `useAuth()` doesn't expose `getToken()`, use a workaround: store the token in React state after a manual login, or check the underlying client instance.

10. **`limit` cap**: `db.getAll()` max is 100 documents per page. For larger datasets, implement pagination with `page` param.

---

## Build Order / Checklist

- [ ] `npx create-next-app` scaffold + `npm install @urbackend/react @urbackend/sdk`
- [ ] `.env.local` with `NEXT_PUBLIC_URBACKEND_API_KEY` and `URBACKEND_SECRET_KEY`
- [ ] `Providers.js` — UrProvider wrapper
- [ ] `layout.js` — root layout with Providers + Inter font + metadata
- [ ] `globals.css` — full design system (variables, resets, typography, utility classes)
- [ ] `LoadingSkeleton.js` — skeleton cards for loading state
- [ ] `StatusBadge.js` — color-coded badge
- [ ] `TagBadge.js` — tag chip
- [ ] `VoteButton.js` — voted/unvoted states, calls `/api/vote`
- [ ] `FeatureCard.js` — full card with all sub-components
- [ ] `FilterBar.js` — status filter tabs
- [ ] `SortBar.js` — most voted / newest toggle
- [ ] `CommentBox.js` — list + input
- [ ] `Navbar.js` — logo, links, UrUserButton (inline)
- [ ] `api/vote/route.js` — server-side vote toggle
- [ ] `api/admin/update-status/route.js` — server-side status update
- [ ] `api/admin/delete-feature/route.js` — server-side delete
- [ ] `/` board page — fetch, filter, sort, empty state
- [ ] `/login` page — GuestRoute + UrAuth with branding
- [ ] `/submit` page — ProtectedRoute + form
- [ ] `/feature/[id]` page — detail, comments, vote, edit/delete
- [ ] `/admin` page — role check, table, stats panel
- [ ] `.env.local.example`
- [ ] `README.md` — full dashboard setup steps
- [ ] Final: responsive check, empty states, loading skeletons, error boundaries
