import Link from 'next/link';
import { getCurrentTier } from '@/lib/tier';
import { LandingFx } from '@/components/landing-fx';

export default async function LandingPage() {
  const info = await getCurrentTier();
  const isAuthenticated = info.userId !== null;
  const tier = info.tier;
  const ctaHref = isAuthenticated ? '/dashboard' : '/login';
  const ctaShort = isAuthenticated ? 'Open dashboard' : 'Start the cycle';
  const ctaPrimaryLabel = isAuthenticated ? 'Open dashboard' : 'Start focusing, free';

  return (
    <div className="landing">
      <div className="ambient" aria-hidden="true"></div>
      <div className="grid-overlay" aria-hidden="true"></div>

      <div className="statusbar" aria-hidden="true">
        <div className="l">
          <span className="live">Stream · v25.4</span>
          <span>BDX · 14:08:22</span>
        </div>
        <div className="r">
          <span>FPS 60 · ◍ 96%</span>
          <span>Pomodoro Pro / 2050</span>
        </div>
      </div>

      <header className="nav">
        <Link className="brand" href="/">
          <span className="glyph" aria-hidden="true"></span>
          Pomodoro Pro
        </Link>
        <nav className="nav-links">
          <a href="#signal">The signal</a>
          <a href="#features">Modules</a>
          <a href="#pricing">Plans</a>
          <Link href={ctaHref} className="nav-cta">
            {ctaShort}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          <div className="blob blob-4"></div>
          <div className="particles" id="landing-particles"></div>
        </div>

        <div className="wrap hero-inner">
          <div className="pill-soft reveal">
            <span className="chip">v25 · 2050</span>
            <span>The timer, reimagined for the post-attention era.</span>
          </div>

          <h1 className="display reveal">
            Focus is the new <span className="grad">luxury</span>.<br />
            Reclaim it, twenty-five<br />minutes at a time.
          </h1>

          <p className="lede reveal">
            Pomodoro Pro is a quiet, glassy timer with an ambient AI co-pilot. It listens, never interrupts, and whispers a tailored nudge the moment your attention slips.
          </p>

          <div className="hero-ctas reveal">
            <Link href={ctaHref} className="btn btn-glow">
              {ctaPrimaryLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#features" className="btn btn-glass">Watch the loop</a>
          </div>

          <div className="ticker reveal">
            <div>
              <span className="mono" style={{ display: 'block', color: 'var(--muted-2050)', marginBottom: 4 }}>Cycle</span>
              <span className="v">25:00</span>
            </div>
            <span className="s"></span>
            <div>
              <span className="mono" style={{ display: 'block', color: 'var(--muted-2050)', marginBottom: 4 }}>Short break</span>
              <span className="v">5:00</span>
            </div>
            <span className="s"></span>
            <div>
              <span className="mono" style={{ display: 'block', color: 'var(--muted-2050)', marginBottom: 4 }}>Long break</span>
              <span className="v">15:00</span>
            </div>
            <span className="s"></span>
            <div>
              <span className="mono" style={{ display: 'block', color: 'var(--muted-2050)', marginBottom: 4 }}>Set</span>
              <span className="v">4 cycles</span>
            </div>
          </div>
        </div>

        <div className="scrollcue" aria-hidden="true">
          <span>Begin</span>
          <span className="ln"></span>
        </div>
      </section>

      <section className="signal" id="signal">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow mono">
                <span className="ln"></span>01 / The instrument
              </div>
              <h2 className="section-title">A surface of <em>glass</em>, a single bell.</h2>
            </div>
            <p className="section-lede">
              Everything else gets out of the way. No streaks. No leaderboards. No notifications you don&apos;t ask for. Just a clean, breathing dial, and a quiet voice when you need one.
            </p>
          </div>

          <div className="timer-stage reveal">
            <div className="float-note fn-1">
              <div className="h">
                <span className="d"></span>
                <span className="lbl">Co-pilot · 14:08</span>
              </div>
              Try writing the next sentence as if you were telling a friend at dinner.
            </div>
            <div className="float-note fn-2">
              <div className="h">
                <span className="d"></span>
                <span className="lbl">Synced · 4 nearby</span>
              </div>
              Mira, Adwait, Léa &amp; Joon are also focusing. You finish in 17:42.
            </div>
            <div className="float-note fn-3">
              <div className="h">
                <span className="d"></span>
                <span className="lbl">Gentle bell</span>
              </div>
              We chose a 432&nbsp;Hz tone tested for low cortisol response.
            </div>

            <div className="glass-card timer-card">
              <div className="label mono">Deep work · cycle 1 of 4</div>
              <div className="ring-wrap">
                <svg viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7ad7ff" />
                      <stop offset="50%" stopColor="#b58bff" />
                      <stop offset="100%" stopColor="#ff8ec6" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-track" cx="100" cy="100" r="92" />
                  <circle
                    id="landing-arc"
                    className="ring-arc"
                    cx="100"
                    cy="100"
                    r="92"
                    pathLength={1000}
                    strokeDasharray={1000}
                    strokeDashoffset={1000}
                  />
                </svg>
                <div className="ring-time">
                  <div className="t" id="landing-time">17:42</div>
                  <div className="sub mono">Writing the spec, Q2 launch</div>
                </div>
              </div>
              <div className="controls">
                <button className="ctl" aria-label="reset">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
                <button className="ctl primary" aria-label="pause">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                </button>
                <button className="ctl" aria-label="skip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4l10 8-10 8V4z" />
                    <path d="M19 5v14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>Twenty-five minutes</span>
          <span>One soft bell</span>
          <span>No streaks</span>
          <span>No notifications</span>
          <span>Tailored AI nudges</span>
          <span>Quiet by default</span>
          <span>Twenty-five minutes</span>
          <span>One soft bell</span>
          <span>No streaks</span>
          <span>No notifications</span>
          <span>Tailored AI nudges</span>
          <span>Quiet by default</span>
        </div>
      </div>

      <section className="features" id="features">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow mono">
                <span className="ln"></span>02 / The modules
              </div>
              <h2 className="section-title">Four small <em>ideas</em>, opinionated on purpose.</h2>
            </div>
            <p className="section-lede">
              No settings menu. No advanced mode. The constraints are the product, every cycle starts the same way, every bell sounds the same, every tip lasts two sentences.
            </p>
          </div>

          <div className="feat-grid">
            <div className="feat-card reveal" data-tilt>
              <div className="num">01 / Ritual</div>
              <h3>25 on, 5 off. Long break <em>every fourth</em>.</h3>
              <p>The cycle is the feature. We never let you turn it into a settings panel.</p>
              <div className="feat-vis">
                <div className="cycle">
                  <div className="seg work"></div><div className="seg brk"></div>
                  <div className="seg work"></div><div className="seg brk"></div>
                  <div className="seg work"></div><div className="seg brk"></div>
                  <div className="seg work"></div><div className="seg long"></div>
                </div>
              </div>
            </div>

            <div className="feat-card wide reveal" data-tilt>
              <div className="num">02 / Co-pilot</div>
              <h3>Stuck? Two-sentence <em>nudges</em>, on tap.</h3>
              <p>Press once. A tailored tip streams in, short enough to read in a breath, sharp enough to break the loop. Works on-device when you&apos;re offline.</p>
              <div className="feat-vis">
                <div className="term">
                  <div className="you">› i&apos;ve been staring at this paragraph for ten minutes</div>
                  <div className="ai">› try writing the next sentence as if you were<br />&nbsp;&nbsp;telling a friend at dinner.<span className="cur"></span></div>
                </div>
              </div>
            </div>

            <div className="feat-card wide reveal" data-tilt>
              <div className="num">03 / Today&apos;s list</div>
              <h3>Three tasks. <em>That&apos;s the list.</em></h3>
              <p>No projects. No tags. No priorities. Pick the thing, start the timer, return when the bell rings. The constraint is the point.</p>
              <div className="feat-vis">
                <div className="tasks">
                  <div className="row done"><span className="check"></span>Reply to Anya about the contract</div>
                  <div className="row"><span className="check"></span>Draft the launch post (hero + 3 sections)</div>
                  <div className="row"><span className="check"></span>Review pricing copy with Léa</div>
                </div>
              </div>
            </div>

            <div className="feat-card reveal" data-tilt>
              <div className="num">04 / Together</div>
              <h3>Hit flow, <em>in sync</em>.</h3>
              <p>Up to twelve teammates. Same bell, same silence.</p>
              <div className="feat-vis">
                <div className="avs">
                  <div className="av">M</div>
                  <div className="av">A</div>
                  <div className="av">L</div>
                  <div className="av">J</div>
                  <div className="av live">+8</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow mono">
                <span className="ln"></span>03 / Plans
              </div>
              <h2 className="section-title">Honest <em>pricing</em>. Pay for time, not features.</h2>
            </div>
            <p className="section-lede">
              Start free. Upgrade only when AI nudges have actually saved you time. Each month we send a usage email, if you didn&apos;t use it, we suggest you downgrade.
            </p>
          </div>

          <div className="price-grid">
            <div className="price reveal">
              <h3>Free</h3>
              <p className="tag">The timer, forever free.</p>
              <div className="amount"><span className="n">$0</span><span className="p">/forever</span></div>
              <ul>
                <li>Unlimited 25 / 5 cycles</li>
                <li>Local task list</li>
                <li>Soft bell · 432 Hz</li>
                <li>No credit card</li>
              </ul>
              {tier === 'free' ? (
                <button className="cta disabled" disabled>Current plan</button>
              ) : (
                <Link href={ctaHref} className="cta">Get started</Link>
              )}
            </div>

            <div className="price pop reveal">
              <h3>Pro <span className="badge">Most picked</span></h3>
              <p className="tag">For solo deep workers.</p>
              <div className="amount"><span className="n">$19</span><span className="p">/month</span></div>
              <ul>
                <li>Everything in Free</li>
                <li>AI co-pilot nudges</li>
                <li>50 nudges per day</li>
                <li>Weekly review email</li>
                <li>Menu-bar app</li>
              </ul>
              {tier === 'pro' ? (
                <button className="cta fill disabled" disabled>Current plan</button>
              ) : (
                <Link href={ctaHref} className="cta fill">Subscribe →</Link>
              )}
            </div>

            <div className="price reveal">
              <h3>Team</h3>
              <p className="tag">For squads that focus together.</p>
              <div className="amount"><span className="n">$49</span><span className="p">/seat · month</span></div>
              <ul>
                <li>Everything in Pro</li>
                <li>Shared sessions · 12 seats</li>
                <li>500 nudges per day</li>
                <li>SSO &amp; SCIM</li>
                <li>Quiet hours, by zone</li>
              </ul>
              {tier === 'team' ? (
                <button className="cta disabled" disabled>Current plan</button>
              ) : (
                <Link href={ctaHref} className="cta">Talk to us →</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-glass">
            <div className="brand">
              <span className="glyph" aria-hidden="true"></span>
              Pomodoro Pro
            </div>
            <div className="stack">
              Built with <b>Next.js 14</b>, <b>Supabase</b>, <b>Stripe</b>, <b>OpenAI</b>
            </div>
          </div>
        </div>
      </footer>

      <LandingFx />
    </div>
  );
}
