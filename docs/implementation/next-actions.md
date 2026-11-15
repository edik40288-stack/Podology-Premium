# Next actions

1. Publish only an isolated test preview from both implementation branches; main is not merged.
2. Configure test-only SMS/model/gateway with signed receipt and durable idempotency contract, R2 and cron. Set explicit manager-approved policy/stock values. Add actual current interior/product/portrait media where absent.
3. Start full browser acceptance WEB-06, WEB-07, WEB-12 (authentication/profile/hosted iframe) across the real test domains.
4. Continue requirements-ledger.json (110 source IDs, all full acceptance NOT RUN), keep per-ID actual evidence. Run current automated checks from CRM root: `node tests/run.mjs`, `pnpm exec tsc --noEmit`, `pnpm build`.
5. Only after functional checks run prior chaos ledger/16 independent sessions/load waves in isolated environment. No unit suite is their replacement.

Supporting execution logs are in CRM evidence/continuation-2026-11-15. Earlier live-api logs refer to the earlier commit, not the new automation implementation.
