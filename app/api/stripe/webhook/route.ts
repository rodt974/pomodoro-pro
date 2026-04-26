import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { stripe, tierForPriceId } from '@/lib/stripe';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';

// Stripe needs the raw body to verify the signature. Disabling the route's
// body parsing in the App Router means using the Web `Request` directly with
// `await request.text()`, which Next 14 supports out of the box.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * In-memory dedupe set. Stripe will retry events; if the same event ID has
 * already been processed in this process, we skip the upsert.
 *
 * Note: in a multi-instance deploy this should be persisted
 * (a `stripe_events(id PK, processed_at)` table or Redis SETNX). The
 * in-memory Set works for a single-instance setup.
 */
const processedEventIds = new Set<string>();

const RELEVANT_EVENTS = new Set<Stripe.Event['type']>([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  if (processedEventIds.has(event.id)) {
    return NextResponse.json({ received: true, deduped: true });
  }
  processedEventIds.add(event.id);
  // Keep the Set bounded so it doesn't grow unbounded under load.
  if (processedEventIds.size > 1000) {
    const first = processedEventIds.values().next().value;
    if (first) processedEventIds.delete(first);
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const supabase = createSupabaseServiceRoleClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabase);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub, supabase, event.type);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[stripe/webhook] handler error', err);
    // 500 → Stripe will retry, which is what we want for transient failures.
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type ServiceClient = ReturnType<typeof createSupabaseServiceRoleClient>;

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ServiceClient
) {
  const userId =
    session.client_reference_id ?? (session.metadata?.user_id as string | undefined);

  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn('[stripe/webhook] checkout.session.completed without user_id');
    return;
  }

  // Pull the subscription so we know the price/tier and renewal date.
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!subscriptionId || !customerId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const tier = tierForPriceId(priceId) ?? 'free';

  await upsertSubscription(supabase, {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    tier,
    status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });
}

async function handleSubscriptionChange(
  sub: Stripe.Subscription,
  supabase: ServiceClient,
  type: 'customer.subscription.updated' | 'customer.subscription.deleted'
) {
  const userId =
    (sub.metadata?.user_id as string | undefined) ??
    (await lookupUserIdByCustomer(sub.customer, supabase));

  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn('[stripe/webhook] subscription event without user mapping', sub.id);
    return;
  }

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id ?? null;

  let tier: 'free' | 'pro' | 'team' = tierForPriceId(priceId) ?? 'free';
  if (type === 'customer.subscription.deleted' || sub.status === 'canceled') {
    tier = 'free';
  }

  await upsertSubscription(supabase, {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    tier,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
  });
}

async function lookupUserIdByCustomer(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
  supabase: ServiceClient
): Promise<string | null> {
  const customerId = typeof customer === 'string' ? customer : customer.id;
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

interface SubscriptionRow {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  tier: 'free' | 'pro' | 'team';
  status: string;
  current_period_end: string;
}

async function upsertSubscription(
  supabase: ServiceClient,
  row: SubscriptionRow
) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        ...row,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}
