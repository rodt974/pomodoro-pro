import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Fail fast at boot if Stripe is misconfigured. The catch in route handlers
  // will surface a clean 500 rather than a generic crash later on.
  // eslint-disable-next-line no-console
  console.warn('[stripe] STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  // Pin an API version so future Stripe upgrades don't silently change shape.
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  appInfo: {
    name: 'Pomodoro Pro',
    version: '0.1.0',
  },
});

export const PRICE_IDS = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? '',
  team: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM ?? '',
} as const;

export type PaidTier = 'pro' | 'team';

export function priceIdForTier(tier: PaidTier): string {
  return PRICE_IDS[tier];
}

export function tierForPriceId(priceId: string | null | undefined): 'pro' | 'team' | null {
  if (!priceId) return null;
  if (priceId === PRICE_IDS.pro) return 'pro';
  if (priceId === PRICE_IDS.team) return 'team';
  return null;
}
