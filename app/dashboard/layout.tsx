import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreditCard, LayoutDashboard, LogOut, Timer, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentTier } from '@/lib/tier';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects, but we double-check at the layout boundary
  // so a misconfigured matcher can never leak the dashboard.
  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const { tier } = await getCurrentTier();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Timer className="h-5 w-5 text-primary" />
            Pomodoro Pro
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4" /> Timer
              </Button>
            </Link>
            <Link href="/dashboard/team">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" /> Team
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button variant="ghost" size="sm">
                <CreditCard className="h-4 w-4" /> Billing
              </Button>
            </Link>
            <span className="ml-2 hidden rounded-full bg-muted px-2 py-1 text-xs font-medium md:inline">
              {tier.toUpperCase()}
            </span>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit" formAction="/auth/signout">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
