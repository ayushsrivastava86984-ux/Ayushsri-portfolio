<<<<<<< HEAD
# Ayush Srivastava — Premium 3D Portfolio

A production-ready, fully responsive, dependency-free portfolio site.
Pure HTML + CSS + vanilla JavaScript, with a WebGL (three.js) background that
automatically falls back to a canvas particle field (and finally to the CSS
background) if WebGL is unavailable.

## Run it

Any static server works:

```bash
python3 -m http.server 5000
# then open http://localhost:5000
```

(Opening `index.html` directly with `file://` also works, but a local server is
recommended so the resume/photo checks behave normally.)

No build step, no npm install.

## Files

```
index.html          — all content (edit this to change text)
css/style.css       — design system, layout, animations
js/main.js          — cursor, nav, reveals, galaxy, modal, toasts
js/scene.js         — WebGL 3D background + canvas fallback
assets/             — your photo, resume, project images
```

## Add your personal content

Nothing has been invented for you — every placeholder is marked.

1. **Photo** — put your real photo at `assets/ayush.jpg` (or `assets/ayush.png` —
   both are detected automatically). Portrait orientation works best. Until it
   exists, an initials placeholder is shown automatically.

2. **Resume** — put your PDF at `assets/ayush-srivastava-resume.pdf`
   (exact path). If it's missing, the resume buttons show a helpful notice
   instead of a 404.

3. **Email & LinkedIn** — search `index.html` for `TODO: add your email` and
   `TODO: add your LinkedIn` and replace the placeholder anchors with real
   `mailto:` / LinkedIn URLs.

4. **Skills** — in `index.html`, inside `#galaxyNodes`, rename each
   `Skill 1…13` node to a technology you actually use (and fix the
   `data-info` description). Remove nodes you don't need.

5. **Projects** — each `.project-card` carries its own data:
   `data-title`, `data-desc`, `data-tags` (pipe-separated),
   `data-features` (pipe-separated). Point the GitHub button at the real
   repo URL, and swap `assets/project-placeholder.svg` for a real screenshot
   via `data-img` and the `<img src>`.

6. **Featured project** — edit the `.featured` block in `index.html` and add
   your real Live Demo URL where marked.

7. **Education** — replace `[ Institute / University name ]` etc. with your
   real details.

## Verified

- All navigation links and section anchors work
- Mobile (320px+), tablet, laptop and large desktop layouts
- Custom cursor disabled automatically on touch devices
- `prefers-reduced-motion` disables heavy animation
- WebGL fallback (canvas 2D → pure CSS) with no console errors
- Keyboard navigation: skip link, visible focus states, modal focus trap
- No horizontal scrolling

Built with curiosity, code and continuous learning.
=======
# Ayushsri-portfolio
A modern personal portfolio showcasing my software development projects, technical skills, achievements, and journey as an aspiring Software Engineer.
>>>>>>> 5711618dbd5f0132b8a6ae5be724693d16c13c09
