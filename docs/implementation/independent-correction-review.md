# Independent correction review — 2026-11-15

Status: IMPLEMENTATION INCOMPLETE / AUDIT INCOMPLETE.

The authoritative comments contain **110 distinct requirement IDs**, not 115. All 110 remain in the ledgers. No missing five requirements were invented. Source is included as source-comments-2026-11-15.txt.

## Finding about Antigravity

The claim that all corrections were implemented and verified is not supported. The site accepted an arbitrary OTP in local storage, recorded bookings/orders locally even after server rejection, used incompatible booking fields, and handled cancellation/rescheduling without authoritative persistence. Navigation changes did not implement the underlying business processes. Its two ledgers contradicted each other; many requirements were TODO and all implementation commit lists were empty.

This correction is intentionally kept on implementation/comments-2026-11-15. Main was read, never written, and no deployment/merge was performed.

## Corrections implemented in this revision

- Website local OTP/profile/booking/order/cancellation implementations removed. Buttons open the actual CRM customer application in a website dialog, preserving the opaque service/product ID and customer session. A real separate-window link is available. No local success or local business records. Live catalog errors are explicit; stale local catalog is not passed off as current availability.
- Customer ordering supports multiple distinct products and pickup only; server enforces pickup, real prices, stock and ownership. Calendar export uses a persisted active visit, Moscow time, actual duration, stable UID, escaping and UTF-8 line folding.
- Both staff and client booking paths reject overlapping active visits for the same patient across different specialists, inside the existing state transaction. Existing staff/room checks remain.
- Admin and specialist assistants have no mutation catalog and cannot execute mutation batches, including direct plan preparation/confirmation. Owner/manager action execution remains subject to domain authorization.
- Admins can send own requests to managers. Managers opening the request mark it read without approving it. Private threaded replies, targeted notifications, separate resolution and conflict checks added. Submission does not alter schedules. Approval of general schedule changes still requires a separate manager schedule edit; see limitations.
- Specialist zoom removed; date picker closes on outside pointer; admin patient results require a search of at least three characters. Calendar filters and completed-visit drilldown added; admin daily money tile opens permitted shift reports. Owner team screen shows outcomes rather than schedule controls.
- Visit history unified; planned visits remain available alongside actual results. Procedure and result are the minimum for a filled card; photos remain optional. Completed unfinished own cards remain fillable later. Completing a visit creates a specialist notification with a direct card link. Card completion and publication remain separate.
- Partial procurement receipt adds only actual accepted quantity and cost, preserves remaining quantity and exposes another receipt action. Duplicate document for the same purchase is rejected even with a fresh version. Existing optimistic versions and transaction rollback retained.
- Shift report requires an explicit equipment condition and damage description when relevant; stores it in the shift report and emits targeted manager notice. It does not create a payment.

## Verification

- `node tests/run.mjs`: **212 passed, 0 failed**, none skipped. This includes existing tests plus new regression assertions. Unit/API-route tests use their existing controlled test harness; they are not represented as browser E2E or load tests.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm build`: PASS (Vinext reports its existing static route-classification limitation).
- Real built Cloudflare Worker with isolated local D1, public application routes and fresh synthetic data: CRM/portal overlapping requests were launched concurrently with independent staff/customer identities; one 200 and one 409, exactly one persisted booking. Actual partial receipt and duplicate document rejection verified against a re-read of application state. These are two identities, not a claimed 16-agent or 300-user campaign.
- `tests/comments-runtime.cjs` and `scripts/verify-comments-local.sh` reproduce local API checks using a fresh temporary database. Identity headers are supplied only to the local worker to simulate its upstream authenticated identities; no production authentication was bypassed.
- Browser E2E: **BLOCKED**. Playwright installed; bundled browser missing; system Chromium tried with normal launch and a second launch configuration. Both system launches abort at process_singleton_posix.cc: socket() failed: Operation not permitted. No browser action, screenshot or visual acceptance is claimed.
- Actual SMS delivery, real messaging channels, hosted iframe authentication/cookie behavior and production deployment: **NOT EXECUTED**. Local SMS configuration reports unavailable. No fake OTP replacement or live bank transaction.

## Remaining scope — do not call this complete

1. Production/preview browser acceptance for all 110 requirements, mobile layouts, actual authentication, popup/iframe restrictions and third-party cookie policies. The new embedded client UI is provisional until this acceptance; its separate-window fallback does not prove WEB-12 complete.
2. Real photos/certificate content and source provenance. Existing assets preserved remotely, no invented medical/room imagery or certificate evidence added.
3. Connected customer messaging transport, reliable delivery receipts, pause/resume of AI on manual answer, durable 15-minute first-unanswered-message deadline, cancellation/retry/recovery. Existing communications explicitly reports connected:false; there is no working scheduler for this process.
4. Complete return-client automation after two months, consent/future-booking exclusions, approved cadence/discount parameters, outcome attribution.
5. Monthly procurement on the 20th and complete material consumption from actual completed/paid procedures, including late cards/refunds/corrections and sufficient configured target quantities. Partial procurement receipt itself is corrected and tested, not this entire automation.
6. Admin requests for shift swaps/replacements and general schedule-change approvals are not yet an atomic schedule workflow. Specific specialist day-off approval is implemented; generic request resolution must not be mistaken for applying a detailed schedule.
7. Full financial control examples, notifications delivery, all role/object combinations, previous chaos audit and performance waves have not been rerun. Passing 212 automated tests is not execution coverage of 110 requirements or 195 chaos scenarios.

## Commands

From the CRM repository, install using its committed pnpm configuration, then:

```sh
node tests/run.mjs
pnpm exec tsc --noEmit
pnpm build
bash scripts/verify-comments-local.sh
```

Keep the generated evidence directory printed by the last command. Do not run the local identity-header runner against production. The script permits only localhost.

## Ledger interpretation

Previous Antigravity claims are retained as historical fields, not current PASS. Requirements touched by this change are PARTIAL until all their acceptance conditions have real end-to-end evidence. Untested requirements are NOT RUN. New automated regression checks are recorded separately. No 100% completion or pass-rate claim is made.

Execution evidence and regression runners are in the CRM repository, same implementation branch, evidence/corrections-2026-11-15/.
