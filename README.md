# Pomodoro Pro

A focus-timer SaaS. Free tier gets the timer. Paid tiers unlock streamed AI focus tips and (planned) shared team sessions.

Stack: Next.js 14 App Router, Supabase (auth + Postgres + RLS), Stripe Checkout + webhooks, Vercel AI SDK with OpenAI streaming. Deploys to Vercel.

The repo is intentionally compact so the plumbing stays readable. Every piece a real SaaS needs (auth, billing, RLS, tier gating, streaming AI, webhook hygiene) is in here.

## Live demo

https://01-saas-starter.vercel.app

Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Stack

- Next.js 14.2 (App Router, Server Components, Route Handlers)
- TypeScript 5.6, strict, no `any`
- Tailwind CSS 3.4 + class-variance-authority + tailwind-merge
- `@supabase/ssr` 0.5 for auth (email magic link), Postgres, RLS
- Stripe 17 for Checkout, webhook signature verification, Customer Portal
- Vercel AI SDK 3.4 (`ai` + `@ai-sdk/openai`) for streamed completions
- Vercel as the deploy target

## Features

- Magic-link auth via Supabase, with cookie-refreshing middleware so server components see a fresh session.
- Three tiers: Free, Pro ($19/mo), Team ($49/mo) sold via Stripe Checkout.
- Stripe webhook handler verifies signatures, deduplicates by event ID, and upserts into a `subscriptions` table using the service role key.
- Tier resolved server-side from `subscriptions.tier`. Gated at three layers: middleware (auth), server components (route gating), API routes (HTTP 402 for free users hitting `/api/ai/tip`).
- OpenAI streaming via the Vercel AI SDK, with a per-user daily rate limit (50/day on Pro, 500/day on Team).
- Self-service billing through Stripe's Customer Portal, one button on `/dashboard/billing`.
- RLS policies on every user-scoped table so a stolen anon key cannot read another tenant's data.

## Architecture

```
                                +--------------------+
                                |   Stripe (test)    |
                                |  Checkout / Portal |
                                +----^---------+-----+
                                     |         |
                            (302)    |         | webhook
                                     |         v
+----------+     +---------------------------+     +--------------+
| Browser  |<--->|  Next.js 14 App Router    |<--->|  Supabase    |
| (RSC +   |     |  - middleware (auth)      |     |  - auth      |
|  client) |     |  - /api/stripe/*          |     |  - postgres  |
+----------+     |  - /api/ai/tip (stream)   |     |  - RLS       |
                 +-------------+-------------+     +--------------+
                               |
                               | streaming completions
                               v
                       +-------+--------+
                       |    OpenAI      |
                       +----------------+
```

Data flow for a paid user clicking "Get AI tip":

1. Browser POSTs `/api/ai/tip` (cookie-bound).
2. Server reads the user via `@supabase/ssr`, looks up `tier` in `subscriptions`, denies free with 402.
3. In-memory rate limiter (per-user, daily) decrements; 429 if exhausted.
4. `streamText` opens an OpenAI completion and pipes it back as a Vercel AI SDK data stream.
5. Browser parses `0:"…"` lines into the live tip card.

## Setup

```bash
# 1. Clone + install
git clone <this repo>
cd 01-saas-starter
npm install

# 2. Supabase
#    - Create a project at https://app.supabase.com
#    - In SQL editor, paste and run supabase/schema.sql
#    - Project Settings → API: copy URL, anon key, service_role key
#    - Authentication → URL Configuration: add http://localhost:3000/auth/callback
#      to the Redirect URLs allow list.

# 3. Stripe (test mode)
#    - https://dashboard.stripe.com/test/products
#    - Create two products with recurring monthly prices:
#        Pro  $19/mo
#        Team $49/mo
#    - Copy each Price ID (price_…) into .env.local
#    - Get sk_test_… from Developers → API keys.

# 4. OpenAI
#    - https://platform.openai.com/api-keys

# 5. Configure env
cp .env.example .env.local
# fill in every field

# 6. Run
npm run dev

# 7. Stripe webhook (separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_… into STRIPE_WEBHOOK_SECRET, then restart `npm run dev`.
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import at https://vercel.com/new, set the same env vars from `.env.local` in Project Settings → Environment Variables, but use live Stripe keys and your production webhook secret.
3. In the Stripe dashboard → Developers → Webhooks, add an endpoint: `https://your-app.vercel.app/api/stripe/webhook`, listening for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel.
4. In Supabase → Authentication → URL Configuration, add the Vercel URL (with `/auth/callback`) to the redirect allow list.

## Roadmap and known limitations

- Rate limiter is in-process memory. Resets on cold start, doesn't share across Vercel instances. The `lib/rate-limit.ts` interface is the only file to change when swapping to Upstash / Redis / a Postgres counter table.
- Stripe event dedupe is also in-memory. A `stripe_events(id PK, processed_at)` table or `SETNX` in Redis is the production fix.
- Team session is a stub UI. The route is gated correctly, but the shared timer needs Supabase Realtime presence channels.
- Tasks table and RLS policies are in the schema but the timer doesn't persist history yet.
- No integration tests yet. The webhook handler and tier gate are the obvious first targets.

## Worth reading first

- [`app/api/stripe/webhook/route.ts`](./app/api/stripe/webhook/route.ts) for signature verification, idempotency, the three event types, and the service-role upsert.
- [`lib/supabase/middleware.ts`](./lib/supabase/middleware.ts) for the SSR cookie refresh and protected-route redirect.
- [`supabase/schema.sql`](./supabase/schema.sql) for the RLS policies and the `auth.users` → `subscriptions` trigger.
- [`app/api/ai/tip/route.ts`](./app/api/ai/tip/route.ts) for auth, tier gate, rate limit, then the streamed OpenAI response.

## License

MIT.
