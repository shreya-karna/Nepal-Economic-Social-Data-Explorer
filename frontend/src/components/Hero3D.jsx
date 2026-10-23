import { useEffect, useRef } from "react";

/** Wireframe Himalayan terrain with perspective projection, drawn on canvas. */
export default function Hero3D() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, g = cv.getContext("2d");
    const NX = 46, NZ = 30, Hh = [];
    for (let i = 0; i < NX; i++) { Hh[i] = []; for (let j = 0; j < NZ; j++) {
      const x = (i / NX) * 2 - 1, z = j / NZ;
      const ridge = Math.exp(-Math.pow((z - 0.55 - 0.12 * Math.sin(x * 3)) * 3.2, 2)) * (1 + Math.sin(x * 7 + 1) * Math.sin(x * 3.3)) * 0.5 + 0.1;
      Hh[i][j] = ridge * (0.5 + 0.5 * Math.abs(Math.sin(x * 9 + z * 4))) * 1.6;
    } }
    let w, h, mx = 0, t = 0, raf;
    const size = () => { const d = devicePixelRatio || 1; w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); };
    const P = (i, j, a) => {
      const x = (i / (NX - 1) - 0.5) * 3.4, z = (j / (NZ - 1) - 0.5) * 2.2, y = -Hh[i][j] * 0.9;
      const c = Math.cos(a), s = Math.sin(a), rx = x * c - z * s, rz = x * s + z * c, tl = 0.55;
      const y2 = y * Math.cos(tl) - rz * Math.sin(tl), z2 = y * Math.sin(tl) + rz * Math.cos(tl) + 3.6;
      const f = (Math.min(w, h * 1.5) * 0.95) / z2;
      return [w * 0.64 + rx * f, h * 0.62 + y2 * f];
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = () => {
      const col = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim();
      const a = 0.5 + t * 0.12 + mx * 0.4; t += 0.016;
      g.clearRect(0, 0, w, h); g.strokeStyle = col; g.lineWidth = 1;
      for (let j = 0; j < NZ; j++) { g.beginPath(); g.globalAlpha = 0.18 + (0.5 * j) / NZ;
        for (let i = 0; i < NX; i++) { const p = P(i, j, a); i ? g.lineTo(...p) : g.moveTo(...p); } g.stroke(); }
      for (let i = 0; i < NX; i += 2) { g.beginPath(); g.globalAlpha = 0.25;
        for (let j = 0; j < NZ; j++) { const p = P(i, j, a); j ? g.lineTo(...p) : g.moveTo(...p); } g.stroke(); }
      g.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    const move = (e) => { mx = e.clientX / innerWidth - 0.5; };
    size(); frame();
    addEventListener("resize", size); addEventListener("mousemove", move);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("mousemove", move); };
  }, []);
  return <canvas ref={ref} className="cv" aria-hidden="true" />;
}
