# MemeGen Africa — Project TODO & Architecture Roadmap

> Proposed by: Architectural Review  
> Date: June 2026  
> Status: Pending implementation

---

## Context

The current codebase works but has three God files that will bottleneck growth:
- `server.ts` (~1,500 lines) — routes + DB + all payment/AI logic in one file
- `src/App.tsx` (~1,000 lines) — all state + all action handlers
- `src/components/WorkspaceHub.tsx` (~2,000 lines) — every UI tab/panel in one component

The roadmap below refactors these into a clean layered architecture without changing any existing API contracts or UI behavior.

---

## Target Structure

```
MemeGen-Africa/
│
├── server/
│   ├── index.ts                     ← Express app bootstrap & Vite dev middleware
│   ├── config.ts                    ← Env vars validated at startup
│   ├── db/
│   │   ├── client.ts                ← SQLite connection singleton
│   │   ├── schema.ts                ← Table CREATE statements
│   │   ├── seed.ts                  ← Default users, plans, seed data
│   │   └── migrations/              ← Numbered schema migration files
│   ├── routes/
│   │   ├── index.ts                 ← Mounts all routers
│   │   ├── auth.routes.ts           ← POST /api/users/register, /login
│   │   ├── db.routes.ts             ← GET /api/db/state, POST /api/db/query
│   │   ├── payment.routes.ts        ← /api/pay/* endpoints + callbacks
│   │   ├── gemini.routes.ts         ← /api/gemini/* endpoints
│   │   └── creations.routes.ts      ← GET/POST /api/creations
│   ├── services/
│   │   ├── gemini.service.ts        ← All GoogleGenAI logic
│   │   ├── mpesa.service.ts         ← Daraja STK Push logic
│   │   ├── stripe.service.ts        ← Stripe session creation
│   │   ├── paypal.service.ts        ← PayPal order create & capture
│   │   └── credits.service.ts       ← completeTransaction, debitCredits
│   ├── middleware/
│   │   ├── logger.ts                ← addLog + in-memory log store
│   │   └── errorHandler.ts          ← Centralized Express error handler
│   └── types.ts                     ← Server-only types
│
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts                     ← Shared domain types (canonical source)
│   ├── App.tsx                      ← Thin root: router + auth gate + AppShell only
│   ├── api/                         ← All fetch calls, typed, one file per domain
│   │   ├── auth.api.ts
│   │   ├── db.api.ts
│   │   ├── gemini.api.ts
│   │   ├── payment.api.ts
│   │   └── creations.api.ts
│   ├── store/                       ← Centralized state
│   │   ├── AppContext.tsx           ← Provider wrapping the app
│   │   ├── useAppStore.ts           ← Hook exposing all state slices
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── memeSlice.ts
│   │       ├── imageSlice.ts
│   │       ├── videoSlice.ts
│   │       ├── captionSlice.ts
│   │       ├── billingSlice.ts
│   │       └── coachSlice.ts
│   ├── hooks/                       ← Action logic extracted from App.tsx
│   │   ├── useAuth.ts               ← register, login, signOut
│   │   ├── useMeme.ts               ← template select, save, download, rating
│   │   ├── useImage.ts              ← generateImage, editImage
│   │   ├── useVideo.ts              ← generateVideo, pollVideoStatus
│   │   ├── useCaption.ts            ← generateCaption
│   │   ├── useBilling.ts            ← initiatePayment, checkStatus, debitCredits
│   │   └── useCoach.ts              ← getCoachInsight
│   ├── data/
│   │   ├── templates.ts             ← MEME_TEMPLATES (moved from src/templates.ts)
│   │   └── uiPresets.ts             ← TEXT_PRESETS, QUICK_COLORS, etc. (moved from UiPresets.ts)
│   ├── components/
│   │   ├── ui/                      ← Pure reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         ← Top nav + sidebar + toast + main slot
│   │   │   ├── Sidebar.tsx          ← Navigation links
│   │   │   └── TopBar.tsx           ← Search, user badge, refresh, currency toggle
│   │   └── workspace/               ← One component per feature panel
│   │       ├── Dashboard.tsx        ← Central hub card grid
│   │       ├── MemeEditor.tsx       ← Template picker + overlays + satire generator
│   │       ├── ImageStudio.tsx      ← Imagen generate/edit panel
│   │       ├── VideoMaker.tsx       ← Veo 3 generate + polling progress
│   │       ├── SocialCopywriter.tsx ← Caption generator
│   │       ├── AudienceAdvisor.tsx  ← Strategic coach panel
│   │       ├── MyAlbum.tsx          ← Saved creations gallery
│   │       ├── Billing.tsx          ← Plan cards + payment gateway
│   │       └── SystemConsole.tsx    ← Logs + SQL explorer (admin only)
│   └── pages/                       ← Route-level components (lazy loaded)
│       ├── AppPage.tsx              ← Authenticated workspace shell
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
```

---

## Migration Phases

Phases are ordered by risk and value. Each is independently shippable.

---

### Phase 1 — Split the Backend [x]

> **Priority: HIGH** — Payment bugs here cost real money. Tackle first.

- [x] Create `server/db/client.ts` — SQLite connection singleton
- [x] Create `server/db/schema.ts` — extract all `CREATE TABLE` statements
- [x] Create `server/db/seed.ts` — extract user/plan seed logic
- [x] Create `server/middleware/logger.ts` — extract `addLog`, in-memory log array
- [x] Create `server/middleware/errorHandler.ts` — centralized Express error handler
- [x] Create `server/services/credits.service.ts` — extract `completeTransactionSecured`, debit logic
- [x] Create `server/services/mpesa.service.ts` — extract `triggerMpesaStkPush`, `sanitizeMpesaPhone`
- [x] Create `server/services/stripe.service.ts` — extract `getStripe`, session creation
- [x] Create `server/services/paypal.service.ts` — extract `getPaypalAccessToken`, `createPaypalOrder`
- [x] Create `server/services/gemini.service.ts` — extract all `GoogleGenAI` call logic
- [x] Create `server/routes/auth.routes.ts` — `/api/users/register`, `/api/users/login`
- [x] Create `server/routes/db.routes.ts` — `/api/db/state`, `/api/db/query`, `/api/db/logs`
- [x] Create `server/routes/payment.routes.ts` — all `/api/pay/*` routes
- [x] Create `server/routes/gemini.routes.ts` — all `/api/gemini/*` routes
- [x] Create `server/routes/creations.routes.ts` — `/api/creations`
- [x] Create `server/routes/index.ts` — mount all routers
- [x] Create `server/config.ts` — validate and export env vars at startup
- [x] Create `server/index.ts` — thin Express bootstrap (replaces `server.ts`)
- [x] Delete `server.ts` — removed

---

### Phase 2 — Extract the Frontend API Layer [x]

> **Priority: HIGH** — Unblocks all other frontend phases. Low risk.

- [x] Create `src/api/auth.api.ts`
- [x] Create `src/api/gemini.api.ts`
- [x] Create `src/api/payment.api.ts`
- [x] Create `src/api/creations.api.ts`
- [x] Create `src/api/db.api.ts`

---

### Phase 3 — Break Up WorkspaceHub into Workspace Components [x]

> **Priority: HIGH** — Biggest dev velocity gain. Enables parallel feature work.

- [x] Create `src/components/layout/Sidebar.tsx`
- [x] Create `src/components/layout/TopBar.tsx`
- [x] Create `src/components/layout/AppShell.tsx`
- [x] Create `src/components/workspace/Dashboard.tsx`
- [x] Create `src/components/workspace/MemeEditor.tsx`
- [x] Create `src/components/workspace/ImageStudio.tsx`
- [x] Create `src/components/workspace/VideoMaker.tsx`
- [x] Create `src/components/workspace/SocialCopywriter.tsx`
- [x] Create `src/components/workspace/AudienceAdvisor.tsx`
- [x] Create `src/components/workspace/MyAlbum.tsx`
- [x] Create `src/components/workspace/Billing.tsx`
- [x] Create `src/components/workspace/SystemConsole.tsx`
- [x] Delete `src/components/WorkspaceHub.tsx` — removed

---

### Phase 4 — Introduce State Store + Custom Hooks [x]

> **Priority: MEDIUM** — Eliminates prop drilling. Makes state predictable and testable.

- [x] Create `src/store/slices/authSlice.ts`
- [x] Create `src/store/slices/memeSlice.ts`
- [x] Create `src/store/slices/imageSlice.ts`
- [x] Create `src/store/slices/videoSlice.ts`
- [x] Create `src/store/slices/captionSlice.ts`
- [x] Create `src/store/slices/billingSlice.ts`
- [x] Create `src/store/slices/coachSlice.ts`
- [x] Create `src/store/AppContext.tsx`
- [x] Create `src/hooks/useAuth.ts`
- [x] Create `src/hooks/useMeme.ts`
- [x] Create `src/hooks/useImage.ts`
- [x] Create `src/hooks/useVideo.ts`
- [x] Create `src/hooks/useCaption.ts`
- [x] Create `src/hooks/useBilling.ts`
- [x] Create `src/hooks/useCoach.ts`
- [x] Create `src/hooks/useToast.ts`
- [x] Refactor `App.tsx` to use store + hooks only (thin root, ~80 lines)

---

### Phase 5 — Add Lazy Loading [x]

> **Priority: MEDIUM** — Performance win. Easy once Phase 3 is done.

- [x] Create `src/pages/LoginPage.tsx`
- [x] Create `src/pages/RegisterPage.tsx`
- [x] Wrap page imports in `React.lazy()` + `<Suspense>` in `App.tsx`

---

### Phase 6 — Extract UI Primitive Components [x]

> **Priority: LOW** — Polish and consistency. Do last.

- [x] Create `src/components/ui/Button.tsx`
- [x] Create `src/components/ui/Input.tsx`
- [x] Create `src/components/ui/Toast.tsx`
- [x] Create `src/components/ui/Badge.tsx`
- [x] Create `src/components/ui/Spinner.tsx`

---

### Phase 7 — Data Cleanup [x]

> **Priority: LOW** — Housekeeping.

- [x] Move `src/templates.ts` → `src/data/templates.ts`
- [x] Move `src/components/UiPresets.ts` → `src/data/uiPresets.ts`
- [x] Remove legacy `src/templates.ts` and `src/components/UiPresets.ts` — removed

---

## Architectural Principles to Maintain

- **No API contracts change** — all `/api/*` routes stay identical during refactor
- **No UI behavior change** — each phase is a structural move, not a feature change
- **Server types extend shared types** — `src/types.ts` is the canonical domain type source; server imports from it
- **SQLite stays** — no DB swap needed at current scale
- **Graceful degradation stays** — all Gemini/payment sandbox fallbacks must be preserved

---

## Notes

- Stripe, M-Pesa, PayPal integrations already degrade gracefully when keys are absent — preserve this in services
- Admin console (SystemConsole) must remain gated to `gachihijoel234@gmail.com` only
- Credit debit/credit logic (`credits.service.ts`) is used by multiple payment routes — do not duplicate it
