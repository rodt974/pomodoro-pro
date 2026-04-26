'use client';

import { useState } from 'react';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { AiTipStream } from '@/components/ai-tip-stream';
import type { Tier } from '@/lib/tier';

interface Props {
  tier: Tier;
  initialTask?: string;
}

/**
 * Dashboard shell holds the shared `taskTitle` state so the timer and the
 * AI-tip card stay in sync. Pure client component; the server page passes
 * down the (already-resolved) tier from the subscriptions table.
 */
export function DashboardShell({ tier, initialTask = '' }: Props) {
  const [taskTitle, setTaskTitle] = useState(initialTask);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <PomodoroTimer taskTitle={taskTitle} onTaskTitleChange={setTaskTitle} />
      <AiTipStream tier={tier} taskTitle={taskTitle} />
    </div>
  );
}
