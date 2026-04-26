'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PricingTier {
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  tier: 'free' | 'pro' | 'team';
  features: string[];
  highlighted?: boolean;
}

interface Props {
  tier: PricingTier;
  isAuthenticated: boolean;
  currentTier: 'free' | 'pro' | 'team';
}

export function PricingCard({ tier, isAuthenticated, currentTier }: Props) {
  const [loading, setLoading] = useState(false);
  const isCurrent = currentTier === tier.tier;

  async function handleSubscribe() {
    if (!isAuthenticated) {
      window.location.href = '/login?next=/dashboard';
      return;
    }

    if (tier.tier === 'free' || isCurrent) return;

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tier: tier.tier }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? 'Checkout failed');
      }
      window.location.href = json.url;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setLoading(false);
    }
  }

  const ctaLabel = (() => {
    if (isCurrent) return 'Current plan';
    if (tier.tier === 'free') return isAuthenticated ? 'Included' : 'Get started';
    return 'Subscribe';
  })();

  return (
    <Card
      className={cn(
        'flex flex-col',
        tier.highlighted && 'border-primary shadow-lg shadow-primary/10'
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{tier.name}</CardTitle>
          {tier.highlighted && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Popular
            </span>
          )}
        </div>
        <CardDescription>{tier.description}</CardDescription>
        <div className="pt-3">
          <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
          {tier.priceSuffix && (
            <span className="text-sm text-muted-foreground"> {tier.priceSuffix}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ul className="flex-1 space-y-2 text-sm">
          {tier.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={tier.highlighted ? 'default' : 'outline'}
          disabled={loading || isCurrent || (tier.tier === 'free' && isAuthenticated)}
          onClick={handleSubscribe}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
            </>
          ) : (
            ctaLabel
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
