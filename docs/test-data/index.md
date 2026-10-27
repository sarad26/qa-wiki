# Test data

::: danger Non-production only
This page holds **test** data. Never add real customer data or production credentials. Keep the repository **private**.
:::

::: warning Where to test
- Test all payment methods **only in LLE (lower) environments**.
- Do **not** place orders in Prod using test carts.
- The Order Review page is not accessible in Prod for test flows (validation), except for **ACIMA**.
:::

## Environments {#environments}

| Env | URL | Username | Password |
| --- | --- | --- | --- |
| Staging | https://staging.ashleyfurniture.com | `storefront` | `afweb2017` |
| Development | https://development.ashleyfurniture.com | — | — |
| Production | https://ashleyfurniture.com | — | — |

## Payments flow (E2E steps) {#payments-flow}

1. Open the URL.
2. Update the ZIP code to `33606`.
3. Search for an item in the search box (or use the menu).
4. On the **PLP** (for example, Sofa), select any item.
5. On the **PDP**, add the available item to the cart.
6. Click **Continue to Checkout**.
7. Fill in the delivery information: `100 Main St, Tampa, FL, 33606`.
8. On the **Billing** page, observe the modal message.
9. Choose a payment method and enter valid payment details.
10. Continue to the **Order Review** page.
11. Place the order.

## Credit card {#credit-card}

**Addresses**

| Street address | City | State | ZIP |
| --- | --- | --- | --- |
| 100 Main Street | Tampa | FL | 33606 |
| 2500 Cleveland Ave N | Saint Paul | MN | 55113 |
| 522 W 29th Street, Apt 1B | New York | NY | 10001 |
| 100 Main St | Bluefield | WV | 24701 |

**Cards**

| Brand | Card number | CVV | Expiry |
| --- | --- | --- | --- |
| Visa | `4000000000000002` | `383` | 12/26 |
| MasterCard | `5121212121212124` | `383` | 12/26 |
| Discover | `6011000000000004` | `383` | 12/26 |
| American Express | `370000000000002` | `383` | 12/26 |

## Synchrony {#synchrony}

::: tip
The available amount on these accounts is limited, but it is refilled every 24 hours.
:::

| # | Shipping / Billing address | Account number | CVV |
| --- | --- | --- | --- |
| 1 | 950 FORRER BLVD, Dayton, OH, 45420 | `6019193000801125` | `605` |
| 2 | FIN CERT, 100 Main St, Tampa, FL, 33606 | `6019193604909852` | `068` |
| 3 | FIN CERT, 1901 S TAGGART ST, BOISE, ID, 837053448 | `6019193000001221` | `382` |


## Concora {#concora}

Billing address: `FIN CERT, 100 Main St, Tampa, FL, 33606`

::: tip
If the first account does not work, try the next one. The available amount per account is limited.
:::

| Name | Code | Account number | ZIP |
| --- | --- | --- | --- |
| FIN CERT | 3800 | `7634006077284152` | 60639 |
| FIN CERT | 3800 | `7634006077284046` | 87153 |
| FIN CERT | 9660 | `7634006075934550` | 92539 |

*Column labels are inferred from the source. Please confirm "Code".*

**Accounts by plan (ZIP 33606)**

| Plan | Account numbers |
| --- | --- |
| 6 months | `7634006074590890`, `7634006077290753`, `7634006075956223`, `7634006077305825` |
| 12 months | `7634006077290662`, `7634006074590833` |


## PayPal, PayPal Express and Pay Later {#paypal}

Billing address: `FIN CERT, 100 Main St, Tampa, FL, 33606`

| Username | Password |
| --- | --- |
| BSA_Buyer2@ashleyfurniture.com | `BSABuyer2!` |
| BSA_Buyer3@ashleyfurniture.com | `BSABuyer3!` |
| BSA_Buyer4@ashleyfurniture.com | `BSABuyer4!` |
| BSA_Buyer5@ashleyfurniture.com | `BSABuyer5!` |
| BSA_Buyer6@ashleyfurniture.com | `BSABuyer6!` |
| BizCert2@ashleyfurniture.com | `BizCert2!` |
| QA_Buyer23@ashleyfurniture.com | `QABuyer23!` |

## ACIMA {#acima}

Billing address: `FIN CERT, 100 Main St, Tampa, FL, 33606`

1. Click **Sign Lease**.
2. Last 4 of SSN/ITIN: `0000`. Verification code: `000 000`.
3. Generate a random 9-digit SSN (not sequential) and note it down. Example used: `240320263`.
4. Enter any first name and last name, and the full SSN generated above.
5. Enter any email address and a Tampa address (for example, `100 Main St, Tampa, FL`).
6. Select **Driving License** and enter a random 8-digit license number and a DOB (for example, `06/06/1984`).
7. Bank information: routing number `042000398`, account number: any random 8-digit number.
8. Income details:
   - Income: `10,000`
   - Employment type: Full-Time
   - Payment method: Direct Deposit
   - Payday: any day of the month (for example, the 5th)
9. In the Security Question section, select the answer that includes an asterisk (`*`).
10. Once the lease is approved, continue to Checkout.
11. Sign the contract using the same name provided earlier.
12. Pay with the test card:
    - Card number: `4000 0000 0000 0002`
    - Expiry: any future date (for example, `12/12/2027`)
    - CVV: any 3 digits (for example, `383`)

## Mixed mode items {#mixed-mode}

::: details Show all SKUs (click to expand)
```text
APGB267KPDNC APGB267KSDNC APG-B1050B20-5P APG-B1050B25-5P
APG-B1050B38-5P APK-B1050KPS APG-B211QBS8 APG-B211QB25
APG-B211KB1D APK-B192-KP2 APK-B192-QPS APG-B192-5QPB
APG-B192FSD APG-B255Q5 APG-B255KPCN APG-APK-B211-KB1
APG-B255-QPB6 APG-B255-TPB5 APG-B267-QP7 APG-B440-QPD
APK-B446-FSB APG-B427B8-8P APG-B427B6-8P APG-D631-454
APG-D594-354 APG-D594-355 APG-D59432-6P APG-D59432-7P
APG-D596-9P APG-D546-358 APG-D546-356 APG-D631-455
APG-D631-325 APG-D631-324 APG-D63435-9P APG-D64245-6P
APG-D631S325 APG-D64245-7P APG-D64245-9P APG-D64232-6P
APG-D64232-8P APG-D647-256 APG-D647-255 APG-D794D7-7P
APG-D736-256 APG-D743-45C APG-D743-356 APG-D743-458
APG-D743-35D APG-D743-45D APG-D743-454 APG-D743-456
APG-D743-45A APG-D76935-9P APG-D947D5-7P APG-D97435-7P
APG-D984-P9 APG-D61225-9P APG-D82125-P5 APG-D486D4-9P
APG-D922D4-7P APG-D752-6P APG-D752-7P APG-D63435-6P
APG-D794D8-5P APG-D922D5-5P APG-D694D7-9P APG-D922D4-9P
APG-D82235-10P APG-D82125-5P APG-D984-456 APG-D82125-P7
APG-D61225-6P APG-D62735-9P APG-D922D5-9P APG-D76935-P9
APG-D794D8-7P APG-D769D7-11P APG-D486D3-7P APG-D824D11-7P
APG-D736-5P APG-D794D7-5P APG-D984-5P APG-D922D5-7P
APG-D743-35C APG-D97435-9P APG-D984-P10 APG-D752-5P
APG-D63435-7P APG-D97435-6P APG-D736-254 APG-D769D4-5P
APG-D689D1-5P APG-D596-6P APG-D546-354 APG-D647-557P
APG-D743D15-9P APG-D82125-7P APG-D84145-P7 APG-D84145-9P
APG-D61225-7P APG-D947D5-5P APG-D82235-6P APG-D69435-8P
APG-D743D16-8P APG-D589-356 APG-D766-P8 APG-D794D7-9PC
APG-D76935-7P
```
:::