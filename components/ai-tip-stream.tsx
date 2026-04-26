'use client';

import { useState } from 'react';
import { Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tier } from '@/lib/tier';

interface Props {
  tier: Tier;
  taskTitle: string;
}

export function AiTipStream({ tier, taskTitle }: Props) {
  const [tip, setTip] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaid = tier === 'pro' || tier === 'team';

  async function fetchTip() {
    if (!isPaid) {
      window.location.href = '/#pricing';
      return;
    }

    setError(null);
    setTip('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/tip', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ task: taskTitle }),
      });

      if (res.status === 402) {
        setError('Upgrade to Pro to unlock AI tips.');
        return;
      }
      if (res.status === 429) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Daily limit reached. Try again tomorrow.');
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Vercel AI SDK data stream format: lines like `0:"chunk"` for text deltas.
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2)) as string;
              setTip((t) => t + text);
            } catch {
              // ignore malformed line
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI focus tip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={fetchTip}
          disabled={loading || taskTitle.trim().length === 0}
          variant={isPaid ? 'default' : 'outline'}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating…
            </>
          ) : isPaid ? (
            <>
              <Sparkles className="h-4 w-4" /> Get AI tip
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" /> Upgrade to Pro
            </>
          )}
        </Button>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {tip && (
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed">
            {tip}
          </div>
        )}

        {!isPaid && !error && (
          <p className="text-xs text-muted-foreground">
            Pro and Team plans get AI-generated focus tips tailored to your current task.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
