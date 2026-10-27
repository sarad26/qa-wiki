# Synchrony UniFi – QA Validation Reference

Compiled 23 Oct 2026 for ticket validation. Sources: the 5 wiki PDFs (First Draft, Second Draft, Implementation Flow, Security Review, Drawer vs Modal), plus the 16 Oct 2026 Synchrony demo call.

## 0. Source documents and which one wins {#sources}

| Doc | Author / Date | Use for |
|---|---|---|
| Unify First Draft (MS-990 spike) | Sudharshan T., 16 Sep 2026 | Current Ashley Advantage flow, analytics/instrumentation gaps |
| Drawer vs Modal | Sudharshan T., 17 Sep 2026 | UI pattern rules |
| Security Review | Sudharshan T., 24 Sep 2026 | Security test cases (12 risks) |
| Unify Second Draft v2.0 | Sudharshan T. / Supriya C.D., 24 Sep 2026 | Architecture, endpoints, site prefs, error scenarios, rollout |
| Implementation Flow | Sudharshan T., 28 Sep 2026 | **Latest** real build sequence (wins if it conflicts with the Second Draft) |
| 16 Oct demo call | — | Confirmed behaviour in DEV |

::: warning Conflicts to keep in mind
1. **SDK global:** the First Draft says `window.SyfUniFi`. The Second Draft corrects this to **`window.syfMPP`** (`calldBuyProcess`, `processInd: 3`).
2. **Feature flag name:** the Second Draft uses both `featureUniFiEnabled` (design principles) and **`unifi_enabled`** (site prefs). Confirm the real name in BM.
3. **Authorize sequence:** the Second Draft says status → createOrder → `/authorize` (Transact). The Implementation Flow says status approved → `unifiTransactionId` saved → submit-payment → Place Order stamps `c_unifiTransactionId` on the payment instrument → **if that attribute is present, run `runUnifiAuthorize`; otherwise run the native `runSynchronyAuthorize`**. The demo confirmed Transact runs only at Place Order.
4. The First Draft says older docs (`docs/Synchrony-UniFi-Integration-Architecture.md`) target SiteGenesis and are **stale**. Don't validate against SFRA/ISML/controllers.
:::

## 1. Architecture (SF Next) {#architecture}

- React Router v7 SSR, talking to SFCC through **Custom SCAPI** only. No SFRA controllers, ISML or Svelte.
- New SCAPI endpoint `rest-apis/ashley-unifi/script.js` in `int_ashleys_synchrony`:
  - `POST /custom/ashley-unifi/v1/organizations/{orgId}/token?siteId=` → Digital POS token
  - `POST .../status` body `{transactionToken}` → Transaction Lookup
  - `POST .../authorize` body `{orderNo, transactionToken}` → Transact
- Helpers: `UniFiTokenHelper.js`, `UniFiTransactionHelper.js`. Reused: `SynchronyOAuthHelper.js`, `OrderPlacementHelper.js`, `AshleyPaymentAuthorizeHelper.js`.
- Frontend: `action.unifi-token.tsx`, `action.unifi-status.tsx`, `action.unifi-authorize.tsx`, `UniFiCombinedModal.tsx` (React.lazy, mounted only after "Ashley Advantage" is selected), `useUniFiModalClose.ts`, `UniFiAdvertisingWidget.tsx` (PDP/Cart/Checkout), `lib/payment/unifi/unifi-client.ts`.
- Implementation Flow components: `AshleyAdvantagePayment` → `payment.tsx` (setPhase `unifi` / `entry`) → `UniFiCombinedModal` → `unifi-client.server` → `submit-payment.server` → `action.place-order`.
- Existing `ashley-synchrony` endpoint (v3 / eQuickScreen) stays and runs **in parallel**. UniFi does not replace it.
- **Not affected (smoke test only):** APG credit card, D365 export (order format unchanged), Kount, PayPal, Acima, `FinanceCardHelper` BIN routing, `FinanceDetailsHelper`.

## 2. Synchrony API endpoints and service timeouts {#apis}

| Service ID | URL (stg) | Timeout |
|---|---|---|
| ashleys.synchrony.http.unifi.token | `<redacted URL>` | 10 s |
| ashleys.synchrony.http.unifi.lookup | `<redacted URL>` | 10 s |
| ashleys.synchrony.http.unifi.transact | `<redacted URL>` | 15 s |

Prod base URL: `https://api.syf.com`. All timeouts must fit inside the SCAPI script-execution budget. `authorize` = one call, no chained retries.

UniFi.js source: non-prod `https://spdpone.syfpos.com/mpp/UniFi.js`, prod `https://pdpone.syfpayments.com/mpp/UniFi.js`. Loaded async/defer with `<script id="syfMPPScript">`.

## 3. End-to-end flow (expected results) {#e2e-flow}

1. Shopper selects Ashley Advantage → modal is lazily mounted.
2. `action.unifi-token` → OAuth → Digital POS **transactionToken (30-min TTL, minted fresh each time, never cached)**.
3. `syfMPP.calldBuyProcess(form, {processInd: 3, transactionToken})` → Synchrony Combined Modal (apply / lookup / promo / terms).
4. Window postMessage **"Unifi Modal Close"** → `action.unifi-status` (poll budget **30 s**, `unifi_timeoutSeconds`).
5. **statusCode "033" = Customer Approval Success is the ONLY code that allows authorize.** Response: `{statusCode, approved: statusCode==='033'}`.
6. Approved → `setUnifiTransactionId`, terms cleared, phase back to `entry` → UI shows approved state + "Continue to Review Order" (no separate review page).
7. **No hold on the card yet.**
8. Place Order → submit-payment with `unifiTransactionId` → `c_unifiTransactionId` stamped on the payment instrument → createOrder → `runUnifiAuthorize` (Transact) → hold placed → final lookup → order confirmation.
9. `saveCard=YES` → `cipher.storedPaymentToken` returned (valid up to 365 days).
10. Transaction lookup returns the **account number only, no CVV**.

## 4. Error scenarios (Second Draft §6.2) {#errors}

| # | Scenario | Expected |
|---|---|---|
| 1 | UniFi.js fails to load / `window.syfMPP` undefined | Fall back to the v3 flow (`unifi_fallbackToLegacy = true`) |
| 2 | Token fetch fails (OAuth / DPOS) | `paymentUnavailable()` / `paymentActionError()` → inline error, retry or fallback (503 `service_unavailable`) |
| 3 | Modal closed without approval (non-033) | `approved:false`, modal unmounts, back to payment selection (demo: toast "Something went wrong…", placeholder copy) |
| 4 | Transact declines / invalid token | `failOrderRestoreBasket(orderNo)` → order CREATED→FAILED, basket restored, error shown. No orphan orders |
| 5 | Transact OK but downstream placement fails | Existing Synchrony void job (`SynchronyVoid.js`) voids the auth |
| — | Missing body fields | 400 `invalid_parameter` (`transactionToken` / `orderNo` required) |

## 5. Site preferences / config {#site-prefs}

| Pref | Default | Check |
|---|---|---|
| unifi_enabled | false | Master flag, **checked server-side in SCAPI**, not just the client |
| unifi_merchantId (syfPartnerId) | — | Partner ID sent to the modal (MID 702 / 1627; 1627 is planned for UniFi) |
| unifi_apiBaseUrl | stg / prod | Per environment |
| unifi_sdkNonProdUrl / unifi_sdkProdUrl | — | Correct host per environment |
| unifi_timeoutSeconds | 30 | Lookup poll budget |
| unifi_fallbackToLegacy | true | v3 fallback |
| financeCardTypes | existing | Unchanged; does NOT gate UniFi |

- UniFi has its **own OAuth client credentials** (Digital POS scope), kept as a service credential, never a site pref. The v3 api key is NOT reused.
- Flow choice order: `unifi` → `synchronySplitPay` → `synchronyV3`.
- CSP: `defaultSecurityHeaders` is currently **disabled**, so CSP isn't enforced today. When it's re-enabled, add `spdpone.syfpos.com`, `pdpone.syfpayments.com` (script-src, frame-src) and `api-stg.syf.com`, `api.syf.com` (connect-src).

## 6. Security test cases (Security Review + Second Draft §4.4) {#security}

| # | Risk (severity) | QA check |
|---|---|---|
| 1 | postMessage spoofing (Critical) | The Second Draft hook code has **NO origin check** (comment says it MUST be added). Post "Unifi Modal Close" from another origin/console → it must be ignored. Allow-list Synchrony origins |
| 2 | Server verification optional (Critical) | Order state changes ONLY after a server Transaction Lookup returns 033. Faking client success must not place an authorized order |
| 3 | Modal same-DOM, not sandboxed (Critical) | Find out whether the modal is an 'Iframe' or in the same DOM (PCI SAQ question) |
| 4 | Third-party JS supply chain (High) | Check SRI/CSP on UniFi.js |
| 5 | Tokens in visible DOM inputs (High) | Inspect DOM: `transactionToken` / `tokenId` should not sit in rendered inputs |
| 6 | No payload signature (Med-High) | Note only |
| 7 | storedPaymentToken 365 days (Medium) | It must not appear in client responses or logs unnecessarily |
| 8 | No idempotency on Transact (Medium) | Double-click / replay Place Order → exactly one auth and one order (see SSF-839, SSF-282 I1) |
| 9 | OAuth credential storage (Medium) | Not in client config or logs |
| 10 | Logging PII (Medium) | Check server and browser console logs for tokens / PII |
| 11 | CSRF / session binding (Medium) | Token / Transact calls rejected without a valid shopper session (action returns `paymentUnavailable` when there's no access token) |
| 12 | Verbose errors (Low-Med) | Client errors are generic; details stay server-side |

## 7. Analytics / instrumentation (First Draft MS-990) {#analytics}

- Stack: GTM (`src/lib/gtm/events/checkout.ts`) + WERT, routed via `use-analytics.ts` → EventMediator.
- Existing but **not wired** for Synchrony: `financing_application`, `payment_failure`, `checkout_error` (errorType `financing_declined`).
- Proposed new events: `financing_account_lookup`, `financing_application_submitted`, `financing_approved`, `financing_modal_abandoned`.
- `add_payment_info` `payment_type` must tell ASHLEY_FINANCE legacy apart from UniFi.
- Inside the modal, steps are invisible (opaque iframe). Only open / close / complete is trackable.

## 8. Current (legacy / v3) flow, for regression with UniFi OFF {#legacy-regression}

- Normal: account number → finance terms (account lookup + APG term list) → disclosure → ASHLEY_FINANCE instrument → authorize at Place Order (BIN dispatch: Synchrony v3 or APG Genesis BIN).
- Split pay: down payment calculated → CC form → two instruments (ASHLEY_FINANCE financed + ASHLEY_PAYMENT down payment) → Synchrony auth first, CC second → **if CC fails, void the Synchrony auth**. Split pay + UniFi is a later phase (High risk).

## 9. UI pattern rules (Drawer vs Modal) {#ui-rules}

- Drawer is the default for secondary content, filters, cart, quick-view and **financing term selection**.
- Modal only for: destructive confirmations, critical errors needing acknowledgement (payment failure), legal/consent gates, session expiry.
- The UniFi Combined Modal is Synchrony-hosted (outside Ashley's control). For Ashley's own modals, check `role="dialog"`, `aria-modal="true"`, the focus trap, background inert, and Esc to dismiss.

## 10. Rollout / monitoring thresholds {#rollout}

- Staged rollout 10% → 50% → 100% (Optimizely). Instant rollback = `unifi_enabled=false` → eQuickScreen/v3.
- Tolerances: error rate under 1%, modal load under 3 s.
- Alerts: modal load failures over 5%/hr, auth failures over 10%/hr, session timeouts over 3%/hr, any rise in SDK errors, average modal load over 5 s.

## 11. Jira references {#jira}

AGRINIT-92 (initiative), MS-990 (spike), MS-633 (Modal integration / SCAPI), MS-634 (Transaction processing), MS-639 (UI/UX), MS-640 (Testing & QA), MS-641 (Experimentation), MS-642 (Docs), MS-643 (Deployment / config). Related: MS-1001 (Figma), SSF-438 (Learn More / plan details), SSF-282 (order review), MS-1147 (prequal links), SSF-61 (v3 baseline), SSF-839 (double place order).

## 12. Open items from the 16 Oct demo {#open-items}

- Acima shows above Ashley Advantage (contract violation, must fix).
- Approval copy "UniFi payment was approved" needs to change (no "UniFi", no "payment approved").
- Other payment radios still enabled after approval.
- Pre-qual button focus and full-page loader; no click feedback inside the modal.
- Learn More link (compliance, separate story).
- Order import auth-validation endpoint (PG): only 1 of 3 stories is in the sprint. Capture fails if it's skipped.
- Allow-list staging and prod URLs for EMPQ.
- For production credentials: screenshots for both MIDs + UniFi API logs, with one transactionToken across the whole flow. Synchrony freeze 4 Nov – 4 Jan.