'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * SwifterAvatar — 60fps Canvas-based animated AI assistant face.
 *
 * Props:
 *   status  — 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'
 *   volume  — 0..1  (real-time audio amplitude from the AnalyserNode)
 *   size    — canvas logical pixel size (default 150)
 */
export default function SwifterAvatar({ status = 'idle', volume = 0, size = 150 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const statusRef = useRef(status);
  const volumeRef = useRef(volume);

  // Keep refs in sync without triggering draw recreation
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Persistent animation state (survives across frames)
  const s = useRef({
    // Blink
    blinkTimer: 0,
    blinkPhase: 0, // 0 = open, >0 closing, <0 opening
    nextBlink: 2500,
    // Breathing
    breathPhase: 0,
    // Head
    headY: 0, headRot: 0,
    headTY: 0, headTR: 0,
    // Mouth
    mouthOpen: 0, mouthTarget: 0,
    // Smile
    smile: 0.15, smileT: 0.15,
    // Brows
    brow: 0, browT: 0,
    // Pupils
    px: 0, py: 0, ptx: 0, pty: 0, pupilTimer: 0,
    // Glow
    glow: 0.15, glowT: 0.15,
    // Ring
    ringPhase: 0,
    // Nod (reactive to user speech while listening)
    nodTimer: 0,
    nodAmount: 0,
    // Time
    last: 0, t: 0,
  }).current;

  const lerp = (a, b, k) => a + (b - a) * k;

  const draw = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const dt = s.last ? Math.min((ts - s.last) / 1000, 0.05) : 0.016;
    s.last = ts;
    s.t += dt;

    const st = statusRef.current;
    const vol = volumeRef.current;
    const cx = W / 2;
    const cy = H / 2;
    const R = W * 0.34; // head radius

    // ─── Update targets based on state ───────────────────────
    if (st === 'speaking') {
      s.headTY = Math.sin(s.t * 2.5) * 2.5;
      s.headTR = Math.sin(s.t * 1.7) * 1.8;
      s.smileT = 0.25 + vol * 0.35;
      s.browT = 0.15 + vol * 0.35;
      s.mouthTarget = Math.max(0.08, vol);
      s.glowT = 0.45 + vol * 0.55;
    } else if (st === 'listening') {
      s.headTY = Math.sin(s.t * 1.2) * 1.2;
      s.headTR = Math.sin(s.t * 0.7) * 2.5;
      s.smileT = 0.2;
      s.browT = 0.12;
      s.mouthTarget = 0;
      s.glowT = 0.3;
      // Reactive nodding
      s.nodTimer += dt;
      if (s.nodTimer > 1.8 + Math.random() * 2) {
        s.nodAmount = 3;
        s.nodTimer = 0;
      }
      s.nodAmount = lerp(s.nodAmount, 0, dt * 3);
      s.headTY += s.nodAmount;
    } else if (st === 'thinking') {
      s.headTY = -1.5;
      s.headTR = Math.sin(s.t * 0.4) * 1;
      s.smileT = 0;
      s.browT = 0.5;
      s.mouthTarget = 0;
      s.glowT = 0.35 + Math.sin(s.t * 2) * 0.1;
    } else if (st === 'connecting') {
      s.headTY = 0;
      s.headTR = 0;
      s.smileT = 0.1;
      s.browT = 0.05;
      s.mouthTarget = 0;
      s.glowT = 0.25 + Math.sin(s.t * 3) * 0.2;
    } else if (st === 'error') {
      s.headTY = 1;
      s.headTR = -2;
      s.smileT = -0.15;
      s.browT = 0.6;
      s.mouthTarget = 0;
      s.glowT = 0.4;
    } else {
      // idle — subtle alive movement
      s.headTY = Math.sin(s.t * 0.45) * 0.7;
      s.headTR = Math.sin(s.t * 0.3) * 0.6;
      s.smileT = 0.15;
      s.browT = 0;
      s.mouthTarget = 0;
      s.glowT = 0.12;
    }

    // ─── Smooth interpolation ────────────────────────────────
    const spd = dt * 8;
    s.headY = lerp(s.headY, s.headTY, spd);
    s.headRot = lerp(s.headRot, s.headTR, spd);
    s.mouthOpen = lerp(s.mouthOpen, s.mouthTarget, dt * 16); // fast for lip sync
    s.smile = lerp(s.smile, s.smileT, spd);
    s.brow = lerp(s.brow, s.browT, spd);
    s.glow = lerp(s.glow, s.glowT, spd);

    // ─── Breathing ───────────────────────────────────────────
    s.breathPhase += dt * 0.7;
    const breathScale = 1 + Math.sin(s.breathPhase * Math.PI * 2) * 0.012;

    // ─── Blinking ────────────────────────────────────────────
    s.blinkTimer += dt * 1000;
    if (s.blinkTimer > s.nextBlink && s.blinkPhase === 0) {
      s.blinkPhase = 0.001;
      s.blinkTimer = 0;
      s.nextBlink = 2000 + Math.random() * 2500;
    }
    if (s.blinkPhase > 0 && s.blinkPhase < 1) {
      s.blinkPhase = Math.min(1, s.blinkPhase + dt * 10);
    }
    if (s.blinkPhase >= 1) {
      s.blinkPhase = -0.999;
    }
    if (s.blinkPhase < 0) {
      s.blinkPhase = Math.min(0, s.blinkPhase + dt * 10);
    }
    const blink = Math.abs(s.blinkPhase);

    // ─── Pupil drift ─────────────────────────────────────────
    s.pupilTimer += dt;
    if (s.pupilTimer > 2.5 + Math.random() * 2) {
      s.ptx = (Math.random() - 0.5) * 3;
      s.pty = (Math.random() - 0.5) * 2;
      s.pupilTimer = 0;
    }
    s.px = lerp(s.px, s.ptx, dt * 1.5);
    s.py = lerp(s.py, s.pty, dt * 1.5);

    // ─── Ring phase ──────────────────────────────────────────
    s.ringPhase += dt * (st === 'speaking' ? 2.5 + vol * 2 : st === 'listening' ? 1.5 : 0.4);

    // ═══════════════════ DRAW ═══════════════════════════════

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // ─── Glow ring colors ────────────────────────────────────
    const rc = st === 'speaking' ? [167, 139, 250] :
               st === 'listening' ? [110, 231, 183] :
               st === 'thinking' ? [251, 191, 36] :
               st === 'error' ? [252, 165, 165] :
               [124, 58, 237];

    // Outer glow halos
    for (let i = 4; i >= 0; i--) {
      ctx.beginPath();
      ctx.arc(cx, cy + s.headY * 0.3, R + 10 + i * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rc},${s.glow * 0.08 * (4 - i) / 4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Animated ring arc
    const arcLen = st === 'speaking' ? Math.PI * 0.4 + vol * Math.PI * 1.6 :
                   st === 'listening' ? Math.PI * 0.7 :
                   st === 'thinking' ? Math.PI * 0.5 :
                   Math.PI * 0.25;

    ctx.beginPath();
    ctx.arc(cx, cy + s.headY * 0.3, R + 10, s.ringPhase, s.ringPhase + arcLen);
    ctx.strokeStyle = `rgba(${rc},${0.5 + s.glow * 0.5})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = `rgba(${rc},${s.glow})`;
    ctx.shadowBlur = 10 + s.glow * 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Second ring arc (opposite)
    ctx.beginPath();
    ctx.arc(cx, cy + s.headY * 0.3, R + 10, s.ringPhase + Math.PI, s.ringPhase + Math.PI + arcLen * 0.6);
    ctx.strokeStyle = `rgba(${rc},${0.2 + s.glow * 0.3})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // ─── Head transform ──────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy + s.headY);
    ctx.rotate(s.headRot * Math.PI / 180);
    ctx.scale(breathScale, breathScale);

    // ─── Head circle ─────────────────────────────────────────
    const hg = ctx.createLinearGradient(-R, -R, R, R);
    hg.addColorStop(0, '#7c3aed');
    hg.addColorStop(0.5, '#6d28d9');
    hg.addColorStop(1, '#4f46e5');
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();

    // Face specular
    const fg = ctx.createRadialGradient(-R * 0.15, -R * 0.25, 0, 0, 0, R);
    fg.addColorStop(0, 'rgba(221, 214, 254, 0.18)');
    fg.addColorStop(0.5, 'rgba(221, 214, 254, 0.05)');
    fg.addColorStop(1, 'rgba(221, 214, 254, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = fg;
    ctx.fill();

    // ─── Eyes ────────────────────────────────────────────────
    const ey = -R * 0.1;
    const esp = R * 0.36;
    const erx = R * 0.145;
    const ery = R * 0.155 * (1 - blink * 0.92);

    for (const side of [-1, 1]) {
      const ex = side * esp;
      // White
      ctx.beginPath();
      ctx.ellipse(ex, ey, erx, Math.max(0.5, ery), 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,27,75,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      if (blink < 0.75) {
        // Iris
        const ix = ex + s.px;
        const iy = ey + s.py;
        ctx.beginPath();
        ctx.arc(ix, iy, R * 0.085, 0, Math.PI * 2);
        const ig = ctx.createRadialGradient(ix, iy, 0, ix, iy, R * 0.085);
        ig.addColorStop(0, '#312e81');
        ig.addColorStop(0.7, '#1e1b4b');
        ig.addColorStop(1, '#0f0a2a');
        ctx.fillStyle = ig;
        ctx.fill();

        // Pupil
        ctx.beginPath();
        ctx.arc(ix, iy, R * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = '#050211';
        ctx.fill();

        // Reflection
        ctx.beginPath();
        ctx.arc(ix + R * 0.03, iy - R * 0.03, R * 0.025, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();

        // Small reflection
        ctx.beginPath();
        ctx.arc(ix - R * 0.02, iy + R * 0.02, R * 0.012, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();
      }

      // Eyelid shadow (top)
      if (blink > 0.05) {
        ctx.beginPath();
        ctx.ellipse(ex, ey - ery * 0.1, erx * 1.1, ery * blink, 0, 0, Math.PI);
        ctx.fillStyle = 'rgba(109, 40, 217, 0.3)';
        ctx.fill();
      }
    }

    // ─── Eyebrows ────────────────────────────────────────────
    const browY = ey - ery - R * 0.07 - s.brow * 5;
    ctx.lineWidth = R * 0.04;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4c1d95';

    // Left brow
    ctx.beginPath();
    ctx.moveTo(-esp - erx * 0.7, browY + 2);
    ctx.quadraticCurveTo(-esp, browY - s.brow * 3, -esp + erx * 0.7, browY + 1);
    ctx.stroke();

    // Right brow
    ctx.beginPath();
    ctx.moveTo(esp - erx * 0.7, browY + 1);
    ctx.quadraticCurveTo(esp, browY - s.brow * 3, esp + erx * 0.7, browY + 2);
    ctx.stroke();

    // ─── Nose (subtle) ───────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(0, R * 0.02);
    ctx.lineTo(-R * 0.04, R * 0.12);
    ctx.lineTo(R * 0.04, R * 0.12);
    ctx.strokeStyle = 'rgba(76, 29, 149, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ─── Cheeks ──────────────────────────────────────────────
    const cheekA = st === 'speaking' ? 0.12 + vol * 0.18 : 0.06;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * (esp + R * 0.05), R * 0.08, R * 0.11, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192, 132, 252, ${cheekA})`;
      ctx.fill();
    }

    // ─── Mouth ───────────────────────────────────────────────
    const my = R * 0.28;
    const mw = R * 0.22 + s.smile * R * 0.12;

    if (s.mouthOpen > 0.04) {
      // Open mouth (speaking)
      const mh = R * 0.02 + s.mouthOpen * R * 0.28;
      ctx.beginPath();
      ctx.ellipse(0, my, mw, mh, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#2e1065';
      ctx.fill();
      ctx.strokeStyle = '#1e0a4a';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Inner mouth
      if (mh > R * 0.06) {
        ctx.beginPath();
        ctx.ellipse(0, my + mh * 0.15, mw * 0.7, mh * 0.55, 0, 0, Math.PI);
        ctx.fillStyle = '#3b0764';
        ctx.fill();
      }

      // Teeth hint (top)
      if (mh > R * 0.1) {
        ctx.beginPath();
        ctx.ellipse(0, my - mh * 0.35, mw * 0.6, mh * 0.15, 0, Math.PI, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();
      }
    } else {
      // Closed — smile curve
      ctx.beginPath();
      ctx.moveTo(-mw, my);
      ctx.quadraticCurveTo(0, my + s.smile * R * 0.22, mw, my);
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = R * 0.032;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Lip highlight
      ctx.beginPath();
      ctx.moveTo(-mw * 0.6, my + 1);
      ctx.quadraticCurveTo(0, my + s.smile * R * 0.12 + 2, mw * 0.6, my + 1);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ─── AI Badge ────────────────────────────────────────────
    const bx = R * 0.7;
    const by = R * 0.6;
    const br = R * 0.14;

    // Badge glow
    ctx.beginPath();
    ctx.arc(bx, by, br + 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(124, 58, 237, ${0.2 + s.glow * 0.3})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    const bg = ctx.createLinearGradient(bx - br, by - br, bx + br, by + br);
    bg.addColorStop(0, '#7c3aed');
    bg.addColorStop(1, '#4f46e5');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${R * 0.11}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', bx, by + 0.5);

    ctx.restore(); // head transform
    ctx.restore(); // dpr scale

    animRef.current = requestAnimationFrame(draw);
  }, []);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px`, display: 'block' }}
    />
  );
}
