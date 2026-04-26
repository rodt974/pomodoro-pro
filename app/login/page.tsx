'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function MiniTimer() {
  const arcRef = useRef<SVGCircleElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const arc = arcRef.current;
    if (arc) {
      requestAnimationFrame(() => {
        arc.style.strokeDashoffset = '290';
      });
    }
    const t = timeRef.current;
    if (!t) return;
    const initial = (t.textContent ?? '17:42').split(':').map(Number);
    let m = initial[0];
    let s = initial[1];
    const id = setInterval(() => {
      if (s === 0) {
        if (m === 0) return;
        m -= 1;
        s = 59;
      } else {
        s -= 1;
      }
      t.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ring-mini">
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7ad7ff" />
            <stop offset="50%" stopColor="#b58bff" />
            <stop offset="100%" stopColor="#ff8ec6" />
          </linearGradient>
        </defs>
        <circle className="track" cx="50" cy="50" r="44" />
        <circle
          ref={arcRef}
          className="arc"
          cx="50"
          cy="50"
          r="44"
          pathLength={1000}
          strokeDasharray={1000}
          strokeDashoffset={1000}
        />
      </svg>
      <div className="center" ref={timeRef}>17:42</div>
    </div>
  );
}

function LoginForm() {
  const search = useSearchParams();
  const next = search.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (err) {
      setStatus('error');
      setError(err.message);
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="success-card">
        <div className="icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
            <circle cx="18" cy="6" r="3" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h2>Check your inbox.</h2>
        <p>
          A magic link is on its way to <span className="em">{email}</span>. The link is good for 10 minutes, open it on this device to start the cycle.
        </p>
        <div className="stack-line" style={{ marginTop: 8 }}>
          <span className="d"></span>
          <span>Sent · expires in 10:00</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="eyebrow mono">
        <span className="ln"></span>Sign in
      </div>
      <h1 className="t">
        Welcome back to your <em>quiet</em> hour.
      </h1>
      <p className="sub">
        We&apos;ll send a magic link to your inbox. No passwords, no friction, one tap and the timer is yours.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="ctrl">
            <span className="ic" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>

        {error && <p className="err" role="alert">{error}</p>}

        <button className="btn-magic" type="submit" disabled={status === 'loading'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3l1.5 4.5L11 9 6.5 10.5 5 15l-1.5-4.5L-1 9l4.5-1.5L5 3z" transform="translate(2 0)" />
            <path d="M16 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
          </svg>
          {status === 'loading' ? 'Sending…' : 'Send magic link'}
          <span className="sweep" aria-hidden="true"></span>
        </button>

        <div className="fineprint">
          By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy notice</a>.
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="landing login-shell">
      <div className="ambient" aria-hidden="true"></div>
      <div className="grid-overlay" aria-hidden="true"></div>

      <div className="statusbar" aria-hidden="true">
        <div className="l">
          <span className="live">Auth · v25.4</span>
          <span>Encrypted · TLS 1.3</span>
        </div>
        <div className="r">
          <span>Pomodoro Pro / 2050</span>
        </div>
      </div>

      <header className="nav">
        <Link className="brand" href="/">
          <span className="glyph" aria-hidden="true"></span>
          Pomodoro Pro
        </Link>
        <Link href="/" className="nav-back">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </header>

      <main className="login-main">
        <div className="card-wrap">
          <div className="card-halo" aria-hidden="true"></div>
          <div className="glass-card login-card">
            <Suspense fallback={<div className="sub">Loading…</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <aside className="preview" aria-hidden="true">
          <div className="eyebrow mono">
            <span className="ln"></span>While you wait
          </div>
          <p className="quote">
            A timer that looks you in the eye, starts the clock, and <em>shuts up</em>.
          </p>

          <div className="mini-timer">
            <MiniTimer />
            <div className="mini-text">
              <div className="l1">Deep work · cycle 1 of 4</div>
              <div className="l2">Writing the spec, Q2 launch</div>
            </div>
          </div>

          <div className="stack-line">
            <span className="d"></span>
            <span>432 Hz bell · ambient mode on</span>
          </div>
        </aside>
      </main>
    </div>
  );
}
