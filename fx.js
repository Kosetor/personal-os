/* FX: бут-заставка, three.js фон (грид + частицы).
   Требует: vendor/three.min.js (глобальный THREE). */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- бут-заставка ---------- */
  function initBoot() {
    const boot = document.getElementById("bootScreen");
    if (!boot) return;
    let skip = false;
    try { skip = sessionStorage.getItem("pos-booted") === "1"; } catch (e) { /* приватный режим */ }
    if (skip || reduceMotion) { boot.remove(); return; }
    const done = () => {
      try { sessionStorage.setItem("pos-booted", "1"); } catch (e) {}
      boot.classList.add("boot-done");
      setTimeout(() => boot.remove(), 600);
    };
    boot.addEventListener("animationend", (e) => {
      if (e.animationName === "boot-lines-in") setTimeout(done, 500);
    });
    setTimeout(done, 3800); // страховка
  }

  /* ---------- темы: читаем цвета из CSS-переменных ---------- */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function hexVar(name, fallback) {
    const m = cssVar(name).match(/#([0-9a-f]{6})/i);
    return m ? parseInt(m[1], 16) : fallback;
  }

  let renderer = null;
  let scene, camera, grid, particles;
  let rafId = 0;
  const mouse = { x: 0, y: 0 };

  function makeGrid(size, divs, color) {
    const pts = [];
    const half = size / 2, step = size / divs;
    for (let i = 0; i <= divs; i++) {
      const x = -half + i * step;
      pts.push(x, 0, -half, x, 0, half);
      pts.push(-half, 0, x, half, 0, x);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 }));
  }

  function init3d() {
    const wrap = document.getElementById("bg3d");
    if (!wrap) return;
    if (!window.THREE) {
      document.body.classList.add("no-webgl");
      console.info("[fx] THREE не загружен — CSS-фолбэк");
      return;
    }
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch (e) {
      document.body.classList.add("no-webgl");
      console.info("[fx] WebGL недоступен — CSS-фолбэк:", e && e.message);
      return;
    }
    console.info("[fx] 3D инициализирован, THREE r" + (THREE.REVISION || "?"));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    wrap.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(hexVar("--bg-void", 0x0b0c0e), 16, 44);
    camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5.2, 11.5);
    camera.lookAt(0, 0, 0);

    grid = makeGrid(44, 30, hexVar("--cyan", 0x3de0ff));
    grid.position.y = -2.6;
    scene.add(grid);

    const N = 420;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = Math.random() * 12 - 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28 - 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: hexVar("--cyan", 0x3de0ff), size: 0.08, transparent: true, opacity: 0.65 })
    );
    scene.add(particles);

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    document.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopLoop(); else startLoop();
    });

    window.addEventListener("themechange", applyThemeColors);

    if (reduceMotion) renderMain();
    else startLoop();
  }

  function applyThemeColors() {
    if (!scene || !grid || !particles) return;
    scene.fog.color.setHex(hexVar("--bg-void", 0x0b0c0e));
    grid.material.color.setHex(hexVar("--cyan", 0x3de0ff));
    particles.material.color.setHex(hexVar("--cyan", 0x3de0ff));
  }

  function renderMain() {
    renderer.render(scene, camera);
  }

  function frame() {
    rafId = requestAnimationFrame(frame);
    const t = performance.now() / 1000;
    grid.rotation.z = t * 0.05;
    particles.rotation.y = t * 0.02;
    camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.03;
    camera.position.y += (5.2 + mouse.y * 0.8 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderMain();
  }

  function startLoop() { if (!rafId) rafId = requestAnimationFrame(frame); }
  function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

  function init() {
    initBoot();
    init3d();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
