import { NextResponse, type NextRequest } from 'next/server';
import { stripe, priceIdForTier, type PaidTier } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface CheckoutBody {
  tier: PaidTier;
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.tier !== 'pro' && body.tier !== 'team') {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const priceId = priceIdForTier(body.tier);
  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
  }

  // If we already have a Stripe customer for this user, reuse it so the
  // portal/webhook lookups are stable. Otherwise let Stripe create one and
  // the webhook will write `stripe_customer_id` on `checkout.session.completed`.
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: sub?.stripe_customer_id ?? undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      // `client_reference_id` carries the Supabase user ID through to the
      // webhook so we can map customer -> user without a separate lookup.
      client_reference_id: user.id,
      metadata: { user_id: user.id, tier: body.tier },
      subscription_data: {
        metadata: { user_id: user.id, tier: body.tier },
      },
      success_url: `${appUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${appUrl}/#pricing?checkout=cancel`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'No session URL' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 });
  }
}
