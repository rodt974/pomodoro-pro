import { createSupabaseServerClient } from '@/lib/supabase/server';

export type Tier = 'free' | 'pro' | 'team';

export interface TierInfo {
  tier: Tier;
  status: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

/**
 * Resolve the current user's tier from the `subscriptions` table.
 * Returns 'free' if there is no row yet (e.g. webhook hasn't fired).
 */
export async function getCurrentTier(): Promise<TierInfo & { userId: string | null }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      tier: 'free',
      status: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
    };
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end, stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    tier: (data?.tier as Tier) ?? 'free',
    status: data?.status ?? null,
    currentPeriodEnd: data?.current_period_end ?? null,
    stripeCustomerId: data?.stripe_customer_id ?? null,
  };
}

export function isPaidTier(tier: Tier): tier is 'pro' | 'team' {
  return tier === 'pro' || tier === 'team';
}
