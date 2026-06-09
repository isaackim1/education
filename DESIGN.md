---
meta:
  product: Ivvy
  version: "1.0"
  aesthetic: calm-functional
  framework: tailwindcss-v3
  theme: light-only
  last-updated: 2025-06-08

# ─── COLOR TOKENS ────────────────────────────────────────────────────────────
# All values map directly to Tailwind's default neutral palette.
# Do not invent new colors. Do not use Tailwind color aliases outside this set.

colors:
  # Backgrounds
  background:       "#ffffff"   # bg-white       — every page background
  surface:          "#fafafa"   # bg-neutral-50   — agent message bubbles, subtle surfaces
  surface-raised:   "#f5f5f5"   # bg-neutral-100  — badges, tags, chips

  # Borders
  border-subtle:    "#e5e5e5"   # border-neutral-200 — cards, dividers
  border-default:   "#d4d4d4"   # border-neutral-300 — inputs, secondary buttons
  border-strong:    "#000000"   # border-black        — hover/active/focus borders

  # Text
  text-primary:     "#000000"   # text-black       — headings, body, key content
  text-secondary:   "#525252"   # text-neutral-600 — supporting copy, form values
  text-tertiary:    "#737373"   # text-neutral-500 — labels, captions, placeholders
  text-muted:       "#a3a3a3"   # text-neutral-400 — timestamps, metadata, hints
  text-on-fill:     "#ffffff"   # text-white       — text on filled (black) buttons
  text-tag:         "#404040"   # text-neutral-700 — tag/badge text

  # Interactive
  fill-primary:       "#000000"   # bg-black       — primary button fill
  fill-primary-hover: "#262626"   # bg-neutral-800 — primary button hover
  fill-overlay:       "rgba(0,0,0,0.20)"  # bg-black/20 — modal backdrop

  # Feedback
  error:    "#dc2626"   # text-red-600 — inline error messages only
  success:  "#737373"   # text-neutral-500 — "Saved", "Reviewed" states (quiet)

  # Focus
  focus-ring: "#000000"   # ring-black — focus indicator on all interactive elements

# ─── TYPOGRAPHY TOKENS ───────────────────────────────────────────────────────

typography:
  family-sans: >
    Inter, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif
  family-mono: >
    ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace

  # Use Tailwind's default scale. Do not add custom font sizes.
  scale:
    xs:   "12px / 1.5"   # text-xs   — timestamps, badges, labels, helper text
    sm:   "14px / 1.5"   # text-sm   — body text, buttons, inputs, most UI copy
    base: "16px / 1.5"   # text-base — reserved; use sparingly
    lg:   "18px / 1.4"   # text-lg   — modal headings
    2xl:  "24px / 1.2"   # text-2xl  — page-level h1 only

  weights:
    normal:   400   # font-normal   — body, metadata
    medium:   500   # font-medium   — topic names in cards, form labels
    semibold: 600   # font-semibold — page headings, modal headings, section labels

  tracking:
    tight: "-0.025em"   # tracking-tight — h1 page headings only

# ─── SPACING TOKENS ──────────────────────────────────────────────────────────

spacing:
  # Page
  page-x:        "16px"    # px-4    — horizontal page padding (all viewports)
  page-y:        "32px"    # py-8    — vertical page padding (list/detail pages)
  page-y-form:   "48px"    # py-12   — vertical padding on setup/onboarding pages

  # Containers
  max-w-content: "672px"    # max-w-2xl — single-column content (mistakes, review, materials)
  max-w-form:    "512px"    # max-w-lg  — setup/onboarding forms
  max-w-grid:    "1152px"   # max-w-6xl — plan grid, mastery overview

  # Components
  card-padding:  "16px"   # p-4 — standard card internal padding
  modal-padding: "24px"   # p-6 — modal internal padding
  input-x:       "12px"   # px-3
  input-y:        "8px"   # py-2

  # Gaps
  gap-tight:   "8px"    # gap-2 — inline elements, badge rows
  gap-medium:  "12px"   # gap-3 — button groups, filter rows
  gap-loose:   "16px"   # gap-4 — header elements, navigation links

  # Stacks
  stack-section: "24px"   # space-y-6 — between major sections on a page
  stack-items:   "16px"   # space-y-4 — between list items (cards, mistake list)
  stack-fields:  "24px"   # space-y-6 — between form fields

# ─── RADIUS TOKENS ───────────────────────────────────────────────────────────

radius:
  default: "4px"    # rounded    — inputs, buttons, badges, cards, textareas
  lg:      "8px"    # rounded-lg — modals and dialogs only
  # NEVER use rounded-full or rounded-xl in this product.

# ─── SHADOW TOKENS ───────────────────────────────────────────────────────────

shadows:
  none:  "none"                                          # Cards — border-only, no shadow
  modal: "0 1px 2px 0 rgb(0 0 0 / 0.05)"                # shadow-sm — modals only

# ─── ANIMATION TOKENS ────────────────────────────────────────────────────────

animation:
  colors: "150ms ease"   # transition-colors — border/bg color changes on hover
  # No other animations. No transforms. No slide-ins. No entrance effects.

# ─── BREAKPOINTS ─────────────────────────────────────────────────────────────

breakpoints:
  sm: "640px"    # sm: prefix — layout adjustments (e.g., plan header flex direction)
  # Design is mobile-first. Max-width containers do the rest.
  # Do not target md/lg/xl breakpoints unless strictly needed for layout.
---

# Ivvy — Design System

## 1. Design Principles

These five principles govern every visual decision in Ivvy. When you are
unsure how to build something, return to these.

**1. Exam-serious, not app-cheerful.**
The student is preparing for a real exam with real consequences. Every visual
decision should reinforce seriousness and focus. Avoid decorative elements,
playful illustrations, celebration animations, and progress bars that feel like
points in a game.

**2. The content is the interface.**
The AI coach's questions and the student's answers are the product. Everything
else — navigation, cards, buttons — is scaffolding. Scaffolding should be
invisible. No element should compete with the conversation.

**3. Calm through restraint.**
Calm is not created by adding softness — it is created by removing noise.
Fewer colors, fewer borders, fewer type sizes. One shadow in the whole app.
One primary button style. If something can be a text link instead of a button,
it should be a text link.

**4. Black-and-white interaction model.**
Interactive elements use black (fill, border, text) to communicate priority.
Neutral grays communicate secondary actions. Nothing else signals "click me."
No blue links. No green confirms. No yellow warnings (except for actual errors).

**5. Legibility over aesthetics.**
Minimum body text is 14px (`text-sm`). Minimum touch target is 32px tall.
Contrast ratios meet WCAG AA. If a design choice makes text harder to read
under fluorescent exam-room lighting, it is wrong.

---

## 2. Visual Identity

Ivvy looks like **a sheet of white paper on a plain desk**. Everything
unnecessary has been removed. The only things that exist on screen are what the
student needs to read and act on right now.

- **Not**: a productivity dashboard, a game, a social network
- **Not**: soft-pastel wellness app, neon edtech platform, glassmorphism gradients
- **Yes**: the spare utility of a text editor, the calm of a blank notebook

Color use is almost entirely neutral. Black is reserved for the most important
content and the primary interactive element. Gray creates hierarchy without
introducing color. There is no accent color in v1.

---

## 3. Color Rules

### Background hierarchy

```
Page background   →  bg-white          (#ffffff)
Card surface      →  bg-white          (#ffffff)  border border-neutral-200
Subtle surface    →  bg-neutral-50     (#fafafa)  — agent messages only
Tag/badge fill    →  bg-neutral-100    (#f5f5f5)
```

Agent messages have `bg-neutral-50` to visually distinguish them from the
student. This is the **only** use of a non-white surface inside the message
thread. Do not add color coding beyond this.

### Text hierarchy

```
Primary content   →  text-black        (#000000)  — coach questions, student answers
Supporting copy   →  text-neutral-600  (#525252)  — descriptions, secondary info
Labels/captions   →  text-neutral-500  (#737373)  — field labels, section subheadings
Metadata          →  text-neutral-400  (#a3a3a3)  — timestamps, dates, "Saved" status
```

**Never** use `text-neutral-700` or `text-neutral-900` for body text — the jump
is too subtle and introduces inconsistency. Use `text-black` for anything that
needs to be primary, and `text-neutral-600` for anything that should step back.

### Border hierarchy

```
Card borders      →  border-neutral-200   — gentle enclosure
Input borders     →  border-neutral-300   — visible but not dominant
Hover/active      →  border-black         — single clear signal of interaction
```

### Error and success states

```
Error text        →  text-red-600    — inline validation only (never background fill)
Success/confirm   →  text-neutral-500 or text-neutral-400  — quiet, not celebratory
```

Error states must use `role="alert"`. They are always inline text near the field,
never toast notifications, never colored backgrounds.

### What is not allowed

- No `bg-blue-*`, `bg-green-*`, `bg-yellow-*`, or any non-neutral background
- No gradient backgrounds or borders (`bg-gradient-*`)
- No opacity tricks on text color (use the right neutral instead of `text-black/60`)
- No dark-mode variants

---

## 4. Typography Rules

### Font stack

Inter is the primary typeface. No secondary display font. The `font-family` is
set globally on `body` in `globals.css`.

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, sans-serif;
```

Do not set `font-family` on individual elements. Do not add Google Fonts imports.
Do not use a different font for headings vs body.

### Type scale usage

| Token | Class | Used for |
|---|---|---|
| 2xl semibold tight | `text-2xl font-semibold tracking-tight` | Page h1 only |
| lg semibold | `text-lg font-semibold` | Modal headings only |
| sm semibold | `text-sm font-semibold` | Section headings (`14-day study plan`, etc.) |
| sm medium | `text-sm font-medium` | Topic names in cards, nav app name |
| sm normal | `text-sm` | Body text, button labels, input text |
| xs medium | `text-xs font-medium text-neutral-500` | Field labels above inputs |
| xs normal | `text-xs text-neutral-400` | Timestamps, helper text, metadata |
| xs tag | `text-xs text-neutral-700` | Badge/chip labels |

**Never** use `text-base`, `text-xl`, or `text-3xl` and above. Never use
`font-bold` — `font-semibold` is the heaviest weight in this product.
Never use `font-light` or `font-thin`.

### Paragraph and line height

Body text (`text-sm`) renders at `14px / 1.5`. Do not set custom `leading-*`
unless correcting a specific problem. Message content uses `whitespace-pre-wrap`
to preserve line breaks from the AI response.

### Heading pattern

Every page that has content uses this pattern for the main heading:

```tsx
<h1 className="text-2xl font-semibold tracking-tight">
  Page Title{" "}
  <span className="text-base font-normal text-neutral-500">(count)</span>
</h1>
```

The count or subtitle is always lighter and smaller, inline with the title.

---

## 5. Spacing and Radius Rules

### Page layout pattern

All pages follow this shell:

```tsx
<main className="min-h-screen bg-white">
  <div className="max-w-{size} mx-auto px-4 py-8">
    {/* content */}
  </div>
</main>
```

Exception: the session screen uses `h-screen flex flex-col` (full height,
column flex) because it has a fixed top bar and pinned input area.

### Container width selection

| Context | Class | Use when |
|---|---|---|
| Forms (setup) | `max-w-lg` | Single-column form with no sidebar |
| Content (mistakes, materials, review) | `max-w-2xl` | Reading-focused single-column content |
| Grid (plan) | `max-w-6xl` | Multi-column layouts only |

Do not use `max-w-3xl`, `max-w-4xl`, or `max-w-5xl` in new pages.

### Internal spacing scale

Use the existing gap/spacing tokens. Do not invent intermediate values.

```
space-y-6  → between major sections within a page
space-y-4  → between list items (card lists, field groups in a card)
space-y-3  → within a small card (between label–value pairs)
gap-4      → horizontal header flex gaps
gap-3      → filter bars, button groups
gap-2      → inline badge rows, tight icon+label pairs
```

### Radius usage

| Element | Class |
|---|---|
| Input, textarea, select | `rounded` |
| Button (all types) | `rounded` |
| Badge/tag | `rounded` |
| Card/list item | `rounded` |
| Modal/dialog | `rounded-lg` |

Do not use `rounded-lg` on cards or buttons. Do not use `rounded-full` anywhere.
Consistency matters more than softness.

---

## 6. Component Guidelines

### Primary button

```tsx
<button className="bg-black text-white text-sm py-2 px-4 rounded
                   hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">
  Label
</button>

// Full-width form submit variant:
<button className="w-full bg-black text-white text-sm py-2.5 rounded font-medium
                   hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">
  Label
</button>
```

Use for: the single most important action on a screen (submit, back to plan).
**Never** use two primary buttons side by side.

### Secondary button (bordered)

```tsx
<button className="border border-neutral-300 text-sm py-2 rounded
                   hover:border-black disabled:opacity-50 disabled:cursor-not-allowed">
  Label
</button>
```

Use for: "Stay here", "End Session", secondary modal action.
No background color. Border darkens on hover. That is the full interaction.

### Chip / action button

```tsx
<button className="shrink-0 text-xs border border-neutral-300 rounded px-3 py-1.5
                   hover:border-black hover:bg-neutral-50
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Label
</button>
```

Use for: action buttons in the session screen (Quiz Me, Explain Simply, etc.).
Small, horizontal, scrollable row. `transition-colors` is the only animation used.

### Text link / ghost action

```tsx
// Navigation back link
<Link href="/plan" className="text-sm text-neutral-500 underline hover:text-black">
  ← Back to plan
</Link>

// Inline secondary action
<button className="text-xs text-neutral-500 underline hover:text-black">
  Save as mistake
</button>

// Minimal secondary (no underline)
<button className="text-xs text-neutral-400 hover:text-neutral-600">
  mark as reviewed
</button>
```

Back links always include `←` and always return to the parent page.
Never use router.push for back navigation when a `<Link>` works.

### Form input / textarea

```tsx
<input className="w-full border border-neutral-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-1 focus:ring-black" />

<textarea className="w-full border border-neutral-300 rounded px-3 py-2 text-sm
                     resize-y focus:outline-none focus:ring-1 focus:ring-black" />
```

All inputs use `focus:outline-none focus:ring-1 focus:ring-black`. Never add
`focus:ring-2`. Never use `focus:border-black` as the sole focus indicator —
the ring is required for keyboard accessibility.

### Field label

```tsx
<label className="block text-xs font-medium text-neutral-500 mb-1">
  Field name
</label>
```

Always `text-xs font-medium text-neutral-500`. Always `mb-1` (4px gap to input).
Never uppercase labels. Never large labels.

### Helper / hint text

```tsx
<p className="text-xs text-neutral-400 mt-1">
  Aim for 200–500 characters.
</p>
```

Always `text-xs text-neutral-400`. Always `mt-1`. Short sentences only.

### Error message

```tsx
<p className="text-sm text-red-600" role="alert">
  Error message here.
</p>
```

Always `role="alert"`. Always inline, near the field or action it concerns.
Never a toast. Never a colored background. Never `text-red-500` or `text-red-700`.

### Card

```tsx
<div className="border border-neutral-200 rounded p-4 space-y-3">
  {/* content */}
</div>
```

No shadow. No background color (remains white). `border-neutral-200` only.
`rounded` only. `p-4` internal padding. `space-y-3` for internal stacks.

### Badge / tag

```tsx
<span className="text-xs bg-neutral-100 rounded px-2 py-0.5 text-neutral-700">
  Label
</span>
```

Static display only. No interaction on badges. Used for topic names,
session types, mistake categories.

### Modal / dialog

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
  <div className="relative bg-white border border-neutral-200 rounded-lg
                  max-w-md w-full p-6 shadow-sm">
    {/* content */}
  </div>
</div>
```

`rounded-lg` and `shadow-sm` are used **only** on modals. Clicking the
backdrop closes the modal. No slide-in or fade animation.

### Loading state

```tsx
<p className="text-sm text-neutral-600">Loading...</p>
```

Centered in a `min-h-screen flex items-center justify-center` container.
No spinner icon. No skeleton loader. Plain text only.

### Thinking / agent loading

```tsx
<p className="text-sm text-neutral-500 text-center py-2 shrink-0">
  Coach is thinking...
</p>
```

Appears below the message thread while `isAgentLoading` is true. No animation.
No spinner. No dots. Plain text, neutral, calm.

---

## 7. Page Guidelines

### Redirect page (`/`)

Invisible to the student. Shows a brief `Loading...` text while
redirecting to `/setup` or `/plan`. No branded splash screen.

### Setup page (`/setup`)

Single-column form. `max-w-lg`. `py-12`. Brief header: product name + one
descriptor sentence. Form fields with labels. One submit button. No decorative
elements. Confidence level uses inline button segmented control (not a slider,
not a star rating).

### Plan page (`/plan`)

The home base. `max-w-6xl`. Header contains: product name, subject, exam
countdown, right-aligned text links (Materials, Mistake Bank, Reset setup).
Below: plan grid section, mastery strip section. No sidebar.

### Session page (`/session`)

Full-height column layout (`h-screen flex flex-col`). Top bar is `border-b`,
fixed. Message thread is `flex-1 overflow-y-auto`. Bottom area is `border-t
shrink-0` with action chips, input, and end session button stacked vertically.
No padding changes on mobile beyond `px-4`.

### Mistake Bank (`/mistakes`)

`max-w-2xl`. Back link → h1 → filter row → card list. Filters are plain
`<select>` elements. Cards use `space-y-4`. Empty state is a plain sentence.

### Review page (`/review`)

Closest to the session page. `h-screen flex flex-col`. Top bar is a simple
custom flex row (not `SessionTopBar`) with back link and topic badges. Message
thread + input + end review button below. Success state replaces the input area.

### Materials page (`/materials`)

`max-w-2xl`. Back link → h1 + subtitle → `space-y-6` list of `TopicMaterialCard`.
Each card: topic name, two textareas, a Save button. Minimal. No mastery scores
or other topic data on this page.

---

## 8. Navigation Rules

There is **no persistent navigation bar** in Ivvy.

Each page provides its own context-appropriate back link:
- Back links use the pattern: `← Back to [page name]`
- They are `text-sm text-neutral-500 underline hover:text-black`
- They appear at the top-left of the page, before the heading
- They use `<Link>` (Next.js), never `router.push` or `router.back()`

The plan page (`/plan`) is the hub. All other pages link back to it.

The plan page header contains secondary navigation links (Materials, Mistake Bank)
as `text-xs text-neutral-500 underline hover:text-black` in a flex row at top-right.

Do not add:
- A fixed sidebar
- A mobile hamburger menu
- Tab bars at the bottom of the screen
- Breadcrumbs beyond the single back link
- A "home" or "dashboard" link beyond the plan page

---

## 9. Accessibility Rules

**Focus states:** Every interactive element must have `focus:ring-1 focus:ring-black`
with `focus:outline-none`. This is the sole focus indicator. Do not remove it.
Do not add `focus-visible:` variants that hide it on mouse click — the app is
also used on tablets where distinction is unclear.

**Color contrast:** All text-on-background combinations meet WCAG AA (4.5:1
minimum). Do not use `text-neutral-300` or lighter on white — it fails contrast.
The lightest body-text color in use is `text-neutral-400` (#a3a3a3) and it is
used exclusively for metadata, not functional text.

**Touch targets:** Every tappable element must be at least 32px tall. Inline
text links (`text-xs`) achieve this through padding — do not shrink `py-1` on
buttons below 28px. Agent session inputs use `rows={2}` minimum height.

**Semantic HTML:** Use `<button>` for actions, `<a>` / `<Link>` for navigation.
Never use `<div onClick>` for interactive elements. Use `<label>` elements with
correct `htmlFor` attributes on all form inputs.

**ARIA:** Error messages use `role="alert"`. Modal backdrops use `aria-hidden`.
Form validation errors appear near the field they concern, not at page top.

**Disabled states:** Use the HTML `disabled` attribute, not just opacity.
Disabled elements get `opacity-50 cursor-not-allowed`. Do not rely on visual
opacity alone to communicate disabled state — the disabled attribute is required
for screen readers and keyboard navigation.

---

## 10. Tailwind Usage Guidelines

### Use these utilities

```
Layout:   flex, grid, h-screen, min-h-screen, flex-1, shrink-0, overflow-y-auto
Display:  items-center, items-start, justify-between, gap-{2,3,4}
Sizing:   w-full, max-w-{lg,2xl,6xl}, px-{3,4}, py-{2,3,4,8,12}
Text:     text-{xs,sm,lg,2xl}, font-{medium,semibold}, tracking-tight
Colors:   Use only bg-white, bg-neutral-{50,100,800}, text-black, text-white,
          text-neutral-{400,500,600,700}, border-neutral-{200,300},
          border-black, text-red-600, ring-black, bg-black/20
Border:   border, border-b, border-t, rounded, rounded-lg
Shadow:   shadow-sm (modal only)
Misc:     space-y-{3,4,6}, line-clamp-{2,3}, whitespace-pre-wrap,
          truncate, resize-y, transition-colors, select-none
```

### Do not use

- `bg-gradient-*` — no gradients
- `rounded-full`, `rounded-xl`, `rounded-2xl` — only rounded and rounded-lg
- `shadow-md`, `shadow-lg`, `shadow-xl` — only shadow-sm on modals
- `animate-*`, `motion-*` — no animations beyond transition-colors
- `text-blue-*`, `text-green-*`, `text-yellow-*`, `text-purple-*` — no color text
- `bg-blue-*`, `bg-green-*`, `bg-red-*`, `bg-yellow-*` — no color backgrounds
- `font-bold`, `font-black`, `font-light` — only normal, medium, semibold
- `text-xs font-semibold` — never bold-weight at xs size (looks overstyled)
- `uppercase`, `tracking-widest` — no label-case or decorative tracking
- `dark:*` — no dark mode in v1
- `hover:scale-*`, `hover:translate-*` — no transform effects
- `border-2`, `ring-2`, `ring-4` — only single-pixel borders and ring-1

### Arbitrary values

Avoid `[...]` arbitrary values entirely. If you need a value not in Tailwind's
default scale, it is a signal that the design has drifted. Use the nearest
scale value instead.

---

## 11. What Coding Agents Must Not Do

These are explicit prohibitions. Any change that violates them is wrong regardless
of whether it "looks fine" in isolation.

1. **Do not add a navigation bar, sidebar, or tab bar.** Pages navigate by
   back links and hub links only. If you feel a navigation element is needed,
   add a text link, not a nav component.

2. **Do not add color.** The entire app runs on black, white, and neutral grays.
   Adding any non-neutral color to a new component — even a subtle one — breaks
   the visual identity. If you are tempted to add color, use a darker neutral
   instead.

3. **Do not add animation beyond `transition-colors`.** No entrance animations,
   no sliding panels, no fade-ins, no loading spinners, no skeleton screens.
   Text only for loading states.

4. **Do not use `rounded-lg` outside of modals.** Cards, buttons, inputs, and
   badges all use `rounded`. This is intentional and must be consistent.

5. **Do not use `shadow-md` or larger.** The only shadow in the product is
   `shadow-sm` on the modal. Adding shadows to cards or buttons creates visual
   weight that conflicts with the border-only design language.

6. **Do not use `font-bold`.** The heaviest weight is `font-semibold`, used
   only for headings. Bold text creates visual aggression that conflicts with
   the calm study environment.

7. **Do not add a success/confirmation toast or snackbar.** Confirmations are
   inline and quiet (e.g., button label changes to "Saved" for 2 seconds, then
   reverts). No floating notifications.

8. **Do not add gamification elements.** No stars, trophies, streaks, XP bars,
   progress rings, confetti, or level-up indicators. Mastery is shown as a
   plain numeric score (0–5), not a visual progress bar unless strictly
   necessary.

9. **Do not introduce a new component library.** No shadcn/ui, no Radix, no
   Headless UI, no MUI. All components are built from Tailwind utilities directly.

10. **Do not add dark mode.** There is no dark mode in v1. Do not add
    `dark:` variants to any element. Do not add a theme toggle.

11. **Do not change the font.** Do not import Google Fonts, Next.js Font, or
    any additional typeface. Inter via system font stack is the final answer.

12. **Do not add `<hr>` or decorative dividers.** Section separation is achieved
    through spacing (`space-y-6`, `mt-8`). Borders are structural (card outlines,
    header borders), never decorative.
