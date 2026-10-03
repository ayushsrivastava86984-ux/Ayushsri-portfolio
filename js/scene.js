/* =========================================================
   Ayush Srivastava — Cinematic 3D background
   WebGL (three.js) when available, canvas-2D particle field
   as an automatic fallback. Never throws, never blocks.
   ========================================================= */

const canvas = document.getElementById("bg-canvas");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isSmall = () => window.innerWidth <= 760;

const TONE = {
  green: 0x22c55e,
  neon: 0x39ff88,
  yellow: 0xfacc15,
  red: 0xef4444,
  white: 0xe5e7eb,
};

/* ---------------------------------------------------------
   WebGL scene: particles + wireframe geometry + grid floor
   --------------------------------------------------------- */
async function initWebGL() {
  if (!canvas || prefersReduced) throw new Error("webgl skipped");

  const THREE = await import("https://unpkg.com/three@0.161.0/build/three.module.js");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isSmall(),
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 22);

  /* --- particle field --- */
  const COUNT = isSmall() ? 380 : 1300;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color(TONE.neon),
    new THREE.Color(TONE.yellow),
    new THREE.Color(TONE.red),
    new THREE.Color(TONE.white),
  ];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 42;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 44;

    const c = palette[Math.random() < 0.62 ? 3 : Math.floor(Math.random() * 3)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* --- floating wireframe objects --- */
  const floaters = [];

  function wire(geo, color, pos, opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.userData.speed = 0.0016 + Math.random() * 0.002;
    mesh.userData.floatAmp = 0.6 + Math.random() * 0.7;
    mesh.userData.baseY = pos[1];
    scene.add(mesh);
    floaters.push(mesh);
    return mesh;
  }

  if (!isSmall()) {
    wire(new THREE.IcosahedronGeometry(3.1, 1), TONE.green, [-15, 5.5, -8], 0.4);
    wire(new THREE.TorusGeometry(3.4, 0.42, 12, 42), TONE.yellow, [16, -6.5, -10], 0.34);
    wire(new THREE.OctahedronGeometry(2.4, 0), TONE.red, [14, 7.5, -14], 0.3);
    wire(new THREE.TorusKnotGeometry(1.7, 0.3, 70, 9), TONE.neon, [-17, -7.5, -12], 0.24);
  } else {
    wire(new THREE.IcosahedronGeometry(2.6, 1), TONE.green, [-9, 5, -12], 0.3);
    wire(new THREE.TorusGeometry(2.6, 0.35, 10, 34), TONE.yellow, [10, -6, -14], 0.26);
  }

  /* --- subtle grid floor --- */
  const grid = new THREE.GridHelper(120, 42, TONE.green, 0x1f2937);
  grid.position.y = -13;
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  scene.add(grid);

  /* --- pointer-driven camera parallax --- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!isCoarse) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  /* --- pause when tab hidden --- */
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) tick();
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let scrollY = window.scrollY;
  window.addEventListener("scroll", () => (scrollY = window.scrollY), { passive: true });

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);

    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    // Smooth camera drift (mouse + gentle scroll response)
    camera.position.x += (pointer.x * 3.2 - camera.position.x) * 0.06;
    camera.position.y += (-pointer.y * 2.1 + scrollY * 0.0022 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    points.rotation.y = t * 0.016;
    points.rotation.x = Math.sin(t * 0.08) * 0.05;

    floaters.forEach((m, i) => {
      m.rotation.x += m.userData.speed;
      m.rotation.y += m.userData.speed * 1.35;
      m.position.y = m.userData.baseY + Math.sin(t * 0.5 + i) * m.userData.floatAmp;
    });

    grid.position.z = (t * 0.7) % 3;

    renderer.render(scene, camera);
  }
  tick();
}

/* ---------------------------------------------------------
   Fallback: lightweight 2D particle + line field
   --------------------------------------------------------- */
function initFallback() {
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let raf = null;
  let running = true;

  const COLORS = ["#39ff88", "#facc15", "#ff4d4d", "#e5e7eb"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(110, Math.round((w * h) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.7 + 0.6,
      c: COLORS[Math.random() < 0.65 ? 3 : Math.floor(Math.random() * 3)],
      a: Math.random() * 0.5 + 0.25,
    }));
  }

  function draw() {
    if (!running) return;
    raf = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
      ctx.globalAlpha = 1;

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 13000) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - d2 / 13000) * 0.14})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) draw();
    else if (raf) cancelAnimationFrame(raf);
  });
  draw();
}

/* ---------------------------------------------------------
   Boot: try WebGL, fall back silently to canvas 2D
   --------------------------------------------------------- */
initWebGL().catch(() => {
  try {
    initFallback();
  } catch (err) {
    // WebGL unavailable and canvas blocked — CSS background still renders.
  }
});
