'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Phase = 'focus' | 'short_break' | 'long_break';

const DURATIONS: Record<Phase, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 25 * 60,
};

const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
};

interface Props {
  taskTitle: string;
  onTaskTitleChange: (next: string) => void;
}

export function PomodoroTimer({ taskTitle, onTaskTitleChange }: Props) {
  const [phase, setPhase] = useState<Phase>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [completedFocusBlocks, setCompletedFocusBlocks] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function advancePhase() {
    setRunning(false);
    if (phase === 'focus') {
      const next = completedFocusBlocks + 1;
      setCompletedFocusBlocks(next);
      const nextPhase: Phase = next % 4 === 0 ? 'long_break' : 'short_break';
      setPhase(nextPhase);
      setSecondsLeft(DURATIONS[nextPhase]);
    } else {
      setPhase('focus');
      setSecondsLeft(DURATIONS.focus);
    }
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(DURATIONS[phase]);
  }

  function skip() {
    advancePhase();
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = DURATIONS[phase];
  const progress = ((total - secondsLeft) / total) * 100;

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <label
            htmlFor="task-title"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            What are you focusing on?
          </label>
          <input
            id="task-title"
            type="text"
            value={taskTitle}
            onChange={(e) => onTaskTitleChange(e.target.value)}
            placeholder="e.g. Draft Q3 proposal"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-3 text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {PHASE_LABEL[phase]} · Block {completedFocusBlocks + (phase === 'focus' ? 1 : 0)}
          </div>
          <div
            className={cn(
              'font-mono text-7xl font-bold tabular-nums tracking-tight',
              phase === 'focus' ? 'text-foreground' : 'text-primary'
            )}
            aria-live="polite"
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={() => setRunning((r) => !r)} size="lg" className="min-w-32">
            {running ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Start
              </>
            )}
          </Button>
          <Button onClick={reset} variant="outline" size="lg" aria-label="Reset">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={skip} variant="ghost" size="lg" aria-label="Skip phase">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
