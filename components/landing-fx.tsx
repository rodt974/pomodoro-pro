'use client';

import { useEffect } from 'react';

export function LandingFx() {
  useEffect(() => {
    // Generate particles
    const root = document.getElementById('landing-particles');
    if (root && root.children.length === 0) {
      for (let i = 0; i < 48; i += 1) {
        const s = document.createElement('span');
        const dur = 14 + Math.random() * 16;
        const delay = -Math.random() * dur;
        const size = Math.random() < 0.15 ? 3 : 1.5;
        s.style.left = Math.random() * 100 + '%';
        s.style.bottom = -10 + Math.random() * 10 + '%';
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.animationDuration = dur + 's';
        s.style.animationDelay = delay + 's';
        s.style.opacity = String(0.35 + Math.random() * 0.55);
        root.appendChild(s);
      }
    }

    // Animate progress arc
    const arc = document.getElementById('landing-arc') as SVGCircleElement | null;
    if (arc) {
      requestAnimationFrame(() => {
        arc.style.strokeDashoffset = '290';
      });
    }

    // Reveal-on-scroll
    const els = document.querySelectorAll('.landing .reveal');
    const showIfVisible = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add('in');
    };
    els.forEach(showIfVisible);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));

    const fallback = setTimeout(() => els.forEach((el) => el.classList.add('in')), 600);

    // Timer countdown
    const t = document.getElementById('landing-time');
    let tickId: ReturnType<typeof setInterval> | null = null;
    if (t) {
      const initial = (t.textContent ?? '17:42').split(':').map(Number);
      let m = initial[0];
      let s = initial[1];
      tickId = setInterval(() => {
        if (s === 0) {
          if (m === 0) return;
          m -= 1;
          s = 59;
        } else {
          s -= 1;
        }
        t.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }, 1000);
    }

    // 3D tilt on feature cards
    const cards = document.querySelectorAll<HTMLElement>('.landing [data-tilt]');
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    cards.forEach((c) => {
      const move = (e: MouseEvent) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -6;
        const ry = (px - 0.5) * 6;
        c.style.transform = `translateY(-4px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const leave = () => {
        c.style.transform = '';
      };
      c.addEventListener('mousemove', move);
      c.addEventListener('mouseleave', leave);
      handlers.push({ el: c, move, leave });
    });

    return () => {
      io.disconnect();
      clearTimeout(fallback);
      if (tickId) clearInterval(tickId);
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  return null;
}
