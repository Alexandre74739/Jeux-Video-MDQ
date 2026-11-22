/** Lance 160 confettis depuis les deux bords de l'écran. Renvoie la fonction qui arrête l'animation. */
export function confettiBurst(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = window.innerHeight);
  const colors = [
    "#FFD23F",
    "#3DDC97",
    "#4FC3F7",
    "#FF6B57",
    "#FF8FC7",
    "#5B3DF5",
    "#FFA94D",
  ];
  const parts = Array.from({ length: 160 }, (_, i) => {
    const left = i % 2 === 0;
    return {
      x: left ? 0 : W,
      y: H * 0.7,
      vx: (left ? 1 : -1) * (6 + Math.random() * 10),
      vy: -(12 + Math.random() * 12),
      s: 8 + Math.random() * 8,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[i % colors.length],
      shape: i % 3,
    };
  });
  let raf = 0;
  let t = 0;
  const loop = () => {
    t++;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.38;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.strokeStyle = "#16123A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (p.shape === 0) ctx.rect(-p.s / 2, -p.s / 3, p.s, p.s / 1.5);
      else if (p.shape === 1) ctx.arc(0, 0, p.s / 2.2, 0, Math.PI * 2);
      else {
        ctx.moveTo(0, -p.s / 1.6);
        ctx.lineTo(p.s / 1.8, p.s / 2.5);
        ctx.lineTo(-p.s / 1.8, p.s / 2.5);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (t < 200) raf = requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, W, H);
  };
  loop();
  return () => cancelAnimationFrame(raf);
}
