# PODOLOGY — visual system pass

Date: 2026-11-15. Branch: `implementation/comments-2026-11-15` in both repositories. No merge or production deployment.

## Intent

Keep the centre's existing green/sage/cream palette, illustration, content, routes and customer cabinet. Improve readability and visual priority instead of replacing screens or business workflows.

## CRM

- Dedicated `app/visual-system.css`, loaded after the legacy global stylesheet. Shared tokens for readable text, surfaces, borders, focus, spacing and motion. Existing CSS is preserved; this final presentation layer can be reviewed or reverted separately.
- Manrope/system typography: page titles 26–34 px, section titles 18–19 px, controls 13–14 px, table text 13 px, supporting text generally 12 px. Precise calendar compact labels remain specially sized so time-derived event geometry is unchanged.
- Consistent 18–28 px panel insets, 44 px primary/secondary controls, stronger primary actions, proper secondary borders, visible focus and active navigation. Tables and panel tabs no longer start flush against card edges.
- Tabs use a common pill/segment treatment. Ordinary text actions use one consistent underline; headings and amounts do not acquire arbitrary underlines. Numeric values use tabular figures, table amounts align right, negative amounts retain their sign and get a secondary color cue.
- Forms, private client messages, requests, modals, empty states, account cabinet and sign-in typography follow the same hierarchy. No sections of the client cabinet were removed.
- Motion is limited to named color/border/shadow/transform properties. Reduced-motion settings disable it. Mobile layouts reduce insets while retaining useful control sizes. Precise schedule coordinates/dragging behavior are not changed.

## Finance presentation

New read-only `FinanceOverview` uses the existing `details.formulas`, receipts, expenses and payouts. It does not calculate a new financial model or create any operation.

Visible six figures: incoming payments, refunds, net receipts, operating expenses, actual specialist payouts and management cash result. Native disclosure controls reveal the exact server formula and source operation buttons. The result is explicitly distinguished from accounting profit or bank balance. Empty data is not presented as a zero. The MoneyViews period guard prevents an old response from appearing below newly selected dates. Empty payment/expense tables state whether there are no operations or data has not loaded.

## Website

- Existing palette, serif display accents, layout and customer flows retained. Body/secondary copy, catalog text, prices and headings have a clearer type hierarchy and stronger contrast.
- More consistent rounded cards/buttons, quieter borders/shadows, balanced section spacing, stronger booking/order actions and consistent text links.
- Targeted SVG directional icons replace the affected arrow spans/buttons, avoiding missing-font boxes seen in the public website capture.
- Gentler 200–320 ms interactions, slow existing decorative motion, touch behavior and reduced-motion rules. No opacity-based entrance hiding that could make content inaccessible when JS fails.

## Evidence and limits

- Current public website and CRM sign-in screen were inspected using the cloud browser. The deployed public site is an older version: it still contains the old top strip and is not the implementation branch. Those captures are baseline observations, not proof of this new stylesheet.
- CRM internal screens require ChatGPT authentication. The sign-in form was reached; no credentials were available, no permissions or authentication bypass was added. A screenshot-based audit of finance or other internal screens is NOT EXECUTED.
- 246 existing controlled tests pass, none fail or skip. TypeScript, CRM production build and static website JavaScript syntax pass. Both new CSS files were parsed with PostCSS. A controlled React server-render check verified missing data, signed values, disclosure structure and escaping of source operation titles. These are code checks, not browser E2E or visual layout acceptance.
- New desktop/tablet/mobile screenshots, 200% zoom, long Russian labels, overflowing finance amounts, keyboard disclosure/focus behavior, calendar compact events, customer cabinet and motion on the actual deployment remain to be inspected after the branch is launched in an isolated environment. Do not label those checks PASS based on compilation.

## Review locations

CRM: `app/visual-system.css`, `app/finance-overview.tsx`, `app/business-views.tsx`, `app/layout.tsx`.
Website: `dist/visual-system.css`, `dist/index.html`, `dist/app.js`.
Supporting check logs: CRM `evidence/visual-polish-2026-11-15/`.

## Follow-up polish in the same working branch (2026-11-15)

Scope: a targeted second pass on top of the visual system above. No changes to the accounting formulas, CRM API contract, authentication, booking state machine or customer-cabinet sections. `main` and production remain untouched.

### Site follow-up
- Restored the correct column width for catalogue booking buttons: the prior service grid still reserved a 40–44 px icon-only column, although the rendered action now says “Записаться” and includes an SVG arrow. The new responsive grid reserves a full button width and uses a two-row service layout on narrow screens.
- Replaced inconsistent header link underline animation with soft pill-style hover feedback without changing link destinations or main palette.
- Mobile menu gets a subtle open animation; its toggle state now synchronizes on link click, outside click and Escape. Service-category buttons have `aria-pressed`, and “show all” reports `aria-expanded`.

### CRM follow-up
- Finance date filters now have visible “Период отчёта / С / По” labels and a properly positioned date-picker overlay, including mobile sizing. The underlying date-filter state and query flow are unchanged.
- Six original formula values and operation IDs remain server-sourced. Management result gets a clear secondary emphasis; source-operation dates use human-readable labels and the source count is visible.
- Existing server-generated finance warnings appear in a collapsed, accessible disclosure with a count, so document/ledger issues are easier to find without crowding the summary.
- Active finance tabs expose `aria-pressed`, financial tables retain a usable minimum width and horizontal scrolling on narrow viewports.

### Verification for this follow-up
- GitHub branch source and committed blob SHAs were read back. Website JavaScript parsed successfully as JavaScript without execution.
- Both presentation CSS files passed a brace-balance/static structure check. Financial presentation classes, date-control wrappers, tab states and warning disclosure were confirmed in the committed source.
- `lib/finance.ts` retained its original blob SHA `db781084a6e22f06d3c3d80015526ca6f727e9ed`.
- **Not executed**: fresh CRM TypeScript build, regression suite, real-browser screenshots of the updated working branches, logged-in finance page visual review, keyboard interaction end-to-end, mobile browser matrix and full customer journey regression. The earlier build/test evidence in this document is not evidence of passing these new commits.
- Before merge, test 320/375/768/1440 px layouts plus 200% zoom. Verify: service CTA full text, mobile-menu Escape and link close, financial date popovers, empty reports, signed and very long amounts, warning disclosure, user registration and intact client cabinet. Run CRM test/typecheck/build and site browser E2E in an isolated preview.
