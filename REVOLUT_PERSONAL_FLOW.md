# Revolut payments — personal account flow

Honest summary of how Revolut payments work on dekanti.hr today and what
each piece does.

## The constraint

Revolut Merchant API (the one with auto-validating webhooks, hosted
checkout, and amount-prefilled links) requires a Revolut **Business**
account, which requires a registered business. We only have a personal
Revolut account, so:

- `revolut.me/{handle}` links **cannot** prefill amount or reference
- There is **no webhook** when a payment lands in a personal account
- Verification is **manual** — you check incoming transfers in your
  Revolut app and confirm them in the admin panel

## What the customer sees

1. Picks Revolut at checkout, confirms the order
2. Modal opens with three copy buttons:
   - **Iznos** — the exact amount in EUR
   - **Opis uplate** — the order number (e.g. `HR-2026-123456`)
   - **Primatelj** — `revolut.me/{your-handle}`
3. One big "Otvori Revolut" button opens your `revolut.me` profile in a
   new tab. They type the amount, paste the reference, complete the
   payment in the Revolut app.
4. They click "Platio sam — pošalji narudžbu". The order is created in
   the database with `status = cekanje_uplate` and `placeno = false`.
5. Confirmation page tells them the payment is being verified. The page
   polls `placeno` every 8 seconds; when you mark it paid, they get a
   live toast without refreshing.

## What you do as merchant

1. **Set your handle** in `.env`:

   ```env
   VITE_REVOLUT_USERNAME=yourhandle
   ```

   To find your real handle, open your Revolut app → Profile → "Revolut
   tag" / `@` username. Visit `https://revolut.me/{that-handle}` — if it
   shows your profile, that's the right value. If it bounces to the
   generic "send-and-receive" page, the handle is wrong.

2. **Watch the admin queue.** New Revolut orders appear in the orders
   list with the purple "Čeka uplatu" badge. The dashboard KPI card
   "Čekaju uplatu" gives you a count.

3. **Reconcile in your Revolut app.** When an incoming payment lands,
   match it by amount + reference (the order number is in the
   description the customer typed).

4. **Mark as paid in admin.** Open the order, click "Označi kao
   plaćeno". This:
   - Flips `placeno = true`, sets `datum_placanja = now()`
   - Moves status from `cekanje_uplate` to `nova` (so it enters the
     normal fulfilment queue)
   - Sends the customer a "uplata potvrđena" email
   - The customer's confirmation page detects the change via polling
     and shows a success toast

## Failure modes and how they're handled

| Customer says they paid but didn't | Order stays `cekanje_uplate` until you confirm. You never ship without a real incoming Revolut payment. |
| Customer paid wrong amount | Match in admin manually; either ask for top-up or refund the difference in your Revolut app. |
| Customer forgot the reference | Filter unpaid orders by amount + customer email; reconcile manually. |
| Customer abandons mid-payment | No order is created until they click "Platio sam". They can also click "Odustani" in the modal. |

## Schema

```sql
narudzba_status enum: cekanje_uplate, nova, u_obradi, poslano, isporuceno, otkazano, povrat
orders.placeno          boolean default false
orders.datum_placanja   timestamptz
orders.payment_reference text  -- mirrors order_number, kept for future-proofing
```

Index `orders_unpaid_idx` covers fast lookup of unpaid orders.

## Future upgrade path (when you incorporate)

If you eventually get an obrt or d.o.o. and apply for Revolut Business:

1. Switch to the Revolut Merchant API (`POST /orders` → returns
   `checkout_url` with amount baked in)
2. Add a webhook endpoint at
   `/functions/v1/revolut-webhook` that listens for `ORDER_COMPLETED`
   and flips the order automatically
3. Drop `cekanje_uplate` status (Revolut becomes self-validating)

The existing schema (`placeno`, `datum_placanja`, `payment_reference`)
already supports this — you'd only swap the frontend modal for a
redirect to `checkout_url`.
