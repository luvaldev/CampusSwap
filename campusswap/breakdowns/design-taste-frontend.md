# Design Taste Frontend Skill Breakdown

This document provides a structured summary and quick-reference guide for the **design-taste-frontend** skill, which establishes strict design guidelines to avoid templated AI-slop on landing pages, portfolios, and redesigns.

---

## 🎨 0. Brief Inference & "Design Read"
Before writing any code, always analyze the room and output a single-line **"Design Read"**:
> **"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."**

* **Signals to look for:** Page kind, vibe words, reference links/screenshots, target audience, existing brand assets, and quiet constraints (accessibility, regulation).
* **If ambiguous:** Ask exactly **one** clarifying question instead of guessing or listing many questions.
* **Anti-Default Discipline:** Avoid the generic "AI-purple gradient + centered hero + three feature cards + Inter + slate-900" configuration.

---

## 🎛️ 1. The Three Dials
Every design decision is controlled by three central configuration variables:

| Dial | Scale | Description | Baseline |
|---|---|---|---|
| `DESIGN_VARIANCE` | `1` to `10` | `1` = Perfect Symmetry, `10` = Artsy Chaos | **8** |
| `MOTION_INTENSITY` | `1` to `10` | `1` = Static, `10` = Cinematic / Physics | **6** |
| `VISUAL_DENSITY` | `1` to `10` | `1` = Art Gallery / Airy, `10` = Cockpit / Packed | **4** |

### Dial Inference Presets:
* **Landing (SaaS, mainstream):** `7 / 6 / 4`
* **Landing (Agency / creative):** `9 / 8 / 3`
* **Landing (Premium consumer):** `7 / 6 / 3`
* **Portfolio (Designer / studio):** `8 / 7 / 3`
* **Portfolio (Developer):** `6 / 5 / 4`
* **Editorial / Blog:** `6 / 4 / 3`
* **Public-sector service:** `3 / 2 / 5`

---

## 📦 2. Design System Map
Always match the project context to a real design system rather than hand-rolling CSS for standard systems:
* **Microsoft / Enterprise B2B:** `@fluentui/react-components`
* **Google / Material:** `@material/web` + Material 3 tokens
* **IBM / Data-dense:** `@carbon/react`
* **Shopify Admin App:** `polaris.js` or Polaris React
* **Atlassian / Jira-style:** `@atlaskit/*`
* **GitHub Style:** `@primer/css` or `@primer/react-brand`
* **UK / US Government:** `govuk-frontend` / `uswds`
* **Modern accessible React foundations:** `@radix-ui/themes`
* **shadcn/ui:** `npx shadcn@latest add ...` (never ship default styles untouched)
* **Tailwind Marketing/SaaS:** Tailwind v4 utilities

---

## 🛠️ 3. Default Stack & Architecture Conventions
* **Framework:** React or Next.js.
  * **RSC Safety:** Global state/providers must be isolated inside Client Components (`"use client"`).
  * **Interactivity Isolation:** Any component utilizing Motion, scroll listeners, or cursor physics must be an isolated leaf client component.
* **Styling:** Tailwind v4 (default). Avoid `tailwindcss` plugin in `postcss.config.js` under v4.
* **Animation:** Motion (formerly Framer Motion), imported from `motion/react`.
* **State Management:** Zustand, Jotai, or React Context for global state.
  * **Never** use React `useState` to track continuous inputs (mouse, scroll, pointer physics). Use Motion's `useMotionValue`, `useTransform`, or `useScroll`.
* **Icons:** Phosphor Icons (`@phosphor-icons/react`), Hugeicons (`hugeicons-react`), Radix Icons (`@radix-ui/react-icons`), or Tabler Icons (`@tabler/icons-react`). **Avoid Lucide Icons** unless already in the project. Standardize `strokeWidth`.
* **Layout Responsiveness:** Standardize breakpoints and wrap page widths (e.g., `max-w-[1400px] mx-auto`). Use `min-h-[100dvh]` instead of `h-screen`.

---

## ✏️ 4. Layout & Visual Guidelines

### Typography
* **Serif Discipline:** Serif is **strongly discouraged** by default. Never default to `Fraunces` or `Instrument_Serif` unless explicitly requested. Prefer `Geist Display`, `Satoshi`, `Cabinet Grotesk`, `Outfit`, or other modern sans display fonts.
* **Mixed-font Emphasis Ban:** Do not mix different font families in the same headline for emphasis (use italic or bold of the *same* family).

### Color
* **Consistency Lock:** Once an accent color is chosen for a page, it must be locked and used across all sections.
* **Banned Premium-Consumer Palettes:** Avoid the default AI "warm beige/cream (`#f5f1ea`) + brass/clay (`#b6553a`) + espresso (`#1a1714`)" palette. Use Forest, Cold Luxury (silver-grey), Terracotta + Slate, or monochrome + single saturated pop instead.

### Layout Mechanics
* **Hero Stack Cap:** Max 4 text elements in the hero (eyebrow/strip, headline, subtext, CTAs). No secondary taglines, pricing teasers, or bullet points in the hero area.
* **Section Repeating Layouts:** A landing page with multiple sections must use at least 4 different layout families. Avoid repeating identical layout structures.
* **Bento Grid Cell Count:** A bento grid must have exactly as many cells as there is content for. No empty placeholder tiles.
* **Zigzag Cap:** Max 2 consecutive "left-image / right-text" sections. Break the pattern on the 3rd section.

### Visual Assets & Logos
* **Logos:** Use real SVG logos (e.g., via Simple Icons: `https://cdn.simpleicons.org/{slug}/ffffff`). Never use plain text wordmarks for logos.
* **Logo Wall:** Do not print industry/category labels under the logos. The wall belongs below the hero.
* **Images:** Always use real visual assets (generate using image-gen tools, Picsum, or open stock URLs), never div-based fake screenshots.
