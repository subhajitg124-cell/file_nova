# FileNova Development Rules

## Core Principle

Preserve functionality first.
Improve quality second.
Never introduce regressions.

---

## Before Changing Any Code

- Understand the existing implementation.
- Read related components before editing.
- Understand dependencies.
- Understand routing.
- Understand API usage.

Never guess.

---

## Feature Preservation

Never remove:

- Navbar
- Search
- AI Assistant
- Dashboard
- Tool Workspace
- Upload System
- Download System
- Recent Files
- History
- Settings
- Authentication
- Pricing
- Premium Features
- Theme System
- Notifications

unless explicitly instructed.

---

## UI Rules

Keep the design consistent.

Never:

- randomly change spacing
- randomly change colors
- randomly change typography
- randomly change animations

Follow the existing design system.

---

## Layout Rules

Always verify:

Desktop

Laptop

Tablet

Mobile

Ultra-wide

Nothing should overflow.

Nothing should be hidden.

Nothing should overlap.

---

## Animation Rules

Animations should:

- improve usability
- stay smooth
- be GPU accelerated
- be subtle
- never distract

Respect prefers-reduced-motion.

---

## Accessibility

Always preserve:

- keyboard navigation
- focus states
- ARIA
- semantic HTML
- color contrast

---

## Development Rules

Fix existing code before replacing it.

Prefer small targeted edits.

Never rewrite large files unless necessary.

Never create duplicate components.

Never leave TODOs.

Never leave placeholder implementations.

Never leave unused imports.

Never leave console logs.

---

## Validation

After every change verify:

- functionality
- responsiveness
- accessibility
- animations
- routing
- API calls

before considering the task complete.

---

## Final Goal

Every completed task must:

✔ Preserve all existing functionality

✔ Improve code quality

✔ Improve UI consistency

✔ Improve maintainability

✔ Introduce zero regressions
