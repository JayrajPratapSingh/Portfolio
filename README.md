# 🚀 Jayraj — Full Stack Software Engineer Portfolio

A production-grade engineering portfolio built as **two distinct visual universes**:

- **🌌 Dark — "Evolution":** the signature cosmic identity — black canvas, cyan/purple
  accents, orbiting tech systems and immersive 3D.
- **🌤️ Light — "New Universe" (Aurora Glass):** a completely different design language —
  soft off-white, indigo / sky / lavender, glassmorphism and drifting aurora light.
  Not an inverted dark mode — a design in its own right.

Both are driven by a single **design-token system**, so every page stays consistent,
themeable, accessible and performant.

---

## ✨ Highlights

- 🎨 **Dual-universe theming** via `next-themes` (class strategy) + Tailwind v4 tokens
- 🧩 **Design tokens** — one source of truth for color, surface, glass, accents, shadows
- 🌠 Cinematic **Hero** with Cosmic (dark) and Aurora-Glass (light) backdrops
- 🧭 Premium **Navbar** — glass, scroll hide/show, shared-layout active indicator, magnetic hover
- 🦶 Rich **Footer** — CTA, navigation, socials, stack, built-with, back-to-top
- 🧑‍💻 **About** — glass portrait, animated stats, interactive expandable experience timeline
- 🛰️ Interactive **3D** (React Three Fiber) where it earns its place; CSS elsewhere for speed
- ♿ **Accessibility** — semantic HTML, focus rings, `aria` states, full `prefers-reduced-motion`
- ⚡ **Performance-first** — removed always-mounted WebGL from global chrome; typed data layer
- 📩 Working **contact** (Resend) · 🔐 **admin auth** (JWT + bcrypt + MongoDB)

---

## 🛠 Tech Stack

**Framework:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
**Styling / Motion:** Tailwind CSS v4 · Framer Motion · GSAP · Lenis · `next-themes`
**3D:** Three.js · React Three Fiber · Drei
**Backend:** MongoDB · Mongoose · JWT · bcryptjs · Resend · Zod-ready services
**UX:** React Hook Form · Sonner · Lucide / React-Icons

---

## 🎨 Design System

Tokens live in [`src/app/globals.css`](src/app/globals.css):

- `:root` → **light** palette · `.dark` → **dark** palette
- Exposed as utilities: `bg-background`, `text-foreground`, `border-[var(--border)]`,
  `bg-[var(--surface)]`, `bg-[var(--glass-bg)]`, `shadow-[var(--shadow-soft)]`, …
- Accent resolves to **indigo** in light, **cyan** in dark (`dark:` variants)
- Global `prefers-reduced-motion` baseline; the `useReducedMotion()` hook gates JS/3D motion

Reusable primitives: `cn()` ([`src/lib/cn.ts`](src/lib/cn.ts)), `ThemeToggle`, `Magnetic`,
`useScroll`, `useReducedMotion`.

---

## 📂 Project Structure

```txt
src
 ┣ app
 ┃ ┣ layout.tsx            # root: fonts, ThemeProvider, Navbar/Footer, metadata
 ┃ ┣ globals.css           # design tokens (light + dark) + base + keyframes
 ┃ ┣ page.tsx              # home (landing sections)
 ┃ ┣ about/                # About page (dual-theme, interactive timeline)
 ┃ ┣ projects/             # Projects page
 ┃ ┣ hire-me/              # Contact experience
 ┃ ┣ admin/login/          # Auth terminal
 ┃ ┣ dashboard/            # Protected CMS shell (middleware-guarded)
 ┃ ┗ api/                  # contact · login · register route handlers
 ┣ components
 ┃ ┣ layout/               # Navbar, Footer, NavBackground
 ┃ ┣ landing/              # Hero (Intro) + hero/ backdrops + 3D solar system
 ┃ ┣ about/                # AboutBackdrop
 ┃ ┣ contact/              # ContactForm, scenes
 ┃ ┗ ui/                   # ThemeToggle, Magnetic, Button, Container, …
 ┣ data/                   # typed content: hero, about, nav, social (CMS-ready)
 ┣ hooks/                  # useScroll, useReducedMotion, useLenis, …
 ┣ lib/                    # cn, db, constants
 ┣ models/                 # Mongoose models (User)
 ┣ providers/              # ThemeProvider
 ┗ types/                  # shared content types
```

Content is being migrated into `src/data/*` (typed + serializable) one page at a time,
so it can move behind an API/CMS later without touching components.

---

## ⚙️ Environment Variables

Create `.env.local` (gitignored):

```env
MONGODB_URI=          # mongodb+srv://…/portfolio
JWT_SECRET=           # single strong secret
RESEND_API_KEY=       # re_…
CONTACT_RECEIVER=     # where contact emails are delivered
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

> Add `public/resume.pdf` for the Resume buttons to resolve.
> Cloudinary (`CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET`) is only needed if
> the Projects image-upload CMS is enabled.

---

## ▶️ Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and use the sun/moon toggle to switch universes.

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`

---

## 🗺️ Roadmap

- [x] Theme foundation — dual-universe tokens, provider, motion primitives
- [x] Hero — Cosmic (dark) + Aurora Glass (light)
- [x] Navbar + Footer — glass, scroll, a11y, perf
- [x] About — interactive timeline, portrait, typed data
- [ ] Projects — filterable case-study cards + typed `data/projects.ts`
- [ ] Skills & Experience — interactive visualizations
- [ ] Contact — refined dual-theme form + success states
- [ ] Resume — printable page + preview/download
- [ ] Dashboard — CMS-style content editing

---

Built with ☕ and careful engineering by **Jayraj Pratap Singh**.
