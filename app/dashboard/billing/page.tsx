import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCurrentTier } from '@/lib/tier';
import { ManageBillingButton } from '@/components/manage-billing-button';

export default async function BillingPage() {
  const { tier, status, currentPeriodEnd, stripeCustomerId } = await getCurrentTier();

  const renewsLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription via Stripe&apos;s Customer Portal.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            Plans, payment methods, and invoices are managed in Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Tier" value={tier.toUpperCase()} />
            <Stat label="Status" value={status ?? ','} />
            <Stat label="Renews" value={renewsLabel ?? ','} />
          </dl>

          <div className="flex flex-wrap gap-2">
            {stripeCustomerId ? (
              <ManageBillingButton />
            ) : (
              <Link href="/#pricing">
                <Button>Pick a plan</Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline">
                Back to timer <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold">{value}</dd>
    </div>
  );
}
