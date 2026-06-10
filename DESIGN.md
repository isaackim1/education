---
version: alpha
name: Ivvy Material Foundation
description: "A Google / Material-style design foundation for Ivvy, an AI exam training workspace."
colors:
  primary: "#0B57D0"
  on-primary: "#FFFFFF"
  primary-container: "#D3E3FD"
  on-primary-container: "#041E49"
  secondary: "#5F6368"
  on-secondary: "#FFFFFF"
  secondary-container: "#E8EAED"
  on-secondary-container: "#202124"
  tertiary: "#137333"
  on-tertiary: "#FFFFFF"
  tertiary-container: "#CEEAD6"
  on-tertiary-container: "#0D3B1E"
  error: "#B3261E"
  on-error: "#FFFFFF"
  error-container: "#F9DEDC"
  on-error-container: "#410E0B"
  warning: "#B06000"
  on-warning: "#FFFFFF"
  warning-container: "#FEEFC3"
  on-warning-container: "#3C2200"
  background: "#F8FAFD"
  on-background: "#1F1F1F"
  surface: "#FFFFFF"
  on-surface: "#1F1F1F"
  surface-container-lowest: "#FFFFFF"
  surface-container-low: "#F8FAFD"
  surface-container: "#F1F3F4"
  surface-container-high: "#E8EAED"
  surface-container-highest: "#DADCE0"
  surface-variant: "#E8EAED"
  on-surface-variant: "#5F6368"
  outline: "#C4C7C5"
  outline-variant: "#E1E3E1"
  inverse-surface: "#303134"
  inverse-on-surface: "#F1F3F4"
  focus-ring: "#0B57D0"
typography:
  display-lg:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 44px
    fontWeight: "500"
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: "500"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: "500"
    lineHeight: 32px
  title-lg:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: "500"
    lineHeight: 28px
  title-md:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: "500"
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: "Roboto, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: "Roboto, Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: "Google Sans, Roboto, Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  page-margin-mobile: 16px
  page-margin-tablet: 24px
  page-margin-desktop: 32px
  content-max: 960px
  reading-max: 720px
  app-shell-max: 1200px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 40px
    padding: 0 24px
  button-primary-hover:
    backgroundColor: "#0842A0"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 40px
    padding: 0 24px
  button-tonal:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 40px
    padding: 0 24px
  button-text:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 40px
    padding: 0 12px
  card-standard:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-tonal:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.DEFAULT}"
    height: 48px
    padding: 0 16px
  textarea-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.DEFAULT}"
    padding: 12px 16px
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.DEFAULT}"
    height: 32px
    padding: 0 12px
  chip-selected:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    typography: "{typography.label-md}"
    rounded: "{rounded.DEFAULT}"
    height: 32px
    padding: 0 12px
  badge-success:
    backgroundColor: "{colors.tertiary-container}"
    textColor: "{colors.on-tertiary-container}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  list-item:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 12px
  list-item-hover:
    backgroundColor: "{colors.surface-container-low}"
---

# Ivvy - Design System

## Overview

Ivvy is an AI exam training workspace. It turns a student's exam materials into a personal training system: create project, add topics, add materials, train in adaptive chat, save mistakes, review the mistake bank, then return to chat with "Requiz me" using recent unreviewed mistakes.

The product positioning is: Claude answers your study questions. Ivvy trains you for the exam. The interface should make that difference visible. Ivvy is not a general chat window with notes attached; it is a calm training environment where every screen points the student toward practice, correction, and exam readiness.

The visual direction is a Google / Material-style product foundation. Use clear surfaces, rounded Material shapes, purposeful color, accessible contrast, consistent controls, and generous but practical spacing. Branding will come later, so this foundation should feel polished and modern without becoming a literal Google clone.

Ivvy should feel clear, helpful, trustworthy, calm, modern, accessible, polished, practical, and exam-focused. It should not feel luxury editorial, empty monochrome, like a boring admin tool, playful or gamified, like an overdesigned SaaS dashboard, or like an exact copy of Google.

Roadmap-aware design priorities:

- **Phase 8B - Active Review:** review flows need stronger state, recurrence, and "what happens next" clarity.
- **Phase 9 - Dashboard / progress visibility:** progress views need cards, charts, summaries, and empty states that remain study-focused.
- **Phase 10 - PDF and DOCX implementation:** upload, parsing, document status, and error states need predictable Material-style feedback.

## Colors

The palette follows Material-style semantic roles: blue for primary actions and active states, neutral surfaces for content, green for confirmed progress, amber for caution, and red for errors. Color is functional, not decorative.

- **Primary (#0B57D0):** Use for the main action on a screen, active navigation state, selected controls, focus indicators, and links. It should guide the student without making the whole UI feel blue.
- **Primary Container (#D3E3FD):** Use for selected chips, quiet active states, and low-emphasis surfaces that need a blue relationship to the primary action.
- **Surface (#FFFFFF) and Background (#F8FAFD):** Pages use a soft Google-style app background, with white cards and panels for content.
- **Surface Containers:** Use the container scale to separate messages, cards, filters, and elevated panels without relying on heavy borders.
- **On Surface (#1F1F1F):** Primary text color. It should carry most of the product's seriousness.
- **On Surface Variant (#5F6368):** Secondary text, helper text, metadata, captions, and less prominent navigation.
- **Tertiary Green (#137333):** Use for saved, reviewed, correct, and completed states. Keep it calm and status-oriented, not celebratory.
- **Warning Amber (#B06000):** Use for parsing delays, incomplete setup, approaching deadlines, and recoverable caution.
- **Error Red (#B3261E):** Use for validation errors, failed uploads, and destructive confirmations.

Do not build large saturated color blocks. Material color works best here as state, emphasis, and structure. Most screens should still be dominated by surface, text, and content.

## Typography

Typography follows a Material-like hierarchy. Prefer **Google Sans** for headings and labels when available, with **Roboto** for body text. Until the app implements those fonts, **Inter** and system sans are acceptable fallbacks. Do not add font files or package changes unless a future implementation task explicitly asks for it.

- **Display and headlines:** Use for page titles, dashboard hero summaries, and major training milestones. Keep weights medium rather than bold.
- **Titles:** Use for card headings, dialog titles, topic names, and mistake group headings.
- **Body:** Use for chat content, explanations, material excerpts, review prompts, and longer study text.
- **Labels:** Use for buttons, tabs, chips, fields, metadata labels, and compact controls.

Type should be readable under study conditions: long sessions, laptop screens, tablets, and low-energy review. Avoid decorative type treatments, all-caps labels, very tight line heights, and giant marketing-style headings inside the app shell.

Recommended application:

- Page title: `headline-lg` or `headline-md`
- Section title: `title-lg`
- Card title: `title-md`
- Primary body: `body-lg` for study content, `body-md` for UI copy
- Button and chip text: `label-md`
- Metadata and compact labels: `label-sm`

## Layout & Spacing

Ivvy should use a responsive Material app layout: focused single-column study flows, wider dashboard and project overview layouts, and clear content grouping through cards and surfaces.

- **Grid:** Use an 8px base unit. All spacing should come from the token scale unless a component has a specific Material reason to differ.
- **Page margins:** Use 16px on mobile, 24px on tablet, and 32px on desktop.
- **Reading width:** Study content, chat messages, mistake explanations, and review prompts should stay near `reading-max` so lines remain easy to scan.
- **App shell width:** Dashboards and project overview screens may expand to `app-shell-max`, but content should still be grouped into clear cards and columns.
- **Grouping:** Related controls should live near the content they affect. Filters belong above lists, review actions belong near mistake content, and chat actions belong near the composer.
- **Density:** Comfortable but not spacious. Ivvy is a productivity and study tool, not a marketing page.

The current product loop should be visually legible as a sequence: project setup -> topics/materials -> adaptive training -> mistake capture -> active review -> requiz. Future dashboard work should make this loop visible without turning the product into a generic analytics dashboard.

## Elevation & Depth

Depth should follow Material's tonal layering more than heavy shadow. Use background, surface containers, borders, and subtle elevation to communicate hierarchy.

- **Level 0 - App background:** `background`, used behind all page content.
- **Level 1 - Standard surfaces:** `surface`, used for cards, forms, message panels, and main content areas.
- **Level 2 - Tonal surfaces:** `surface-container-low` or `surface-container`, used for grouped controls, assistant messages, selected filters, and secondary panels.
- **Level 3 - Elevated panels:** `surface` with a subtle shadow and stronger container separation, used for dialogs, menus, command surfaces, and upload status panels.

Use shadow sparingly. A polished Material-style Ivvy should feel layered and touchable, but never glossy, floating, or SaaS-heavy. Cards can have a fine border or tonal contrast. Dialogs and menus may use a soft shadow. Avoid dramatic drop shadows.

## Shapes

The shape language is rounded, practical, and consistent. Ivvy should feel approachable without becoming playful.

- **Buttons:** Use full pill radius for high-recognition Material-style actions.
- **Inputs:** Use 8px radius for text fields and text areas.
- **Cards and panels:** Use 16px radius for standard cards and important content containers.
- **Lists:** Use 12px radius for interactive rows and mistake bank items.
- **Chips and badges:** Use 8px or full radius depending on whether the element is a selectable filter or compact status badge.

Do not mix sharp editorial cards with pill controls. Do not make every surface extra round. The shape system should make controls feel consistent and content containers feel stable.

## Components

### Buttons

Use Material-style button hierarchy:

- **Primary filled button:** The single most important action on a screen, such as "Start training", "Requiz me", "Save material", or "Continue review".
- **Tonal button:** Medium-emphasis actions connected to the primary task, such as "Review mistakes" or "Add topics".
- **Secondary outlined button:** Alternative or less frequent actions, such as "Cancel", "Skip for now", or "Back to project".
- **Text button:** Low-emphasis navigation and inline actions.

Never place multiple primary filled buttons in the same decision area. If two actions compete, choose one primary and make the other tonal, outlined, or text.

### Cards and Surfaces

Cards should clarify task structure, not decorate the page. Use them for project summaries, topic groups, material status, mistakes, dashboard metrics, and review sessions.

Cards should include:

- A clear title
- One primary piece of information
- Supporting metadata in `on-surface-variant`
- One obvious next action when action is needed

Avoid card grids that look like generic SaaS modules. Dashboard cards should answer student questions: What should I train next? What mistakes are waiting? What changed after my last session? Am I closer to exam readiness?

### Chat and Training

The adaptive chat is Ivvy's training surface. It should feel more like a guided practice session than a generic assistant conversation.

- Assistant prompts should use a quiet tonal surface.
- Student responses should remain plain and readable.
- Action chips such as "Quiz me", "Explain simply", and "Requiz me" should be easy to reach but visually secondary to the current question.
- Recent unreviewed mistakes should appear as training context, not as noisy notifications.
- Save and review states should use calm inline feedback.

### Mistake Bank and Active Review

Mistakes are the memory layer of the product. The UI should make mistakes feel useful and recoverable, not punitive.

- Mistake cards should emphasize concept, source topic, why it was wrong, and next review action.
- Reviewed, unreviewed, and due states should be scannable through chips and status text.
- "Requiz me" should be a strong but calm action that leads back to training.
- Empty states should be instructional: explain how mistakes get saved and what the student should do next.

### Forms, Inputs, and Materials

Forms should follow Material conventions: clear labels, helper text, visible focus, inline errors, and predictable disabled/loading states.

- Material upload and parsing states should be explicit: queued, processing, ready, failed.
- PDF/DOCX implementation should use status surfaces and inline recovery actions, not generic toasts.
- Long material text should remain readable with generous line height and visible section boundaries.

### Navigation

Navigation should be simple and contextual until the dashboard phase requires more structure.

- Project and dashboard views may use a top app bar or simple side/navigation rail if needed.
- Study and review flows should minimize navigation noise and keep the student in the task.
- Back links should remain available where they protect orientation.
- Avoid bottom tab bars, hamburger menus, and complex admin-style sidebars unless the information architecture grows enough to justify them.

### Feedback and States

Every important action needs clear feedback:

- Saving a mistake
- Reviewing a mistake
- Starting a requiz
- Uploading or parsing materials
- Generating adaptive prompts
- Completing a review session

Prefer inline status, helper text, progress surfaces, and disabled states. Use snackbars sparingly for global confirmations only. Avoid confetti, streak celebration, XP, trophies, or gamified rewards.

## Do's and Don'ts

- Do use the Google design.md token structure as the source of truth: frontmatter tokens first, prose guidance second.
- Do keep the UI Material-like: clear surfaces, rounded controls, accessible states, predictable components.
- Do use blue for primary action and focus, green for completed/reviewed status, amber for caution, and red for errors.
- Do keep study content more important than chrome, navigation, decoration, or dashboard widgets.
- Do make every screen answer a student question: what should I do next, what did I get wrong, what should I review, or how ready am I?
- Do use WCAG AA contrast for all body text and controls.
- Do use consistent button, chip, input, card, and dialog patterns across the app.
- Do design dashboard progress around exam readiness and training loops, not generic productivity metrics.
- Don't make Ivvy a luxury editorial product with oversized typography and precious whitespace.
- Don't return to an empty monochrome page style where every action is black, white, and gray.
- Don't make it a boring admin tool with dense tables and weak hierarchy.
- Don't make it playful or gamified with streaks, trophies, confetti, stars, or XP.
- Don't overdesign it with decorative gradients, glass effects, floating blobs, heavy shadows, or SaaS dashboard cliches.
- Don't clone Google exactly. Borrow Material clarity and component discipline, then adapt it to exam training.
- Don't introduce new implementation dependencies, fonts, packages, or component libraries unless a future task explicitly authorizes that work.
- Don't edit app pages or components just to satisfy this document. This file defines the foundation for future UI implementation.
