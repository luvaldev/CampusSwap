# Impeccable Skill Breakdown

This document provides a structured summary and quick-reference guide for the **Impeccable** skill, which is designed to help craft and audit premium, production-grade frontend interfaces.

---

## 🚀 Setup & Initialization
Every session starts by running the project context gathering:
```bash
node .gemini/skills/impeccable/scripts/context.mjs
```
* **Required Files:** This script looks for `PRODUCT.md` (and `DESIGN.md`). If missing, follow `reference/init.md` to initialize.
* **Palette Generation:** For greenfield projects without existing colors, run:
  ```bash
  node .gemini/skills/impeccable/scripts/palette.mjs
  ```
  *(Always use **OKLCH** for color declarations).*

---

## 🎨 Core Design Guidance

### 1. Color & Contrast
* **WCAG AA Compliance:** Body text contrast must be **≥ 4.5:1** against the background. Large text (≥ 18px or bold ≥ 14px) must be **≥ 3:1**.
* **Anti-Gray Washout:** Do not use pure gray text on colored backgrounds. Use transparency or a darker shade of the background's own hue.
* **Theme Consistency:** Stick to **one theme (light, dark, or auto)** for the entire page. Section inverting (e.g., a light section in a dark-themed page) is prohibited unless it's a deliberate "Color Block Story".

### 2. Typography
* **Line Length:** Cap body paragraphs at **65–75ch** for readability.
* **Pairings:** Do not pair two similar sans-serifs or two similar serifs. Use a contrast axis (e.g., serif + sans, geometric + humanist) or weights in the same family.
* **Display Font Scale:** Display/Hero headings: `clamp()` max size must be **≤ 6rem (96px)**. Letter-spacing minimum: **≥ -0.04em**. Use `text-wrap: balance` on headers `h1`–`h3`.
* **Serif Discipline:** Serif is discouraged as a default. Never default to `Fraunces` or `Instrument_Serif` unless explicitly required by the brand. If using italics with descenders (`y, g, j, p, q`), ensure `leading-[1.1]` minimum + padding reserve to prevent clipping.

### 3. Layout & Structure
* **Flex vs. Grid:** Use Flexbox for 1D layouts and Grid for 2D. Avoid complex percentage-based flex layouts; use CSS Grid (e.g., `grid grid-cols-1 md:grid-cols-3 gap-6`).
* **Viewport Stability:** Never use `h-screen` for hero sections (it causes mobile layout jumps). Use `min-h-[100dvh]` instead.
* **Rhythm & Spacing:** Avoid nesting cards or using cards as lazy layouts.

---

## 🚫 Absolute Bans (Refuse & Rewrite)
If you are about to implement any of the following, rewrite it with a different layout or styling:

1. **Side-Stripe Borders:** Thick left/right borders used as accent lines on cards or callouts are banned.
2. **Gradient Text:** Text utilizing `background-clip: text` combined with a gradient background is banned. Use solid colors.
3. **Glassmorphism as Default:** Transparent frosted blurs are restricted to deliberate premium overlays, never as a general container style.
4. **Hero-Metric Template:** The "Big number + small label + gradient accent" layout (SaaS cliché) is banned.
5. **Identical Card Grids:** Endlessly repeating cards with exactly the same "icon + title + text" structure.
6. **Tiny Uppercase Tracked Eyebrows:** Small all-caps uppercase eyebrows (`uppercase tracking-[0.18em]`) above *every* section header are banned. Max 1 eyebrow per 3 sections.
7. **Numbered Section Markers (`01 / 02 / 03`):** Sequence numbers as default section header tags.
8. **Banned Copy Elements:** Avoid version numbers (`v1.4.2`), decorative scroll cues (`Scroll to explore`), or meaningless text strips at the bottom of the hero.

---

## 🎬 Motion & Animations
* **Motivation:** Every animation must be justifiable in one sentence (communicates hierarchy, storytelling, feedback, or state transition). No animation for show.
* **No Image Hover Animations:** Never animate `<img>` elements or their scales/rotations/translations on parent hovers. This is a common AI tell.
* **Scroll-Driven Animation:** Do not use `window.addEventListener("scroll", ...)` or track scroll progress in React state (causes major lag). Use Framer Motion's `useScroll()` or GSAP `ScrollTrigger`.
* **Reduced Motion:** If `MOTION_INTENSITY > 3`, you MUST honor `prefers-reduced-motion` and collapse the movement to static or instant transitions.

### Canonical GSAP Skeletons

#### A. Sticky-Stack
```tsx
ScrollTrigger.create({
  trigger: card,
  start: "top top", // Pin at top of viewport
  pin: true,
  pinSpacing: false
});
```

#### B. Horizontal-Pan
```tsx
gsap.to(track, {
  x: -distance,
  scrollTrigger: {
    trigger: wrap,
    start: "top top",
    end: () => `+=${distance}`,
    pin: true,
    scrub: 1
  }
});
```

---

## 🏁 Final Pre-Flight Checklist
Always review this list before delivering code:
* [ ] **Brief inference** explicitly declared at the top.
* [ ] **Zero em-dashes (`—`)** anywhere on the page (use hyphens, commas, or parentheses instead).
* [ ] **Page Theme Lock** and **Color Consistency Lock** active.
* [ ] **Button & Form Contrast Check** meets WCAG AA (4.5:1 min).
* [ ] **CTA Button Wrap** check: no desktop CTA label wraps to 2+ lines.
* [ ] **No Duplicate CTA Intent** (e.g., having both "Get in touch" and "Let's talk" on the same page).
* [ ] **Hero viewport fit**: headline ≤ 2 lines, subtext ≤ 20 words, CTA visible without scrolling.
* [ ] **Bento Background Diversity**: at least 2-3 cells have actual visual variations.
* [ ] **Used by / Trusted by logo wall**: logo-only, no sub-labels, placed *under* the hero, using SVG marks (no text wordmarks).
