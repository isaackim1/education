---
version: alpha
name: Ivvy Academic Minimal
description: "Ivory + forest + ink academic minimalism for Ivvy, an AI exam-prep workspace. Helvetica Neue only, hairline borders, one green primary per screen, clay reserved for high-risk mistakes. Canonical spec: DESIGN-SPEC.md."
colors:
  primary: "#1E4634"
  on-primary: "#FFFFFF"
  primary-container: "#EAF0EB"
  on-primary-container: "#16382A"
  secondary: "#5F6368"
  on-secondary: "#FFFFFF"
  secondary-container: "#E8EAED"
  on-secondary-container: "#202124"
  tertiary: "#9C4126"
  on-tertiary: "#FFFFFF"
  tertiary-container: "#F6EAE4"
  on-tertiary-container: "#9C4126"
  error: "#B3261E"
  on-error: "#FFFFFF"
  error-container: "#F9DEDC"
  on-error-container: "#410E0B"
  warning: "#B06000"
  on-warning: "#FFFFFF"
  warning-container: "#FEEFC3"
  on-warning-container: "#3C2200"
  background: "#FAF8F4"
  on-background: "#1A1A17"
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
  focus-ring: "#1E4634"
typography:
  display-lg:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 44px
    fontWeight: "500"
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 32px
    fontWeight: "500"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 24px
    fontWeight: "500"
    lineHeight: 32px
  title-lg:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: "500"
    lineHeight: 28px
  title-md:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: "500"
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: "Helvetica Neue, -apple-system, Helvetica, Arial, sans-serif"
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
    backgroundColor: "#000000"
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

Ivvy is a desktop-first academic exam-prep workspace. It turns a student's exam materials into a personal training system: create an exam project, upload materials, organize topics, train with the Coach, save mistakes, and review them when they come due.

The product positioning is simple: generic assistants answer questions; Ivvy trains you for the exam. The interface should make that loop visible without turning the app into a decorative dashboard. Every screen should help the student decide what to do next, what to review, or what material is missing.

Ivvy should feel calm, precise, academic, and work-focused. It should not feel playful, gamified, overly rounded, glossy, mobile-first, or like a generic SaaS analytics grid.

## Colors

The palette is ivory, forest, ink, and restrained status colors.

- **Ivory canvas (#FAF8F4):** The app background. Use it across the workspace so pages feel like one calm study environment.
- **Forest primary (#1E4634):** The main action color, active navigation state, selected controls, and focus ring.
- **Forest tint (#EAF0EB):** Quiet selected states, review scheduling hints, and subtle success surfaces.
- **Ink (#1A1A17 / #1F1F1F):** Primary text and dense academic content.
- **Graphite (#56524B):** Secondary text, metadata, helper copy, and inactive navigation.
- **Clay (#9C4126):** Reserved only for high-risk mistakes: the student felt certain and was wrong. Do not use clay for urgent dates, delete actions, warnings, or generic danger.
- **Warning and error colors:** Use only for parsing delays, validation errors, failed uploads, and destructive confirmations. Keep them quieter than the forest primary.

Do not use blue as the primary UI language. Do not use decorative color fades, glass effects, bokeh, or large saturated color fields.

## Typography

Use Helvetica Neue with native grotesk fallbacks everywhere. Do not introduce additional font families.

- **Display and headlines:** Page titles and major workspace headings. Use medium weight, compact line height, and modest scale.
- **Titles:** Section headings, panel titles, topic names, and mistake prompts.
- **Body:** Chat content, explanations, material excerpts, review prompts, and study copy.
- **Labels:** Buttons, tabs, chips, fields, metadata labels, and compact controls.

Type should hold up during long study sessions on desktop screens. Avoid decorative type, excessive letter spacing, oversized dashboard headings, and tiny low-contrast metadata.

## Layout & Spacing

Ivvy is desktop-first. The project workspace uses a fixed left rail and a focused content area. Mobile support should remain functional, but desktop should be the design center.

- **Workspace nav:** Overview, Coach, and materials only.
- **Overview:** One dominant Next block, supported by evidence: review queue, calibration, high-risk mistakes, coverage, weak topics, and material status.
- **Coach:** Ask, Learn, Practice, Review, and Exam are modes of one visible session surface, not a grid of links.
- **materials:** Files, topics, and coverage are work surfaces, with upload as one clear action.
- **Density:** Comfortable but efficient. Avoid large mobile-like hero panels inside the app.

Use an 8px spacing rhythm, hairline borders, and stable desktop grids. Do not use repetitive card-grid dashboards when a table, rail, or sentence-first summary is clearer.

## Surfaces

Surfaces should clarify workflow, not decorate the page.

- Use ivory for the page canvas.
- Use white panels for the primary working surface.
- Use warm neutral panels for quiet grouping.
- Use hairline borders instead of heavy shadow.
- Keep cards at 8px radius or less unless an existing component requires a slightly larger shell.

Avoid floating sections, nested cards, heavy shadows, glass effects, and visual decoration that does not carry study information.

## Components

### Buttons

Use one forest primary action per screen or decision area where practical. Secondary actions should be ink, graphite, or bordered neutral treatments. Delete and cancel actions should stay understated and must not use clay unless the action is specifically about a high-risk mistake.

### Review And Calibration

Mistakes are the memory layer of the product. The UI should make them useful and recoverable.

- Due mistakes must appear in the review queue.
- Scheduled mistakes should show when they return.
- Review choices should use simple language: Missed, Shaky, Got it.
- Confidence is captured before feedback: Guessing, Fairly sure, Certain.
- High-risk mistakes are certain-but-wrong answers and should be clearly surfaced with clay.
- Avoid copy that implies a reviewed mistake is gone forever. It is scheduled again.

Calibration should be sentence-first and score-second. Fewer than 10 rated attempts should explain what the system is learning; 10 or more attempts can show the full metrics.

### Coach

The Coach is the main training surface. It should feel like a guided academic session, not a link directory.

- Ask, Learn, Practice, Review, and Exam share one session surface.
- The briefing should use real project data: due reviews, high-risk mistakes, materials, weak topics, and exam timing.
- The context rail should reflect current project state.
- Practice and Exam should ask for confidence before grading an answer.

### Projects Home

The global page is "Your exams." It is not the in-project Overview.

- Empty state explains how to create the first exam project.
- Existing projects appear as a list or table.
- Where data exists, show due reviews, upcoming exams, missing materials, readiness, and weak topics.

### Auth Placeholder

Login and signup are browser-local placeholders. Copy must state that projects, materials, and mistakes stay in this browser for now. Existing local data must remain reachable.

## Do's And Don'ts

- Do use ivory canvas, forest primary, ink text, and Helvetica Neue.
- Do keep the workspace quiet, academic, desktop-first, and built for repeated study.
- Do reserve clay for high-risk certain-but-wrong mistakes.
- Do surface due reviews, calibration, weak topics, coverage, and material status as evidence for the next recommendation.
- Do use WCAG AA contrast for body text and controls.
- Don't use blue as primary UI.
- Don't use decorative color fades, glass effects, heavy shadows, or generic dashboard modules.
- Don't use extra font families.
- Don't overclaim readiness as a predicted grade.
- Don't hide the review schedule behind "done" language.
