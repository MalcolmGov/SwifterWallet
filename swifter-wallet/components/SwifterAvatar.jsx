'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * SwifterAvatar — Canvas-based humanlike AI assistant face.
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

  // Persistent animation state
  const s = useRef({
    blinkTimer: 0, blinkPhase: 0, nextBlink: 2500,
    breathPhase: 0,
    headY: 0, headRot: 0, headTY: 0, headTR: 0,
    // jaw — how far jaw drops (independent of lip opening amount)
    jaw: 0, jawT: 0,
    // mouth opening (0..1)
    mouthOpen: 0, mouthTarget: 0,
    // lip rounding (0 = wide, 1 = pursed like "oo")
    lipRound: 0, lipRoundT: 0,
    // volume envelope used for lip sync (smoothed)
    volEnv: 0,
    smile: 0.15, smileT: 0.15,
    brow: 0, browT: 0,
    browTilt: 0, browTiltT: 0,
    px: 0, py: 0, ptx: 0, pty: 0, pupilTimer: 0,
    glow: 0.15, glowT: 0.15,
    ringPhase: 0,
    nodTimer: 0, nodAmount: 0,
    // Phoneme cycle — to make the mouth vary shape naturally while speaking
    phonemeTimer: 0, phonemeTarget: 0,
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
    const rawVol = volumeRef.current;
    // Smooth volume envelope — attack fast, release slower
    const target = rawVol;
    const atk = target > s.volEnv ? dt * 28 : dt * 10;
    s.volEnv = lerp(s.volEnv, target, Math.min(1, atk));
    const vol = s.volEnv;

    const cx = W / 2;
    const cy = H / 2;
    const R = W * 0.32; // head radius (slightly smaller to fit longer face)

    // ─── State-driven targets ────────────────────────────────
    if (st === 'speaking') {
      // Natural head bob while speaking
      s.headTY = Math.sin(s.t * 2.3) * 2.2 + Math.sin(s.t * 4.1) * 0.6;
      s.headTR = Math.sin(s.t * 1.5) * 2.2;
      s.smileT = 0.2 + vol * 0.25;
      s.browT = 0.12 + vol * 0.3;
      s.browTiltT = Math.sin(s.t * 2) * 0.15;
      // Mouth opens based on volume with a soft floor so it never stays dead-closed
      s.mouthTarget = Math.min(1, 0.15 + vol * 1.6);
      s.jawT = s.mouthTarget * 0.9;
      // Cycle phoneme shapes every ~180ms for natural mouth movement
      s.phonemeTimer += dt;
      if (s.phonemeTimer > 0.16 + Math.random() * 0.14) {
        s.phonemeTarget = Math.random();
        s.phonemeTimer = 0;
      }
      s.lipRoundT = s.phonemeTarget * 0.7;
      s.glowT = 0.45 + vol * 0.55;
      // Occasional emphasis nod
      s.nodTimer += dt;
      if (s.nodTimer > 2.5 + Math.random() * 2.5 && vol > 0.3) {
        s.nodAmount = 2.5;
        s.nodTimer = 0;
      }
      s.nodAmount = lerp(s.nodAmount, 0, dt * 4);
      s.headTY += s.nodAmount;
    } else if (st === 'listening') {
      s.headTY = Math.sin(s.t * 1.1) * 1;
      s.headTR = Math.sin(s.t * 0.7) * 2.2;
      s.smileT = 0.18;
      s.browT = 0.1;
      s.browTiltT = 0;
      s.mouthTarget = 0;
      s.jawT = 0;
      s.lipRoundT = 0;
      s.glowT = 0.3;
      // Responsive nodding — feels like active listening
      s.nodTimer += dt;
      if (s.nodTimer > 1.6 + Math.random() * 2) {
        s.nodAmount = 3.2;
        s.nodTimer = 0;
      }
      s.nodAmount = lerp(s.nodAmount, 0, dt * 3);
      s.headTY += s.nodAmount;
    } else if (st === 'thinking') {
      s.headTY = -1.5;
      s.headTR = Math.sin(s.t * 0.4) * 1;
      s.smileT = 0;
      s.browT = 0.45;
      s.browTiltT = -0.2;
      s.mouthTarget = 0;
      s.jawT = 0;
      s.lipRoundT = 0.3;
      s.glowT = 0.32 + Math.sin(s.t * 2) * 0.1;
    } else if (st === 'connecting') {
      s.headTY = 0;
      s.headTR = 0;
      s.smileT = 0.1;
      s.browT = 0.05;
      s.browTiltT = 0;
      s.mouthTarget = 0;
      s.jawT = 0;
      s.lipRoundT = 0;
      s.glowT = 0.25 + Math.sin(s.t * 3) * 0.2;
    } else if (st === 'error') {
      s.headTY = 1;
      s.headTR = -2;
      s.smileT = -0.15;
      s.browT = 0.55;
      s.browTiltT = 0.25;
      s.mouthTarget = 0;
      s.jawT = 0;
      s.lipRoundT = 0;
      s.glowT = 0.4;
    } else {
      // idle — subtle breathing
      s.headTY = Math.sin(s.t * 0.5) * 0.6;
      s.headTR = Math.sin(s.t * 0.32) * 0.5;
      s.smileT = 0.18;
      s.browT = 0;
      s.browTiltT = 0;
      s.mouthTarget = 0;
      s.jawT = 0;
      s.lipRoundT = 0;
      s.glowT = 0.12;
    }

    // ─── Smooth interpolation ────────────────────────────────
    const spd = dt * 8;
    s.headY = lerp(s.headY, s.headTY, spd);
    s.headRot = lerp(s.headRot, s.headTR, spd);
    // Lip sync: mouth open is fast, jaw is slightly slower (mass), lip round is snappy
    s.mouthOpen = lerp(s.mouthOpen, s.mouthTarget, Math.min(1, dt * 22));
    s.jaw = lerp(s.jaw, s.jawT, Math.min(1, dt * 14));
    s.lipRound = lerp(s.lipRound, s.lipRoundT, Math.min(1, dt * 12));
    s.smile = lerp(s.smile, s.smileT, spd);
    s.brow = lerp(s.brow, s.browT, spd);
    s.browTilt = lerp(s.browTilt, s.browTiltT, spd);
    s.glow = lerp(s.glow, s.glowT, spd);

    // ─── Breathing ───────────────────────────────────────────
    s.breathPhase += dt * 0.65;
    const breathScale = 1 + Math.sin(s.breathPhase * Math.PI * 2) * 0.01;

    // ─── Blinking ────────────────────────────────────────────
    s.blinkTimer += dt * 1000;
    if (s.blinkTimer > s.nextBlink && s.blinkPhase === 0) {
      s.blinkPhase = 0.001;
      s.blinkTimer = 0;
      s.nextBlink = 1800 + Math.random() * 2800;
    }
    if (s.blinkPhase > 0 && s.blinkPhase < 1) {
      s.blinkPhase = Math.min(1, s.blinkPhase + dt * 11);
    }
    if (s.blinkPhase >= 1) s.blinkPhase = -0.999;
    if (s.blinkPhase < 0) s.blinkPhase = Math.min(0, s.blinkPhase + dt * 11);
    const blink = Math.abs(s.blinkPhase);

    // ─── Pupil drift + eye contact ───────────────────────────
    s.pupilTimer += dt;
    if (s.pupilTimer > 2.2 + Math.random() * 2) {
      // Occasional eye-movement — small for natural feel
      s.ptx = (Math.random() - 0.5) * 3.5;
      s.pty = (Math.random() - 0.5) * 2;
      s.pupilTimer = 0;
    }
    s.px = lerp(s.px, s.ptx, dt * 1.8);
    s.py = lerp(s.py, s.pty, dt * 1.8);

    // ─── Ring phase ──────────────────────────────────────────
    s.ringPhase += dt * (st === 'speaking' ? 2.2 + vol * 2 : st === 'listening' ? 1.4 : 0.4);

    // ═══════════════════ DRAW ═══════════════════════════════

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Status-tinted accent color
    const rc = st === 'speaking' ? [167, 139, 250] :
               st === 'listening' ? [110, 231, 183] :
               st === 'thinking' ? [251, 191, 36] :
               st === 'error' ? [252, 165, 165] :
               [139, 92, 246];

    // ─── Outer glow halos ────────────────────────────────────
    for (let i = 4; i >= 0; i--) {
      ctx.beginPath();
      ctx.arc(cx, cy + s.headY * 0.3, R + 12 + i * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rc},${s.glow * 0.08 * (4 - i) / 4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Animated ring arcs
    const arcLen = st === 'speaking' ? Math.PI * 0.4 + vol * Math.PI * 1.6 :
                   st === 'listening' ? Math.PI * 0.7 :
                   st === 'thinking' ? Math.PI * 0.5 :
                   Math.PI * 0.25;
    ctx.beginPath();
    ctx.arc(cx, cy + s.headY * 0.3, R + 12, s.ringPhase, s.ringPhase + arcLen);
    ctx.strokeStyle = `rgba(${rc},${0.55 + s.glow * 0.45})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = `rgba(${rc},${s.glow})`;
    ctx.shadowBlur = 10 + s.glow * 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(cx, cy + s.headY * 0.3, R + 12, s.ringPhase + Math.PI, s.ringPhase + Math.PI + arcLen * 0.6);
    ctx.strokeStyle = `rgba(${rc},${0.2 + s.glow * 0.3})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // ─── Head transform ──────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy + s.headY);
    ctx.rotate(s.headRot * Math.PI / 180);
    ctx.scale(breathScale, breathScale);

    // ─── Neck / shoulder hint ───────────────────────────────
    ctx.beginPath();
    ctx.moveTo(-R * 0.35, R * 0.85);
    ctx.lineTo(-R * 0.22, R * 1.05);
    ctx.lineTo(R * 0.22, R * 1.05);
    ctx.lineTo(R * 0.35, R * 0.85);
    ctx.closePath();
    const neckG = ctx.createLinearGradient(0, R * 0.7, 0, R * 1.1);
    neckG.addColorStop(0, '#5b21b6');
    neckG.addColorStop(1, '#3b0764');
    ctx.fillStyle = neckG;
    ctx.fill();

    // ─── Head shape (oval, slightly taller than wide) ────────
    const headW = R;
    const headH = R * 1.08;
    ctx.beginPath();
    ctx.ellipse(0, 0, headW, headH, 0, 0, Math.PI * 2);
    const hg = ctx.createRadialGradient(-headW * 0.2, -headH * 0.3, headH * 0.1, 0, 0, headH);
    hg.addColorStop(0, '#a78bfa');
    hg.addColorStop(0.45, '#7c3aed');
    hg.addColorStop(0.85, '#5b21b6');
    hg.addColorStop(1, '#3b0764');
    ctx.fillStyle = hg;
    ctx.fill();

    // Forehead highlight
    const fh = ctx.createRadialGradient(-headW * 0.15, -headH * 0.45, 0, -headW * 0.15, -headH * 0.45, headH * 0.6);
    fh.addColorStop(0, 'rgba(237, 233, 254, 0.25)');
    fh.addColorStop(1, 'rgba(237, 233, 254, 0)');
    ctx.beginPath();
    ctx.ellipse(0, 0, headW, headH, 0, 0, Math.PI * 2);
    ctx.fillStyle = fh;
    ctx.fill();

    // Subtle side shadow
    const ss = ctx.createLinearGradient(headW * 0.3, 0, headW, 0);
    ss.addColorStop(0, 'rgba(59, 7, 100, 0)');
    ss.addColorStop(1, 'rgba(59, 7, 100, 0.35)');
    ctx.beginPath();
    ctx.ellipse(0, 0, headW, headH, 0, 0, Math.PI * 2);
    ctx.fillStyle = ss;
    ctx.fill();

    // ─── Hair / top cap (subtle) ─────────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -headH * 0.45, headW * 0.95, headH * 0.35, 0, Math.PI, Math.PI * 2);
    const hairG = ctx.createLinearGradient(0, -headH, 0, 0);
    hairG.addColorStop(0, '#1e1b4b');
    hairG.addColorStop(1, 'rgba(30, 27, 75, 0)');
    ctx.fillStyle = hairG;
    ctx.fill();
    ctx.restore();

    // ─── Eyes ────────────────────────────────────────────────
    const ey = -headH * 0.08;
    const esp = headW * 0.34;
    const erx = headW * 0.16;
    const ery = headH * 0.13 * (1 - blink * 0.93);

    for (const side of [-1, 1]) {
      const ex = side * esp;

      // Eye socket shadow
      ctx.beginPath();
      ctx.ellipse(ex, ey + ery * 0.3, erx * 1.15, ery * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 27, 75, 0.25)';
      ctx.fill();

      // Sclera (eye white) — almond shape
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ex, ey, erx, Math.max(0.5, ery), 0, 0, Math.PI * 2);
      ctx.clip();

      ctx.beginPath();
      ctx.ellipse(ex, ey, erx, Math.max(0.5, ery), 0, 0, Math.PI * 2);
      const sg = ctx.createRadialGradient(ex, ey, 0, ex, ey, erx);
      sg.addColorStop(0, '#ffffff');
      sg.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = sg;
      ctx.fill();

      if (blink < 0.75) {
        const ix = ex + s.px;
        const iy = ey + s.py;
        const irisR = headW * 0.095;

        // Iris outer
        ctx.beginPath();
        ctx.arc(ix, iy, irisR, 0, Math.PI * 2);
        const ig = ctx.createRadialGradient(ix, iy - irisR * 0.3, 0, ix, iy, irisR);
        ig.addColorStop(0, '#6366f1');
        ig.addColorStop(0.55, '#3730a3');
        ig.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = ig;
        ctx.fill();

        // Iris detail striations
        ctx.strokeStyle = 'rgba(165, 180, 252, 0.35)';
        ctx.lineWidth = 0.6;
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(ix + Math.cos(a) * irisR * 0.4, iy + Math.sin(a) * irisR * 0.4);
          ctx.lineTo(ix + Math.cos(a) * irisR * 0.95, iy + Math.sin(a) * irisR * 0.95);
          ctx.stroke();
        }

        // Pupil
        const pupilR = irisR * (0.42 - vol * 0.05);
        ctx.beginPath();
        ctx.arc(ix, iy, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = '#050211';
        ctx.fill();

        // Primary highlight
        ctx.beginPath();
        ctx.arc(ix + irisR * 0.35, iy - irisR * 0.35, irisR * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fill();

        // Secondary highlight
        ctx.beginPath();
        ctx.arc(ix - irisR * 0.2, iy + irisR * 0.25, irisR * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      }
      ctx.restore();

      // Upper eyelid shadow
      if (blink < 0.9) {
        ctx.beginPath();
        ctx.ellipse(ex, ey - ery * 0.55, erx * 1.02, ery * 0.4, 0, 0, Math.PI);
        ctx.fillStyle = 'rgba(76, 29, 149, 0.22)';
        ctx.fill();
      }

      // Eyelid (closed / closing)
      if (blink > 0.05) {
        ctx.beginPath();
        ctx.ellipse(ex, ey, erx, ery + blink * headH * 0.14, 0, Math.PI, Math.PI * 2);
        ctx.fillStyle = '#6d28d9';
        ctx.fill();
      }

      // Lash hint
      ctx.beginPath();
      ctx.moveTo(ex - erx, ey - ery * 0.15);
      ctx.quadraticCurveTo(ex, ey - ery * 1.05, ex + erx, ey - ery * 0.15);
      ctx.strokeStyle = 'rgba(30, 27, 75, 0.55)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // ─── Eyebrows ────────────────────────────────────────────
    const browY = ey - ery - headH * 0.06 - s.brow * 6;
    ctx.lineWidth = headW * 0.045;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3b0764';

    // Left brow
    ctx.beginPath();
    ctx.moveTo(-esp - erx * 0.8, browY + 2 + s.browTilt * 3);
    ctx.quadraticCurveTo(-esp, browY - s.brow * 3 - s.browTilt * 2, -esp + erx * 0.8, browY + 1 - s.browTilt * 3);
    ctx.stroke();

    // Right brow
    ctx.beginPath();
    ctx.moveTo(esp - erx * 0.8, browY + 1 - s.browTilt * 3);
    ctx.quadraticCurveTo(esp, browY - s.brow * 3 - s.browTilt * 2, esp + erx * 0.8, browY + 2 + s.browTilt * 3);
    ctx.stroke();

    // ─── Nose ────────────────────────────────────────────────
    const nTop = -headH * 0.02;
    const nBot = headH * 0.16;
    ctx.beginPath();
    ctx.moveTo(-headW * 0.03, nTop);
    ctx.quadraticCurveTo(-headW * 0.07, nBot * 0.75, -headW * 0.05, nBot);
    ctx.strokeStyle = 'rgba(59, 7, 100, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nose tip
    ctx.beginPath();
    ctx.ellipse(0, nBot, headW * 0.07, headH * 0.035, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 7, 100, 0.35)';
    ctx.fill();

    // Nostrils
    for (const nside of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(nside * headW * 0.028, nBot + 1, headW * 0.014, headH * 0.012, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 27, 75, 0.6)';
      ctx.fill();
    }

    // ─── Cheeks ──────────────────────────────────────────────
    const cheekA = st === 'speaking' ? 0.15 + vol * 0.2 : 0.08;
    for (const cside of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cside * (esp + headW * 0.08), headH * 0.1, headW * 0.13, 0, Math.PI * 2);
      const cg = ctx.createRadialGradient(cside * (esp + headW * 0.08), headH * 0.1, 0, cside * (esp + headW * 0.08), headH * 0.1, headW * 0.13);
      cg.addColorStop(0, `rgba(236, 72, 153, ${cheekA})`);
      cg.addColorStop(1, `rgba(236, 72, 153, 0)`);
      ctx.fillStyle = cg;
      ctx.fill();
    }

    // ─── Mouth (with jaw drop) ───────────────────────────────
    // Jaw lowers the whole mouth position while open
    const jawDrop = s.jaw * headH * 0.08;
    const my = headH * 0.35 + jawDrop;

    // Lip width narrows when pursed ("oo"), widens when smiling
    const wideShape = 1 - s.lipRound * 0.5;
    const mw = (headW * 0.24 + s.smile * headW * 0.08) * wideShape;
    const openAmt = s.mouthOpen;

    if (openAmt > 0.06) {
      // Open mouth shape
      const tall = 1 + s.lipRound * 0.8; // rounder = taller
      const mh = (headH * 0.025 + openAmt * headH * 0.22) * tall;

      // Dark mouth cavity
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, my, mw, mh, 0, 0, Math.PI * 2);
      ctx.clip();

      ctx.beginPath();
      ctx.ellipse(0, my, mw, mh, 0, 0, Math.PI * 2);
      const mg = ctx.createRadialGradient(0, my, 0, 0, my, Math.max(mw, mh));
      mg.addColorStop(0, '#1a0b2e');
      mg.addColorStop(0.6, '#2e1065');
      mg.addColorStop(1, '#0a0319');
      ctx.fillStyle = mg;
      ctx.fill();

      // Tongue (pink hint at bottom)
      if (mh > headH * 0.04) {
        ctx.beginPath();
        ctx.ellipse(0, my + mh * 0.35, mw * 0.75, mh * 0.55, 0, 0, Math.PI * 2);
        const tg = ctx.createRadialGradient(0, my + mh * 0.35, 0, 0, my + mh * 0.35, mw * 0.75);
        tg.addColorStop(0, 'rgba(236, 72, 153, 0.85)');
        tg.addColorStop(1, 'rgba(131, 24, 67, 0.4)');
        ctx.fillStyle = tg;
        ctx.fill();
      }

      // Top teeth (row)
      if (mh > headH * 0.06) {
        const teethY = my - mh * 0.75;
        const teethH = mh * 0.22;
        ctx.beginPath();
        ctx.rect(-mw * 0.75, teethY, mw * 1.5, teethH);
        ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
        ctx.fill();
        // Tooth separators
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 0.6;
        for (let tk = -2; tk <= 2; tk++) {
          ctx.beginPath();
          ctx.moveTo(tk * mw * 0.22, teethY);
          ctx.lineTo(tk * mw * 0.22, teethY + teethH);
          ctx.stroke();
        }
      }

      // Bottom teeth (when wide open)
      if (openAmt > 0.45) {
        const btY = my + mh * 0.55;
        const btH = mh * 0.18;
        ctx.beginPath();
        ctx.rect(-mw * 0.65, btY, mw * 1.3, btH);
        ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
        ctx.fill();
      }

      ctx.restore();

      // Upper lip (full, with cupid's bow)
      ctx.beginPath();
      ctx.moveTo(-mw - 1, my);
      ctx.bezierCurveTo(-mw * 0.6, my - mh * 0.4, -mw * 0.25, my - mh * 0.15, -mw * 0.08, my - mh * 0.05);
      ctx.quadraticCurveTo(0, my + mh * 0.02, mw * 0.08, my - mh * 0.05);
      ctx.bezierCurveTo(mw * 0.25, my - mh * 0.15, mw * 0.6, my - mh * 0.4, mw + 1, my);
      ctx.lineTo(mw, my - 1);
      ctx.bezierCurveTo(mw * 0.5, my - mh * 0.35, -mw * 0.5, my - mh * 0.35, -mw, my - 1);
      ctx.closePath();
      const ulg = ctx.createLinearGradient(0, my - mh * 0.4, 0, my);
      ulg.addColorStop(0, '#be185d');
      ulg.addColorStop(1, '#831843');
      ctx.fillStyle = ulg;
      ctx.fill();

      // Lower lip (pouty)
      ctx.beginPath();
      ctx.moveTo(-mw, my);
      ctx.quadraticCurveTo(0, my + mh * 1.15, mw, my);
      ctx.lineTo(mw - 1, my + 1);
      ctx.quadraticCurveTo(0, my + mh * 0.95, -mw + 1, my + 1);
      ctx.closePath();
      const llg = ctx.createLinearGradient(0, my, 0, my + mh * 1.1);
      llg.addColorStop(0, '#ec4899');
      llg.addColorStop(1, '#9f1239');
      ctx.fillStyle = llg;
      ctx.fill();

      // Lip highlight
      ctx.beginPath();
      ctx.moveTo(-mw * 0.5, my + mh * 0.75);
      ctx.quadraticCurveTo(0, my + mh * 0.95, mw * 0.5, my + mh * 0.75);
      ctx.strokeStyle = 'rgba(253, 164, 175, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      // Closed mouth — natural lip shape with smile
      const lipH = headH * 0.04 + s.smile * headH * 0.02;

      // Upper lip
      ctx.beginPath();
      ctx.moveTo(-mw, my);
      ctx.bezierCurveTo(-mw * 0.55, my - lipH * 1.2, -mw * 0.22, my - lipH * 0.2, -mw * 0.06, my + lipH * 0.08);
      ctx.quadraticCurveTo(0, my + s.smile * headH * 0.04, mw * 0.06, my + lipH * 0.08);
      ctx.bezierCurveTo(mw * 0.22, my - lipH * 0.2, mw * 0.55, my - lipH * 1.2, mw, my);
      ctx.lineTo(mw - 1, my + 2);
      ctx.quadraticCurveTo(0, my - lipH * 0.4 + s.smile * headH * 0.08, -mw + 1, my + 2);
      ctx.closePath();
      const ulg2 = ctx.createLinearGradient(0, my - lipH, 0, my + lipH);
      ulg2.addColorStop(0, '#9f1239');
      ulg2.addColorStop(1, '#6b0f2a');
      ctx.fillStyle = ulg2;
      ctx.fill();

      // Lower lip — a hair below
      ctx.beginPath();
      ctx.moveTo(-mw + 2, my + 1);
      ctx.quadraticCurveTo(0, my + lipH * 1.3 + s.smile * headH * 0.06, mw - 2, my + 1);
      ctx.quadraticCurveTo(0, my + lipH * 0.5 + s.smile * headH * 0.04, -mw + 2, my + 1);
      ctx.closePath();
      const llg2 = ctx.createLinearGradient(0, my, 0, my + lipH * 1.3);
      llg2.addColorStop(0, '#ec4899');
      llg2.addColorStop(1, '#9f1239');
      ctx.fillStyle = llg2;
      ctx.fill();

      // Smile line
      if (s.smile > 0.1) {
        ctx.beginPath();
        ctx.moveTo(-mw * 0.9, my + s.smile * 1);
        ctx.quadraticCurveTo(0, my + s.smile * headH * 0.1, mw * 0.9, my + s.smile * 1);
        ctx.strokeStyle = 'rgba(76, 29, 149, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Lip highlight
      ctx.beginPath();
      ctx.moveTo(-mw * 0.45, my + lipH * 0.9);
      ctx.quadraticCurveTo(0, my + lipH * 1.15 + s.smile * headH * 0.04, mw * 0.45, my + lipH * 0.9);
      ctx.strokeStyle = 'rgba(253, 164, 175, 0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ─── Chin shadow ─────────────────────────────────────────
    ctx.beginPath();
    ctx.ellipse(0, headH * 0.65 + jawDrop * 0.5, headW * 0.3, headH * 0.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 7, 100, 0.25)';
    ctx.fill();

    // ─── AI Badge ────────────────────────────────────────────
    const bx = headW * 0.72;
    const by = headH * 0.55;
    const br = headW * 0.16;

    ctx.beginPath();
    ctx.arc(bx, by, br + 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(139, 92, 246, ${0.25 + s.glow * 0.35})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    const bg = ctx.createLinearGradient(bx - br, by - br, bx + br, by + br);
    bg.addColorStop(0, '#a78bfa');
    bg.addColorStop(1, '#4f46e5');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${br * 0.75}px -apple-system, BlinkMacSystemFont, sans-serif`;
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
