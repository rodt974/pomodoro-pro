import Link from 'next/link';
import { Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCurrentTier } from '@/lib/tier';

/**
 * Tier-gated route: only `team` users see the (stub) shared session UI.
 * Anyone else sees an upgrade nudge, gating is enforced server-side.
 */
export default async function TeamPage() {
  const { tier } = await getCurrentTier();

  if (tier !== 'team') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Team sessions
          </CardTitle>
          <CardDescription>
            Shared focus blocks are part of the Team plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/#pricing">
            <Button>Upgrade to Team</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Team session</h1>
        <p className="text-sm text-muted-foreground">
          Real-time shared sessions ship in the next iteration. This page is the
          gated stub the routing exercises.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Live room (stub)
          </CardTitle>
          <CardDescription>
            In production this would render a presence list (Supabase Realtime
            channel) and a synchronised timer.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Stub UI, full implementation intentionally deferred.
        </CardContent>
      </Card>
    </div>
  );
}
