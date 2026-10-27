---
title: Synchrony UniFi – QA Validation Reference
outline: [2, 3]
---

# Synchrony UniFi – QA Validation Reference

Compiled for ticket validation. Sources: 5 wiki PDFs (First Draft, Second Draft, Implementation Flow, Security Review, Drawer vs Modal) and the 16 Oct 2026 Synchrony demo call.

## 1. QA alignment with Sudharshan Thirunarayanan

::: tip Confirmed with the developer
The developer side did **not** change any **Business Manager (BM)** settings or the **order XML**.
:::

### QA scope

1. Only the UI change and the payment functionality.
2. Check the normal D365 flow for every payment type.
3. Regression with the UniFi toggle ON and OFF.
4. Place orders with the toggle ON and OFF.

### Action items – QA team waiting for

- [ ] Current UI Figma design
- [ ] List of scenarios from the developer or the documentation
- [ ] Test data for placing orders (including the eQuickScreen regression data still owed by Synchrony)

## 2. Source documents and which one wins

| Doc | Author / Date | Use for |
|---|---|---|
| Unify First Draft (MS-990 spike) | Sudharshan T., 16 Sep 2026 | Current Ashley Advantage flow, analytics gaps |
| Drawer vs Modal | Sudharshan T., 17 Sep 2026 | UI pattern rules |
| Security Review | Sudharshan T., 24 Sep 2026 | Security test cases (12 risks) |
| Unify Second Draft v2.0 | Sudharshan T. / Supriya C.D., 24 Sep 2026 | Architecture, endpoints, site prefs, errors, rollout |
| **Implementation Flow** | Sudharshan T., 28 Sep 2026 | **Latest** build sequence (wins on conflict) |
| 16 Oct demo call | — | Behaviour confirmed in DEV |

::: warning Conflicts to keep in mind
- **SDK global:** First Draft says `window.SyfUniFi`. Second Draft corrects it to `window.syfMPP` (`calldBuyProcess`, `processInd: 3`).
- **Feature flag name:** Second Draft uses both `featureUniFiEnabled` and `unifi_enabled`. Confirm the real name in BM.
- **Authorize sequence:** Implementation Flow wins. Place Order stamps `c_unifiTransactionId` on the payment instrument. If present, `runUnifiAuthorize` runs; otherwise `runSynchronyAuthorize`. The demo confirmed Transact runs only at Place Order.
- The older `Synchrony-UniFi-Integration-Architecture.md` targets SiteGenesis and is **stale**. Do not validate SF Next tickets against it.
:::

## 3. Architecture (SF Next)

- React Router v7 SSR, talking to SFCC through **Custom SCAPI** only. No SFRA controllers, ISML or Svelte.
- New SCAPI endpoint `rest-apis/ashley-unifi/script.js` in `int_ashleys_synchrony`:
  - `POST /custom/ashley-unifi/v1/organizations/ORG_ID/token?siteId=` – Digital POS token
  - `POST .../status` with body `transactionToken` – Transaction Lookup
  - `POST .../authorize` with body `orderNo`, `transactionToken` – Transact
- New helpers: `UniFiTokenHelper.js`, `UniFiTransactionHelper.js`. Reused: `SynchronyOAuthHelper.js`, `OrderPlacementHelper.js`, `AshleyPaymentAuthorizeHelper.js`.
- Frontend files: `action.unifi-token.tsx`, `action.unifi-status.tsx`, `action.unifi-authorize.tsx`, `UniFiCombinedModal.tsx` (lazy-loaded only after Ashley Advantage is selected), `useUniFiModalClose.ts`, `UniFiAdvertisingWidget.tsx`, `lib/payment/unifi/unifi-client.ts`.
- The existing `ashley-synchrony` endpoint (v3 / eQuickScreen) stays and runs **in parallel**.
- **Not affected (smoke test only):** APG credit card, D365 export (order format unchanged), Kount, PayPal, Acima, `FinanceCardHelper` BIN routing, `FinanceDetailsHelper`.

## 4. Synchrony API endpoints and timeouts

| Service ID | URL (staging) | Timeout |
|---|---|---|
| `ashleys.synchrony.http.unifi.token` | `<redacted URL>` | 10 s |
| `ashleys.synchrony.http.unifi.lookup` | `<redacted URL>` | 10 s |
| `ashleys.synchrony.http.unifi.transact` | `<redacted URL>` | 15 s |

- Production base URL: `https://api.syf.com`
- UniFi.js non-prod: `<redacted URL>`
- UniFi.js prod: `<redacted URL>`
- Script is loaded async with id `syfMPPScript`. Authorize is one call with no chained retries.

## 5. End-to-end flow (expected results)

1. Shopper selects Ashley Advantage – modal is lazily mounted.
2. `action.unifi-token` – OAuth – Digital POS **transactionToken** (30-minute TTL, minted fresh each time, never cached).
3. `syfMPP.calldBuyProcess` with `processInd: 3` opens the Synchrony Combined Modal (apply / lookup / promo / terms).
4. Window message **"Unifi Modal Close"** triggers `action.unifi-status` (poll budget 30 s, `unifi_timeoutSeconds`).
5. **Status code `033` (Customer Approval Success) is the ONLY code that allows authorize.**
6. Approved – `unifiTransactionId` saved, approved message and **"Continue to Review Order"** button (no separate review page).
7. **No hold on the card yet.**
8. Place Order – `c_unifiTransactionId` stamped – createOrder – `runUnifiAuthorize` (Transact) – hold placed – final lookup – order confirmation.
9. `saveCard=YES` returns `cipher.storedPaymentToken` (valid up to 365 days).
10. Transaction lookup returns the **account number only, no CVV**.

## 6. Toggle ON / OFF test matrix

| Area | Toggle ON (UniFi) | Toggle OFF (legacy v3 / eQuickScreen) |
|---|---|---|
| Payment UI | UniFi Combined Modal opens from Ashley Advantage | Account number + finance terms + disclosure |
| Approval | Status `033` – approved state – Continue to Review Order | Account lookup + term selection |
| Authorization | `runUnifiAuthorize` at Place Order | `runSynchronyAuthorize` at Place Order |
| Order XML | No structure change – verify | Baseline – verify unchanged |
| BM Payments tab | UniFi fields present (transaction token, card number) | Existing fields |
| D365 | Normal import – verify | Normal import – verify |
| Void / reversal | Void and reverse on both MIDs | Existing void job |
| Other tenders | CC, PayPal, Acima regression | CC, PayPal, Acima regression |
| Split pay | Later phase – out of scope | Synchrony auth first, CC second; CC fail voids Synchrony auth |

## 7. Error scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | UniFi.js fails to load / `window.syfMPP` undefined | Fall back to v3 flow (`unifi_fallbackToLegacy = true`) |
| 2 | Token fetch fails | Inline error, retry or fallback (503 `service_unavailable`) |
| 3 | Modal closed without approval (not `033`) | Back to payment selection, toast "Something went wrong…" (placeholder copy) |
| 4 | Transact declines / invalid token | `failOrderRestoreBasket` – order FAILED, basket restored, no orphan orders |
| 5 | Transact OK but placement fails | Existing void job `SynchronyVoid.js` voids the auth |
| 6 | Missing body fields | 400 `invalid_parameter` |

## 8. Site preferences / config

| Preference | Default | What to check |
|---|---|---|
| `unifi_enabled` | false | Master flag, checked server-side in SCAPI |
| `unifi_merchantId` | — | Partner ID (MID 702 / 1627; 1627 planned for UniFi) |
| `unifi_apiBaseUrl` | stg / prod | Correct per environment |
| `unifi_sdkNonProdUrl` / `unifi_sdkProdUrl` | — | Correct host per environment |
| `unifi_timeoutSeconds` | 30 | Lookup poll budget |
| `unifi_fallbackToLegacy` | true | v3 fallback |
| `financeCardTypes` | existing | Unchanged, does not gate UniFi |

- UniFi has its own OAuth client credentials (Digital POS scope), stored as a service credential.
- Flow choice order: `unifi` – `synchronySplitPay` – `synchronyV3`.
- Security headers (`defaultSecurityHeaders`) are currently **disabled**. When re-enabled, add `spdpone.syfpos.com`, `pdpone.syfpayments.com`, `api-stg.syf.com` and `api.syf.com`.

## 9. Security test cases

::: danger Test first
The `useUniFiModalClose` code in the Second Draft has **no origin check** on the modal-close message. A fake "Unifi Modal Close" message from another origin must be ignored.
:::

| # | Risk | Severity | QA check |
|---|---|---|---|
| 1 | Modal-close message spoofing | Critical | Post the message from console / other origin – must be ignored |
| 2 | Server verification optional | Critical | Order changes only after server lookup returns `033` |
| 3 | Modal in same DOM, not sandboxed | Critical | Confirm iframe vs same DOM (PCI question) |
| 4 | Third-party JS supply chain | High | Check SRI / security headers on UniFi.js |
| 5 | Tokens in visible page inputs | High | Inspect DOM – no `transactionToken` in rendered inputs |
| 6 | No payload signature | Medium-High | Note only |
| 7 | `storedPaymentToken` valid 365 days | Medium | Not exposed in client responses or logs |
| 8 | No idempotency on Transact | Medium | Double-click Place Order – exactly one auth and one order |
| 9 | OAuth credential storage | Medium | Not in client config or logs |
| 10 | Logging PII | Medium | Check server and browser logs |
| 11 | CSRF / session binding | Medium | Calls rejected without a valid shopper session |
| 12 | Verbose errors | Low-Medium | Client errors are generic |

## 10. Analytics

- Stack: GTM (`src/lib/gtm/events/checkout.ts`) + WERT via `use-analytics.ts`.
- Existing but not wired for Synchrony: `financing_application`, `payment_failure`, `checkout_error`.
- Proposed new events: `financing_account_lookup`, `financing_application_submitted`, `financing_approved`, `financing_modal_abandoned`.
- Steps inside the modal cannot be tracked – only open, close and complete.

## 11. UI pattern rules (Drawer vs Modal)

- **Drawer** is the default for secondary content, filters, cart, quick view and financing term selection.
- **Modal** only for destructive confirmations, critical errors (payment failure), legal / consent gates and session expiry.
- For Ashley's own modals check `role="dialog"`, `aria-modal="true"`, focus trap, inert background and Esc to dismiss.

## 12. Rollout and monitoring

- Staged rollout 10% – 50% – 100%. Instant rollback: set `unifi_enabled` to false.
- Targets: error rate under 1%, modal load under 3 seconds.

| Metric | Alert threshold |
|---|---|
| Modal load failures | more than 5% per hour |
| Authorization failures | more than 10% per hour |
| Session timeout errors | more than 3% per hour |
| SDK script errors | any increase |
| Average modal load time | more than 5 seconds |

## 13. Jira references

Epics: AGRINIT-92, MS-990, MS-633, MS-634, MS-639, MS-640, MS-641, MS-642, MS-643.

| Ticket | Use for validation |
|---|---|
| [MS-1001](https://ashley-furniture-team.atlassian.net/browse/MS-1001) | UniFi Figma design |
| [SSF-438](https://ashley-furniture-team.atlassian.net/browse/SSF-438) | Learn More links and financing plan details |
| [SSF-282](https://ashley-furniture-team.atlassian.net/browse/SSF-282) | Review – Place Order, financing method text, double-submit |
| [MS-1147](https://ashley-furniture-team.atlassian.net/browse/MS-1147) | Pre-qual / Apply Now links, MID |
| [SSF-61](https://ashley-furniture-team.atlassian.net/browse/SSF-61) | v3 / eQuickScreen baseline (toggle OFF) |
| [SSF-839](https://ashley-furniture-team.atlassian.net/browse/SSF-839) | Retry / double-click – Kount orders missing in BM |
| [SSF-790](https://ashley-furniture-team.atlassian.net/browse/SSF-790) | Learn More link on Synchrony Financing page (legal) |

## 14. Open items from the 16 Oct demo

- [ ] Acima shows above Ashley Advantage (contract violation, fix before go-live)
- [ ] Approval copy "UniFi payment was approved" must change
- [ ] Other payment options still clickable after UniFi approval
- [ ] "See if you pre-qualify" focus state and full-page loader; no click feedback inside modal
- [ ] "Learn More" link missing (compliance, separate story – SSF-790 / SSF-438)
- [ ] Order import auth-validation in PG – only 1 of 3 stories in sprint; capture fails if skipped
- [ ] Allow-list staging and prod URLs for EMPQ (only dev added)
- [ ] Production credentials: screenshots for both MIDs and UniFi API logs with one transactionToken end to end

::: info Test data
Pre-qual amount 10,000 · Synchrony test scripts on MID 702 · after `033`, verify no card hold until Place Order · Synchrony code freeze 4 Nov – 4 Jan.
:::
