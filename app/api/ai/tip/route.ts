import { NextResponse, type NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hitRateLimit } from '@/lib/rate-limit';
import type { Tier } from '@/lib/tier';

// Streaming response, run on the Node runtime so we have access to the
// Supabase server cookies helpers.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_LIMITS: Record<Exclude<Tier, 'free'>, number> = {
  pro: 50,
  team: 500,
};

interface TipBody {
  task?: string;
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { data: subRow } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle();

  const tier = (subRow?.tier as Tier) ?? 'free';

  if (tier === 'free') {
    return NextResponse.json(
      { error: 'Upgrade to Pro to unlock AI tips' },
      { status: 402 }
    );
  }

  // Rate limit per user, per day. In-memory only, see lib/rate-limit.ts.
  const limit = DAILY_LIMITS[tier];
  const rl = hitRateLimit(`ai-tip:${user.id}`, limit);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `Daily limit of ${limit} AI tips reached. Resets at ${new Date(rl.resetAt).toISOString()}.`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(rl.resetAt / 1000)),
        },
      }
    );
  }

  let body: TipBody;
  try {
    body = (await request.json()) as TipBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const task = (body.task ?? '').trim();
  if (!task || task.length > 200) {
    return NextResponse.json(
      { error: 'Task must be 1–200 characters' },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
  }

  // Why createOpenAI explicitly: the default `openai` provider in the AI SDK
  // reads OPENAI_API_KEY from process.env at import time, which makes it
  // unfriendly to test. An explicit factory is also clearer for reviewers.
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system:
      'You are a focus coach. Reply with ONE short, concrete tip (max 50 words) ' +
      "that helps the user start the task they're stuck on. No greetings, no " +
      'numbered lists, no preamble, just the tip.',
    prompt: `Current task: ${task}`,
    temperature: 0.7,
    maxTokens: 120,
  });

  return result.toDataStreamResponse({
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(rl.remaining),
      'X-RateLimit-Reset': String(Math.floor(rl.resetAt / 1000)),
    },
  });
}
