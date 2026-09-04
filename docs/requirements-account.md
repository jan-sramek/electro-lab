# Account — requirements (Phase C design, G4)

Gate: [roadmap.md](roadmap.md) **G4** must exit before build (**G5**). Related: [ADR-003](adr/003-auth-deferred.md), [ADR-004](adr/004-progress-storage.md), [requirements-learn-assessment.md](requirements-learn-assessment.md), [risks-and-deferrals.md](risks-and-deferrals.md).

## Goal

Learners can **optionally** sign in so progress survives devices and browsers. Anonymous Learn stays fully usable. Teachers get stable unit URLs plus (later) shareable progress views — not a full LMS.

## In scope (G5 build after G4 exit)

| Capability | Notes |
|------------|--------|
| Sign-in / sign-out | Provider chosen in ADR (see below); email magic-link or one OAuth is enough for v1 |
| Profile shell | `/account` — display name optional, locale preference later |
| Cloud progress | Read/write same unit phases as today (read → quiz → lab) under the user id |
| Session merge | On first sign-in, offer to **link** existing `X-Learn-Session` progress into the account (one-time, explicit) |
| Teacher-friendly links | Stable `/learn/{module}/{unit}` (already); optional “copy progress link” is later |

## Out of scope (explicit)

- XP, streaks, leaderboards, certificates
- Classrooms, rosters, gradebooks
- Forced login to open Lab or Learn
- Server-side circuit simulation / anti-cheat beyond attestation
- Minors-specific compliance productization (flag privacy decisions in G4 ADR notes)

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
| GET/POST | `/api/auth/*` | Provider-specific (not finalized) |
| GET | `/api/learning/me` | Profile + linked session info |
| POST | `/api/learning/progress/link-session` | Merge `X-Learn-Session` → user |
| Existing | `/api/learning/progress…` | Accept either session header **or** user auth |

Exact auth middleware belongs in the auth ADR update.

## Privacy / data (G4 decisions required)

Document before build:

- What PII we store (email, provider subject, display name)
- Retention / delete account
- Whether under-16 learners are in scope for v1
- Analytics vs progress telemetry (keep separate)

## Acceptance (G4 exit — design)

- [ ] This FR doc reviewed
- [ ] ADR-003 superseded or amended with chosen auth direction
- [ ] ADR-004 superseded or amended for session + user progress
- [ ] Privacy notes filled (even if “defer minors”)
- [ ] Explicit non-goals list unchanged unless product decides otherwise

## Acceptance (G5 exit — build)

- [ ] Anonymous path unchanged
- [ ] Sign-in → progress syncs across browsers
- [ ] Session link flow works once without wiping quiz/lab flags incorrectly
- [ ] i18n for Account strings in `en-fallback` + `TranslationSeeder`
- [ ] Tests for merge and auth-gated progress
