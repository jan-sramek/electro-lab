# Account — requirements (Phase C design, G4)

Gate: [roadmap.md](roadmap.md) **G4** must exit before build (**G5**). Related: [ADR-003](adr/003-auth-deferred.md), [ADR-004](adr/004-progress-storage.md), [requirements-learn-assessment.md](requirements-learn-assessment.md), [risks-and-deferrals.md](risks-and-deferrals.md).

## Goal

Learners can **optionally** sign in so progress survives devices and browsers. Anonymous Learn stays fully usable. Teachers get stable unit URLs plus (later) shareable progress views — not a full LMS.

## In scope (G5 build after G4 exit)

| Capability | Notes |
|------------|--------|
| Sign-in / sign-out | **Email magic link** (ADR-003); optional display name on profile |
| Profile shell | `/account` — email, sign-out, link-session CTA |
| Cloud progress | Read/write same unit phases as today (read → quiz → lab) under the user id |
| Session merge | On first sign-in, offer to **link** existing `X-Learn-Session` progress into the account (one-time, explicit) |
| Teacher-friendly links | Stable `/learn/{module}/{unit}` (already); optional “copy progress link” is later |

## Out of scope (explicit)

- XP, streaks, leaderboards, certificates
- Classrooms, rosters, gradebooks
- Forced login to open Lab or Learn
- Server-side circuit simulation / anti-cheat beyond attestation
- Minors-specific compliance productization for G5 (see privacy)

## Progress model

Today (Phase B): anonymous session UUID in `localStorage` → LearningApi progress rows.

Target (Phase C):

1. Keep session progress for anonymous users.
2. Authenticated users store progress keyed by `userId` (same unit phases).
3. Merge path: if session has progress and account is empty/newer, copy session → user after consent.
4. Lab challenge verify continues client SPECS check + API attestation; API still records `labPassed`.

## API sketch (design only)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/magic-link/request` | Send magic link to email |
| GET | `/api/auth/magic-link/consume` | Exchange token → set HTTP-only session cookie |
| POST | `/api/auth/sign-out` | Clear session |
| GET | `/api/learning/me` | Profile + linked session info |
| POST | `/api/learning/progress/link-session` | Merge `X-Learn-Session` → user |
| Existing | `/api/learning/progress…` | Accept either session header **or** user cookie |

## Privacy / data (G4)

| Topic | Decision |
|-------|----------|
| PII stored | Email, auth subject id, optional display name, progress rows, timestamps |
| Retention | Keep while account exists; **delete account** removes auth + progress |
| Under-16 | **Out of scope for G5** — product is general adult/hobbyist; revisit before school pilots |
| Analytics vs progress | Progress is product data; analytics stay separate/stub until a privacy review |

## Acceptance (G4 exit — design)

- [x] This FR doc reviewed (design draft)
- [x] ADR-003 amended with magic-link + cookie session
- [x] ADR-004 amended for session + user progress
- [x] Privacy notes filled (defer minors)
- [x] Explicit non-goals list unchanged

**G4 exit for build:** product owner confirms magic-link direction; then G5 may start.

## Acceptance (G5 exit — build)

- [ ] Anonymous path unchanged
- [ ] Sign-in → progress syncs across browsers
- [ ] Session link flow works once without wiping quiz/lab flags incorrectly
- [ ] i18n for Account strings in `en-fallback` + `TranslationSeeder`
- [ ] Tests for merge and auth-gated progress
