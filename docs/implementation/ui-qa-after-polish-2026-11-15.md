# PODOLOGY — UI/UX second pass and honest verification ledger
Date: 2026-11-15. Scope: branch `implementation/comments-2026-11-15` in CRM and website. Neither repository's `main` nor deployed production was modified by this pass.

## Product decisions
- Preserve the existing cream/sage/green identity and restrained serif accents on the public site.
- Use Manrope for the consistent CRM and client-account body font. Important actions are unmistakable, secondary actions remain calm. At minimum 44 px target height for common controls and visible keyboard focus.
- Client cabinet remains a complete separate Next.js application at CRM `/client`, linked by a **full-page navigation** from static public website, not an iframe. A same-origin public website cabinet is not technically implemented; it would require a routing/deployment change.
- The temporary **login-free experience** is an **open guest preview**. It MUST NOT be mistaken for authenticated access. Signed-out CRM users see a navigable, explicitly synthetic read-only preview. Signed-out clients see real public catalog content and clear protected-data placeholders, not records or mutation forms. Verified clients keep access to their real appointments, clinical records, visible photographs, recommendations, order history and profile. Verified-but-not-registered clients can still complete the original registration flow.
- CRM and portal API authentication, authorization, identity binding, writes, finance calculations and patient data access policies remain in place. The ID-based login feature is deferred to a separate approved implementation, not silently emulated here.

## Website: section-by-section status
| Surface | Source/code review | Actual deployed public audit | Follow-up |
|---|---|---|---|
| Header and navigation | Updated: calmer hover state, accessible mobile-menu state | Menu and CTA visible | Branch visual screenshot & keyboard test still needed |
| Hero / main CTA | Existing visual preserved; goes to contact when catalog API unavailable | Looks aligned and readable | Confirm intended booking flow once API works |
| Values ribbon / directions | Existing palette maintained | Content visible | Mobile zoom and motion test not run |
| Services | Added local read-only fallback from `services.json`; real booking only when API returns services | **FAIL**: public live catalog had zero services | Fix deployed CRM/API/data; do not ship stale prices as live |
| Founder / team | No invented images introduced | **PARTIAL**: founder and team image placeholders | Obtain approved authentic photos |
| Certificates | Original certified source scans kept | **PARTIAL**: KANE certificate carries past expiry date | Confirm wording/validity before republishing |
| Interior | Original section retained | **PARTIAL**: interior placeholder | Obtain approved genuine interior photography |
| Home care / products | Read-only fallback from `products.json`; order CTA only for confirmed in-stock live item | **FAIL**: live catalog unavailable | Fix deployed CRM/API/data and stock visibility |
| Testimonials / approach / FAQ | Source content and structural flow retained | Content visible in baseline audit | Screen reader & mobile keyboard tests needed |
| Contacts/footer | Original contact links retained | Address, phone, Telegram and hours visible | Test links across target devices |
| Full customer cabinet navigation | Source changed: no site-created iframe; preserves service/product intent in query | Existing live nav link loads CRM `/client` | New branch E2E deep link still not run |

Live browser baseline reference: https://agent.tinyfish.ai/runs/223633b3-3f7e-4fa0-922f-4eed2e63c085
**Important**: these were observations of the **currently published older deployment**, not screenshots of new working-branch changes. Error origin (API deployment, storage, CORS, seed state, connectivity) is **not confirmed**.

## CRM: section-by-section status
| Surface | Changes | Verified evidence / boundary |
|---|---|---|
| Main navigation / dashboard | Existing hierarchy retained; improved 7–10 px legacy dashboard labels, team strip, AI tiles, setup banners | Source-level only |
| Finance | Period labels, date popover, six totals, formula disclosures, warning disclosure, readable table | Server finance formulas unchanged; runtime end-to-end NOT RUN |
| Schedule | Compact event/time coordinate rules deliberately untouched | Exact slot overlap, drag-and-drop and zoom NOT RUN |
| Clients / clinical cards | Existing data flows retained and protected | Real account access and images NOT RUN |
| Warehouse / purchases | Existing business operations untouched | Stock movement and receipts NOT RUN |
| Staff / plans / payroll | Label readability updated; all calculations unmodified | Business scenario regression NOT RUN |
| AI assistant / communication | Readable composer, notices, prompt buttons, helper text | Real AI providers & messaging NOT RUN |
| Login-free preview | Added `app/demo-workspace.tsx` and `app/demo-workspace.css`: in-memory fictitious rows for six navigable read-only sections | Authenticated backend not bypassed; browser render NOT RUN |

## Client cabinet: section-by-section status
- **Overview**: preserves appointment summary, quick access, services, home-care recommendations. Guest information banner added.
- **Services**: preserves searchable catalogue and real booking form *for authenticated/linked clients*. Guest operations are not submitted.
- **Visits**: existing upcoming/history, rescheduling/cancellation, calendar export retained.
- **Care record**: existing published visit-card data, recommendations and client-visible clinical photos retained.
- **Products/orders**: existing checkout and order status history retained; protected operations stay protected.
- **Profile/settings**: name, birth date, contact channels, marketing consent, phone change with confirmation, sign-out and account deletion remain in authenticated session.
- **Registration**: standalone post-verification form retained; a prominent prompt is shown when `pending`. On successful registration the existing handler returns to overview.
- New responsive 320–1440 px CSS polish, focus outlines, reduced-motion handling, consistent action sizing and guest privacy state; **screenshots have not been taken of new branch**.

## Evidence / limitations
- Source successfully committed and read back from both branches.
- Public website JS syntax was parsed by JavaScript compiler after main site edits (not browser execution).
- Site and CRM CSS structural brace checks can be done without runtime; CSS parser and visual rendering are not equivalent to passing tests.
- New CRM TypeScript typecheck, authenticated end-to-end tests, browser screenshots of this branch, performance timings, full 195+ business scenarios and production deployment are **NOT RUN**. Prior test logs from earlier commits must not be attributed to these changes.

## Pre-merge release blockers and acceptance
1. Execute `tsc --noEmit`, current CRM test suite, production build and site syntax checks against exact commit SHAs.
2. Launch website and CRM branch in isolated preview with synthetic/approved test data and QA roles; do not use live patient data for screenshots.
3. Verify desktop widths 1440/1280, tablets 1024/768, phones 430/390/375/320, 200% zoom, keyboard-only and reduced-motion.
4. Verify mobile drawer close (tap outside, Escape, link click), visible full CTA text, no horizontal clipping, readable prices and long Russian labels, date-picker overlay and click-outside.
5. Verify authenticated and non-authenticated client routes, genuine registration, protected records, photos, history, orders, personal settings, privacy boundaries and deep-linked service/product intent.
6. Verify full finance/business operations with the existing scenario-ledger, roles, amount signs, warnings, refunds, stock movements and calendar collisions.
7. Restore working public CRM catalog API and source data. Read-only saved catalog is **not** a substitute for online scheduling/ordering; it is labeled as reference only.
8. Attach actual before/after screenshots and accessibility checks before claiming pixel-level acceptance or release readiness.

## Final fallback and navigation hardening
- Website `dist/app.js`: full-page `/client` navigation for booking/product intent, never a page-created iframe. API failure or empty catalog switches to `services.json`/`products.json` with visible reference-only disclosure; offline rows link to real centre contacts, **not** an unauthenticated booking/order submission. Live product ordering is only offered when `confirmed && available > 0`.
- CRM client `app/client/page.tsx`: guest overview/services/products can fall back to same-origin `/services.json`/`/products.json` if the CRM catalog endpoint fails. The page explicitly warns that these may be stale and renders contact actions for unsigned guests. Live authenticated booking remains available from actual backend data, not disabled by unrelated product catalog failure.
- CRM demo navigation: X/backdrop/Escape close; offscreen mobile sidebar is hidden from interaction while closed.
- Never interpret a successful static source check as full TypeScript build or browser QA. Backend data/API and authenticated workflows remain the release blockers documented above.
