'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * SwifterAvatar — Modern voice-reactive AI visualization.
 * A liquid-metal orb with audio-reactive particles & waveform rings,
 * inspired by ChatGPT Voice / Siri / Google Assistant.
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

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const particlesRef = useRef(null);
  if (!particlesRef.current) {
    const arr = [];
    for (let i = 0; i < 48; i++) {
      const ang = (i / 48) * Math.PI * 2 + Math.random() * 0.3;
      arr.push({
        baseAngle: ang,
        angle: ang,
        radius: 0.55 + Math.random() * 0.1,
        size: 0.6 + Math.random() * 1.2,
        speed: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        hueShift: (Math.random() - 0.5) * 30,
      });
    }
    particlesRef.current = arr;
  }

  const s = useRef({
    t: 0, last: 0,
    volEnv: 0,
    rot: 0,
    pulse: 0, pulseT: 0,
    hueRot: 0, hueRotT: 0,
    core: 1, coreT: 1,
    blobSeed: Array.from({ length: 8 }, () => Math.random() * Math.PI * 2),
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
    const rawVol = volumeRef.current;
    const atk = rawVol > s.volEnv ? dt * 26 : dt * 8;
    s.volEnv = lerp(s.volEnv, rawVol, Math.min(1, atk));
    const vol = s.volEnv;

    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.32;

    if (st === 'speaking') {
      s.pulseT = 1.08 + vol * 0.35;
      s.coreT = 0.55 + vol * 0.4;
      s.hueRotT = 0;
      s.rot += dt * (0.6 + vol * 1.8);
    } else if (st === 'listening') {
      s.pulseT = 1 + Math.sin(s.t * 2) * 0.04;
      s.coreT = 0.5;
      s.hueRotT = 60;
      s.rot += dt * 0.4;
    } else if (st === 'thinking') {
      s.pulseT = 1 + Math.sin(s.t * 3.5) * 0.08;
      s.coreT = 0.6 + Math.sin(s.t * 2) * 0.2;
      s.hueRotT = -30;
      s.rot += dt * 1.2;
    } else if (st === 'connecting') {
      s.pulseT = 1 + Math.sin(s.t * 4) * 0.06;
      s.coreT = 0.5;
      s.hueRotT = 0;
      s.rot += dt * 2;
    } else if (st === 'error') {
      s.pulseT = 1;
      s.coreT = 0.4;
      s.hueRotT = -120;
      s.rot += dt * 0.2;
    } else {
      s.pulseT = 1 + Math.sin(s.t * 1.2) * 0.03;
      s.coreT = 0.35;
      s.hueRotT = 0;
      s.rot += dt * 0.3;
    }

    s.pulse = lerp(s.pulse, s.pulseT, Math.min(1, dt * 10));
    s.core = lerp(s.core, s.coreT, Math.min(1, dt * 8));
    s.hueRot = lerp(s.hueRot, s.hueRotT, Math.min(1, dt * 3));

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const baseHue = 262;
    const hue = baseHue + s.hueRot;
    const accentGlow = `hsla(${hue}, 100%, 70%, 0.6)`;

    // Outer halo
    for (let i = 6; i >= 1; i--) {
      const rr = R * s.pulse * (1.35 + i * 0.15);
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue + 20}, 90%, 65%, ${0.035 * (7 - i) / 6 * (0.6 + vol * 0.8)})`;
      ctx.fill();
    }

    // Waveform rings when speaking
    if (st === 'speaking' && vol > 0.02) {
      for (let ring = 0; ring < 3; ring++) {
        const phase = (s.t * 0.9 + ring * 0.4) % 1.5;
        if (phase > 1.3) continue;
        const rr = R * (1 + phase * 1.2);
        const alpha = (1 - phase / 1.3) * 0.35 * Math.min(1, vol * 2);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Orbiting particles
    const particles = particlesRef.current;
    for (const p of particles) {
      p.phase += dt * p.speed * (st === 'speaking' ? 1 + vol * 2 : st === 'thinking' ? 1.8 : st === 'listening' ? 1 : 0.4);
      p.angle = p.baseAngle + s.rot * 0.6 + Math.sin(p.phase) * 0.4;
      const reactR = 1 + (st === 'speaking' ? vol * 0.35 : 0) + Math.sin(s.t * 2 + p.phase) * 0.05;
      const rr = R * p.radius * s.pulse * reactR * 1.12;
      const px = cx + Math.cos(p.angle) * rr;
      const py = cy + Math.sin(p.angle) * rr;
      const dotR = p.size * (1 + vol * 0.8);
      const ph = hue + p.hueShift;

      const pg = ctx.createRadialGradient(px, py, 0, px, py, dotR * 4);
      pg.addColorStop(0, `hsla(${ph}, 95%, 80%, 0.8)`);
      pg.addColorStop(1, `hsla(${ph}, 95%, 80%, 0)`);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, dotR * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${ph}, 95%, 85%, 0.95)`;
      ctx.fill();
    }

    // Main orb (liquid blob with subtle deformation)
    const blobR = R * s.pulse;

    // Soft halo behind orb
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobR * 1.6);
    halo.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.35)`);
    halo.addColorStop(0.5, `hsla(${hue}, 100%, 60%, 0.15)`);
    halo.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, blobR * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Deformed-circle blob path
    ctx.save();
    ctx.beginPath();
    const segments = 72;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      let def = 0;
      for (let k = 0; k < s.blobSeed.length; k++) {
        def += Math.sin(a * (k + 2) + s.t * (0.4 + k * 0.15) + s.blobSeed[k]) * (0.015 / (k + 1));
      }
      const voiceBump = (st === 'speaking' ? vol * 0.12 : 0) * Math.sin(a * 3 + s.t * 4);
      const r = blobR * (1 + def + voiceBump);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const bg = ctx.createRadialGradient(
      cx - blobR * 0.35, cy - blobR * 0.35, 0,
      cx, cy, blobR
    );
    bg.addColorStop(0, `hsl(${hue - 10}, 95%, 82%)`);
    bg.addColorStop(0.3, `hsl(${hue}, 85%, 65%)`);
    bg.addColorStop(0.7, `hsl(${hue + 10}, 75%, 50%)`);
    bg.addColorStop(1, `hsl(${hue + 20}, 75%, 30%)`);
    ctx.fillStyle = bg;
    ctx.shadowColor = accentGlow;
    ctx.shadowBlur = 25 + vol * 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Bright inner core
    const coreR = blobR * s.core * 0.55;
    const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    coreG.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    coreG.addColorStop(0.35, `hsla(${hue - 10}, 100%, 90%, 0.7)`);
    coreG.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);
    ctx.fillStyle = coreG;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Inner audio bars while speaking
    if (st === 'speaking' && vol > 0.01) {
      const bars = 24;
      for (let i = 0; i < bars; i++) {
        const a = (i / bars) * Math.PI * 2 + s.rot;
        const amp = (0.5 + Math.sin(s.t * 8 + i * 0.7) * 0.5) * vol;
        const r1 = blobR * 0.3;
        const r2 = blobR * (0.35 + amp * 0.45);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.strokeStyle = `hsla(${hue - 5}, 100%, 85%, ${0.4 + amp * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Thinking dots
    if (st === 'thinking') {
      for (let d = 0; d < 3; d++) {
        const phase = (s.t * 3 - d * 0.3) % 2;
        const alpha = Math.max(0, Math.sin(phase * Math.PI));
        const dx = cx + (d - 1) * coreR * 0.45;
        ctx.beginPath();
        ctx.arc(dx, cy, coreR * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();
      }
    }

    // Specular highlights
    const specX = cx - blobR * 0.35;
    const specY = cy - blobR * 0.4;
    const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, blobR * 0.35);
    specG.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    specG.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specG;
    ctx.beginPath();
    ctx.ellipse(specX, specY, blobR * 0.3, blobR * 0.22, -0.5, 0, Math.PI * 2);
    ctx.fill();

    const sp2 = ctx.createRadialGradient(cx + blobR * 0.2, cy + blobR * 0.35, 0, cx + blobR * 0.2, cy + blobR * 0.35, blobR * 0.15);
    sp2.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    sp2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sp2;
    ctx.beginPath();
    ctx.arc(cx + blobR * 0.2, cy + blobR * 0.35, blobR * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    animRef.current = requestAnimationFrame(draw);
  }, []);

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
