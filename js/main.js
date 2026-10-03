/* =========================================================
   Ayush Srivastava — Portfolio interactions
   Vanilla JS, no dependencies. Everything degrades gracefully.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isSmall = () => window.innerWidth <= 760;

  /* ---------------------------------------------------------
     1. Custom 3D cursor (desktop only)
     --------------------------------------------------------- */
  function initCursor() {
    if (isCoarse || prefersReduced) return;

    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        document.body.classList.add("cursor-ready");
        ringX = mouseX;
        ringY = mouseY;
      }
      dot.style.transform = `translate3d(${mouseX - 3.5}px, ${mouseY - 3.5}px, 0)`;
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      visible = false;
      document.body.classList.remove("cursor-ready");
    });

    (function loop() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      const half = ring.offsetWidth / 2;
      ring.style.transform = `translate3d(${ringX - half}px, ${ringY - half}px, 0)`;
      requestAnimationFrame(loop);
    })();

    // Expand ring + tone color on interactive elements
    const toneClass = ["cursor-yellow", "cursor-red"];
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("a, button, summary, [data-cursor]");
      if (!target) return;
      document.body.classList.add("cursor-hover");
      toneClass.forEach((c) => document.body.classList.remove(c));
      const tone = target.dataset.tone || target.closest("[data-tone]")?.dataset.tone;
      if (tone === "yellow") document.body.classList.add("cursor-yellow");
      if (tone === "red") document.body.classList.add("cursor-red");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, summary, [data-cursor]")) {
        document.body.classList.remove("cursor-hover", "cursor-yellow", "cursor-red");
      }
    });
  }

  /* ---------------------------------------------------------
     2. Magnetic buttons
     --------------------------------------------------------- */
  function initMagnetic() {
    if (isCoarse || prefersReduced) return;

    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px) scale(1.05)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     3. Navigation: shrink, mobile toggle, active section
     --------------------------------------------------------- */
  function initNav() {
    const wrap = document.getElementById("navWrap");
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    const links = Array.from(document.querySelectorAll(".nav-link"));

    const onScroll = () => {
      wrap.classList.toggle("is-scrolled", window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mobile menu
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        menu.classList.toggle("is-open", !open);
      });

      menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          toggle.setAttribute("aria-expanded", "false");
          menu.classList.remove("is-open");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
          toggle.setAttribute("aria-expanded", "false");
          menu.classList.remove("is-open");
          toggle.focus();
        }
      });
    }

    // Active section highlight
    const sections = links
      .map((l) => document.querySelector(l.getAttribute("href")))
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = "#" + entry.target.id;
            links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((s) => spy.observe(s));
    }
  }

  /* ---------------------------------------------------------
     4. Scroll reveal + animated timelines
     --------------------------------------------------------- */
  function initReveal() {
    const revealEls = document.querySelectorAll("[data-reveal]");
    const timeline = document.getElementById("timeline");
    const roadmap = document.querySelector(".roadmap");

    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      timeline && timeline.classList.add("is-drawn");
      roadmap && roadmap.classList.add("is-drawn");
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          if (entry.target === timeline) entry.target.classList.add("is-drawn");
          if (entry.target === roadmap) entry.target.classList.add("is-drawn");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
    timeline && io.observe(timeline);
    roadmap && io.observe(roadmap);
  }

  /* ---------------------------------------------------------
     5. Hero photo parallax + floating chip depth
     --------------------------------------------------------- */
  function initHeroDepth() {
    if (isCoarse || prefersReduced) return;

    const stage = document.getElementById("photoStage");
    const frame = document.getElementById("photoFrame");
    const chips = document.querySelectorAll(".float-chip");
    if (!stage || !frame) return;

    const visual = stage.closest(".hero__visual");
    if (!visual) return;

    visual.addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      frame.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 14}deg) translateZ(24px)`;

      chips.forEach((chip) => {
        const depth = parseFloat(chip.dataset.depth || "20");
        chip.style.transform = `translate3d(${px * depth}px, ${py * depth}px, 0)`;
      });
    });

    visual.addEventListener("mouseleave", () => {
      frame.style.transform = "";
      chips.forEach((chip) => (chip.style.transform = ""));
    });

    // Subtle pointer-driven tilt for all .tilt cards
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        if (isSmall()) return;
        card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 9}deg) rotateX(${(0.5 - py) * 9}deg) translateY(-5px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     6. Skills galaxy: node layout, links, hover info
     --------------------------------------------------------- */
  function initGalaxy() {
    const galaxy = document.getElementById("galaxy");
    const canvas = document.getElementById("galaxyCanvas");
    const nodesWrap = document.getElementById("galaxyNodes");
    if (!galaxy || !canvas || !nodesWrap) return;

    const nodes = Array.from(nodesWrap.querySelectorAll(".gnode"));
    const cats = Array.from(nodesWrap.querySelectorAll(".galaxy-cat"));
    const infoCat = document.getElementById("galaxyInfoCat");
    const infoTitle = document.getElementById("galaxyInfoTitle");
    const infoText = document.getElementById("galaxyInfoText");

    const tones = {
      green: "57, 255, 136",
      yellow: "250, 204, 21",
      red: "255, 77, 77",
      white: "229, 231, 235"
    };

    let positions = [];
    let links = [];
    let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let activeNode = null;
    let rafId = null;

    // Position nodes in elliptical clusters per category
    function layout() {
      const w = galaxy.clientWidth;
      const h = galaxy.clientHeight;

      const groups = new Map();
      nodes.forEach((n) => {
        const cat = n.dataset.cat;
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat).push(n);
      });

      const centers = [
        { x: 0.24, y: 0.3 },
        { x: 0.56, y: 0.22 },
        { x: 0.79, y: 0.44 },
        { x: 0.34, y: 0.68 },
        { x: 0.64, y: 0.68 }
      ];

      const meta = [];
      let ci = 0;
      groups.forEach((list, cat) => {
        const center = centers[ci % centers.length];
        ci++;
        const radiusX = Math.min(w, 900) * 0.13;
        const radiusY = Math.min(h, 560) * 0.13;

        list.forEach((node, i) => {
          const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2;
          const x = center.x * w + Math.cos(angle) * radiusX;
          const y = center.y * h + Math.sin(angle) * radiusY;
          node.style.left = x + "px";
          node.style.top = y + "px";
          meta.push({ el: node, x, y, tone: node.dataset.tone });
        });

        const label = cats.find((c) => c.dataset.cat === cat);
        if (label) {
          label.style.left = center.x * w + "px";
          label.style.top = center.y * h - (Math.min(h, 560) * 0.13 + 34) + "px";
        }
      });

      positions = meta;

      // Ring links inside each category + a few cross links
      links = [];
      const byCat = new Map();
      positions.forEach((p) => {
        const cat = p.el.dataset.cat;
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat).push(p);
      });
      byCat.forEach((list) => {
        for (let i = 0; i < list.length; i++) {
          links.push([list[i], list[(i + 1) % list.length]]);
        }
        if (list.length > 2) links.push([list[0], list[2]]);
      });
      for (let i = 0; i < positions.length - 4; i += 5) {
        links.push([positions[i], positions[i + 4]]);
      }
    }

    function setInfo(node) {
      if (!infoCat || !infoTitle || !infoText) return;
      if (!node) {
        infoCat.textContent = "Technology";
        infoTitle.textContent = "Hover a node";
        infoText.textContent = "Move over any floating technology node to see its details here.";
        return;
      }
      infoCat.textContent = node.dataset.cat || "Technology";
      infoTitle.textContent = node.textContent.trim();
      infoText.textContent = node.dataset.info || "";
    }

    function bindNode(node) {
      const activate = () => {
        nodes.forEach((n) => n.classList.toggle("is-active", n === node));
        activeNode = node;
        setInfo(node);
      };
      const deactivate = () => {
        // keep selection if focus stays within galaxy
      };
      node.addEventListener("mouseenter", activate);
      node.addEventListener("focus", activate);
      node.addEventListener("click", (e) => {
        e.preventDefault();
        activate();
      });
      node.addEventListener("mouseleave", deactivate);
    }
    nodes.forEach(bindNode);

    const ctx = canvas.getContext("2d");
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = galaxy.clientWidth * dpr;
      canvas.height = galaxy.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(singleFrame) {
      const w = galaxy.clientWidth;
      const h = galaxy.clientHeight;
      ctx.clearRect(0, 0, w, h);

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      const ox = mouse.x * 14;
      const oy = mouse.y * 10;

      // Connection lines
      links.forEach(([a, b]) => {
        const ax = a.x + ox, ay = a.y + oy;
        const bx = b.x + ox, by = b.y + oy;
        const isActive = activeNode && (a.el === activeNode || b.el === activeNode);
        const tone = tones[a.el.dataset.tone] || tones.white;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(${tone}, ${isActive ? 0.55 : 0.14})`;
        ctx.lineWidth = isActive ? 1.6 : 1;
        ctx.stroke();
      });

      // Soft glow points on nodes
      positions.forEach((p) => {
        const x = p.x + ox;
        const y = p.y + oy;
        const tone = tones[p.tone] || tones.white;
        const active = p.el === activeNode;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, active ? 34 : 20);
        grad.addColorStop(0, `rgba(${tone}, ${active ? 0.5 : 0.24})`);
        grad.addColorStop(1, `rgba(${tone}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, active ? 34 : 20, 0, Math.PI * 2);
        ctx.fill();

        // Offset chip positions so DOM chips follow the same parallax
        p.el.style.left = x + "px";
        p.el.style.top = y + "px";
      });

      if (!singleFrame) rafId = requestAnimationFrame(() => draw(false));
    }

    function drawOnce() {
      draw(true);
    }

    function start() {
      if (isSmall()) return;
      layout();
      resizeCanvas();
      if (prefersReduced) {
        // Static single frame — no animation loop for reduced-motion users.
        drawOnce();
        return;
      }
      if (!rafId) rafId = requestAnimationFrame(() => draw(false));
    }

    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    if (!prefersReduced) {
      galaxy.addEventListener("mousemove", (e) => {
        const r = galaxy.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width - 0.5;
        mouse.ty = (e.clientY - r.top) / r.height - 0.5;
      });
      galaxy.addEventListener("mouseleave", () => {
        mouse.tx = 0;
        mouse.ty = 0;
        nodes.forEach((n) => n.classList.remove("is-active"));
        activeNode = null;
        setInfo(null);
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isSmall()) {
          stop();
          // Reset inline positions so the mobile chip layout takes over
          nodes.forEach((n) => { n.style.left = ""; n.style.top = ""; });
          cats.forEach((c) => { c.style.left = ""; c.style.top = ""; });
          ctx && ctx.clearRect(0, 0, galaxy.clientWidth, galaxy.clientHeight);
        } else {
          start();
        }
      }, 180);
    });

    // Pause rendering when off-screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
      }, { threshold: 0.05 }).observe(galaxy);
    } else {
      start();
    }
  }

  /* ---------------------------------------------------------
     7. Project modal (expand -> blur -> content -> close)
     --------------------------------------------------------- */
  function initModal() {
    const modal = document.getElementById("projectModal");
    if (!modal) return;

    const img = document.getElementById("modalImg");
    const title = document.getElementById("modalTitle");
    const desc = document.getElementById("modalDesc");
    const tags = document.getElementById("modalTags");
    const features = document.getElementById("modalFeatures");
    const github = document.getElementById("modalGithub");
    const panel = modal.querySelector(".modal__panel");

    let lastFocused = null;

    function openModal(card) {
      lastFocused = document.activeElement;

      title.textContent = card.dataset.title || "Project";
      desc.textContent = card.dataset.desc || "";
      img.src = card.dataset.img || "assets/project-placeholder.svg";
      img.alt = "Preview of " + (card.dataset.title || "project");

      tags.innerHTML = "";
      (card.dataset.tags || "").split("|").filter(Boolean).forEach((t) => {
        const li = document.createElement("li");
        li.className = "tag";
        li.textContent = t.trim();
        tags.appendChild(li);
      });

      features.innerHTML = "";
      (card.dataset.features || "").split("|").filter(Boolean).forEach((f) => {
        const li = document.createElement("li");
        li.textContent = f.trim();
        features.appendChild(li);
      });

      const repoLink = card.querySelector('a[href*="github.com"]');
      github.href = repoLink ? repoLink.href : "https://github.com/ayushsrivastava86984-ux";

      modal.hidden = false;
      document.body.style.overflow = "hidden";
      modal.querySelector(".modal__close").focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll("[data-open-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".project-card");
        if (card) openModal(card);
      });
    });

    // Whole card opens the modal (except inner links/buttons)
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("a, button")) return;
        openModal(card);
      });
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Open details for " + (card.dataset.title || "project"));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    modal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") closeModal();

      // Minimal focus trap
      if (e.key === "Tab") {
        const focusables = panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------------------------------------------------------
     8. Contact hub: central object reacts to cursor
     --------------------------------------------------------- */
  function initHub() {
    if (isCoarse || prefersReduced) return;
    const hub = document.getElementById("contactHub");
    const core = document.getElementById("hubCore");
    if (!hub || !core) return;

    hub.addEventListener("mousemove", (e) => {
      const r = hub.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      core.style.transform = `translate(${px * 34}px, ${py * 26}px) rotateY(${px * 22}deg) rotateX(${-py * 22}deg)`;
    });
    hub.addEventListener("mouseleave", () => {
      core.style.transform = "";
    });
  }

  /* ---------------------------------------------------------
     9. Placeholder links + toast (content you still need to add)
     --------------------------------------------------------- */
  function initPlaceholders() {
    const toast = document.getElementById("toast");
    let timer;

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("is-showing");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("is-showing"), 4200);
    }

    document.querySelectorAll(".placeholder-link").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(el.dataset.note || "This link is a placeholder — add your real URL in index.html.");
      });
    });

    // If the resume PDF hasn't been added yet, tell the user instead of 404-ing.
    document.querySelectorAll("[data-resume-link]").forEach((link) => {
      const url = link.getAttribute("href");
      if (!url) return;
      fetch(url, { method: "HEAD" })
        .then((res) => {
          if (res.ok) return;
          const note = "Resume not found. Add your PDF at " + url + " (see README.md).";
          link.classList.add("placeholder-link");
          link.dataset.note = note;
          // Registering after the fact: attach the notice handler too.
          link.addEventListener("click", (e) => {
            e.preventDefault();
            showToast(note);
          });
        })
        .catch(() => {
          /* offline or file protocol — leave the link as-is */
        });
    });

    // If the real photo hasn't been added, point people at the README.
    const photo = document.getElementById("heroPhoto");
    if (photo) {
      photo.addEventListener("error", function onErr() {
        photo.removeEventListener("error", onErr);
        photo.dataset.note = "Add your real photo at assets/ayush.jpg (see README.md).";
        photo.closest(".photo-frame")?.classList.add("is-placeholder");
      });
    }
  }

  /* ---------------------------------------------------------
     10. Hero entrance sequence
     --------------------------------------------------------- */
  function initEntrance() {
    if (prefersReduced) return;
    const pieces = document.querySelectorAll(".hero__content > *, .hero__visual");
    pieces.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(26px)";
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.transition = "opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)";
          el.style.opacity = "";
          el.style.transform = "";
        }, 90 * i);
      });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function boot() {
    initCursor();
    initMagnetic();
    initNav();
    initReveal();
    initEntrance();
    initHeroDepth();
    initGalaxy();
    initModal();
    initHub();
    initPlaceholders();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
