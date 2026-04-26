import { DashboardShell } from '@/components/dashboard-shell';
import { getCurrentTier } from '@/lib/tier';

export default async function DashboardPage() {
  const { tier } = await getCurrentTier();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Today&apos;s focus</h1>
        <p className="text-sm text-muted-foreground">
          One task at a time. Hit start, let the AI tip card help if you stall.
        </p>
      </header>
      <DashboardShell tier={tier} />
    </div>
  );
}
