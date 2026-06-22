# FileNova AI Development Guide

Version: 1.0

This document defines the mandatory development standards for every AI coding agent working on FileNova.

These rules override generic coding behavior.

The objective is to continuously improve FileNova while preserving functionality, maintainability, accessibility and performance.

---

# Project Vision

FileNova is a premium AI-powered document productivity platform.

The goal is NOT to imitate competitors.

The goal is to create a fast, elegant, trustworthy and professional SaaS experience.

Every decision should improve:

- User Experience
- Reliability
- Performance
- Accessibility
- Maintainability
- Scalability

---

# Primary Objectives

Every modification must satisfy these priorities:

Priority 1
Preserve functionality.

Priority 2
Prevent regressions.

Priority 3
Improve maintainability.

Priority 4
Improve user experience.

Priority 5
Improve visual quality.

Never sacrifice functionality for aesthetics.

---

# Before Writing Any Code

Always inspect:

Project architecture

Folder structure

Related components

Existing hooks

Utilities

API calls

Shared components

State management

Theme system

Animation system

Responsive behavior

Never make assumptions.

---

# Required Workflow

For every task:

Understand

↓

Plan

↓

Modify

↓

Verify

↓

Test

↓

Complete

Never skip verification.

---

# Never Remove

The following features must NEVER be removed without explicit user permission.

Navigation

Search

Theme Switcher

Language Switcher

AI Assistant

Dashboard

Recent Files

History

Upload

Download

Workspace

Pricing

Authentication

Premium Features

Notifications

Settings

Footer

SEO Metadata

Analytics

Loading States

Error States

Empty States

Keyboard Shortcuts

Animations

---

# Never Break

Always preserve:

Routing

API contracts

Database schema

Authentication

Authorization

Theme support

Accessibility

Responsive layouts

Keyboard navigation

Existing URLs

Existing public APIs

---

# Development Philosophy

Prefer fixing.

Avoid rewriting.

Prefer extending.

Avoid replacing.

Prefer refactoring.

Avoid duplication.

Prefer reusable components.

Avoid copy-paste.

---

# Change Policy

Before changing a file ask:

Why does this code exist?

Can it be improved without replacing it?

Will this affect another page?

Will this introduce regressions?

Will this break responsiveness?

If unsure,

inspect more before modifying.

---

# UI Philosophy

The interface should feel:

Fast

Professional

Minimal

Elegant

Modern

Accessible

Consistent

Predictable

Every page should belong to the same design language.

---

# Visual Style

Use modern SaaS principles.

Preferred:

Minimalism

Glassmorphism (subtle)

Bento layouts

Premium cards

Smooth animations

Professional typography

Clean spacing

Avoid:

Visual clutter

Heavy shadows

Random gradients

Inconsistent spacing

Distracting motion

---

# Theme Rules

Every component must support:

Light Mode

Dark Mode

Never hardcode colors.

Always use semantic theme tokens.

Verify:

Text

Icons

Borders

Cards

Dropdowns

Dialogs

Inputs

Buttons

Hover states

Focus states

Disabled states

---

# Functionality First

Visual improvements must NEVER break:

Buttons

Forms

Dropdowns

Navigation

Search

Workspace

File upload

File download

Document processing

AI assistant

Authentication

---

# Regression Prevention

Before completing any task verify:

No features disappeared.

No pages disappeared.

No routes disappeared.

No components disappeared.

No API calls failed.

No buttons stopped working.

No dropdowns became hidden.

No dialogs became invisible.

No theme regressions.

No responsive regressions.

---

# Component Policy

Never duplicate components.

Prefer reuse.

Prefer composition.

Keep components small.

Avoid giant files.

Extract reusable logic.

Keep responsibilities separated.

---

# Code Quality

Every new code must be:

Readable

Maintainable

Reusable

Typed

Documented where necessary

Avoid:

Magic numbers

Duplicate logic

Unused imports

Unused variables

Commented-out code

Temporary fixes

---

# Error Handling

Never ignore failures.

Every async operation should provide:

Loading state

Success state

Error state

Recovery option

Helpful error message

---

# Accessibility

Every component must support:

Keyboard navigation

Visible focus

Screen readers

Proper contrast

Semantic HTML

ARIA where appropriate

Reduced motion support

---

# Performance

Optimize for:

Fast initial load

Lazy loading

Code splitting

Minimal re-renders

GPU accelerated animations

Efficient API requests

Small bundles

---

# Final Rule

Never assume the task is finished.

Inspect the affected feature.

Test it.

Verify it.

Only then continue.
# Part 2 — React, TypeScript, Architecture & Folder Standards

---

# Architecture Principles

FileNova must follow a scalable, modular architecture.

Every feature should have a clear responsibility.

Avoid tightly coupled code.

Prefer composition over inheritance.

Keep business logic separate from UI.

---

# Folder Structure

Organize the project by feature whenever possible.

Preferred structure:

src/

components/
ui/
layout/
common/

features/
pdf/
ai/
dashboard/
search/
settings/
pricing/
workspace/

hooks/

services/

lib/

utils/

types/

constants/

styles/

assets/

Avoid dumping unrelated files into a single folder.

---

# Component Rules

Every component should have ONE responsibility.

Bad:

One component handling

UI

API

State

Animations

Validation

Navigation

Good:

UI Component

Container Component

Custom Hook

Service

Utility

Separate responsibilities.

---

# Component Size

Target:

Small Components

50–150 lines

Medium Components

150–300 lines

Large Components

Maximum 400 lines

If larger:

Split into smaller reusable components.

---

# Naming Convention

Components

PascalCase

Good

UploadCard.tsx

PricingCard.tsx

SearchDialog.tsx

Bad

card.tsx

new.tsx

component.tsx

---

Hooks

Always begin with

use

Examples

useTheme

useUpload

useSearch

useRecentFiles

---

Utilities

camelCase

Examples

formatDate

downloadFile

validatePdf

generateThumbnail

---

Types

PascalCase

Example

UserProfile

ToolConfig

PricingPlan

UploadResult

---

Interfaces

Prefer descriptive names.

Avoid:

IData

IProps

Info

Use:

UploadOptions

SearchResult

PricingCardProps

---

Imports

Always group imports.

React

Third-party

Internal

Relative

Avoid duplicate imports.

Remove unused imports immediately.

---

Props

Keep props minimal.

Avoid passing entire objects.

Prefer explicit props.

Bad

<Component user={user} />

Good

<Component

name={user.name}

email={user.email}

/>

---

State Management

Keep state close to where it is used.

Local State

↓

Context

↓

Global Store

Only elevate state when necessary.

---

Custom Hooks

Move reusable logic into hooks.

Examples

useUpload

useDownload

useTheme

useKeyboardShortcuts

useSearch

useBreakpoint

Avoid duplicate logic.

---

API Layer

Never call fetch directly inside UI components.

Always use:

services/

or

api/

This keeps UI clean.

---

Business Logic

Never mix business logic with rendering.

Separate:

Validation

Formatting

Transformations

Filtering

Sorting

Searching

Conversions

into utilities or services.

---

Error Handling

Every async action should include

Loading

Success

Error

Recovery

Retry

Never silently ignore errors.

---

Forms

Forms must provide

Validation

Helpful messages

Disabled submit state

Loading state

Success state

Error state

---

Theme

Never hardcode

white

black

gray-100

etc.

Always use semantic theme tokens.

Examples

background

foreground

primary

secondary

accent

muted

border

destructive

---

Animations

Animation logic should remain separate.

Avoid placing complex animation code directly inside business components.

Extract reusable animation wrappers.

---

Responsive Development

Desktop first is NOT enough.

Verify:

Mobile

Tablet

Laptop

Desktop

Ultra-wide

Every change must work on all breakpoints.

---

Performance

Avoid unnecessary renders.

Use:

memo

useMemo

useCallback

only when beneficial.

Do NOT over-optimize.

Measure first.

---

Lists

Every list must use stable keys.

Never use

index

unless absolutely necessary.

---

Icons

Use one icon library consistently.

Keep icon sizes consistent.

Do not mix different visual styles.

---

Styling

Prefer Tailwind utility classes.

Avoid inline styles.

Avoid duplicated class strings.

Extract reusable variants where appropriate.

---

Accessibility

Every interactive element must have:

Keyboard support

Visible focus

Accessible label

Proper role

Screen reader compatibility

---

Routing

Never hardcode URLs throughout the app.

Centralize route definitions where practical.

Keep navigation consistent.

---

Dependencies

Before adding a new dependency ask:

Can existing libraries solve this?

Avoid unnecessary packages.

Smaller dependency tree = better maintainability.

---

Code Comments

Only comment WHY.

Avoid commenting WHAT.

Bad

// increment count

count++

Good

// Prevent duplicate uploads while processing

---

Logging

Never leave

console.log()

console.error()

debug statements

before completing a task.

---

Testing Mindset

Before finishing any change verify:

UI

Logic

API

Responsiveness

Accessibility

Theme

Animations

Performance

No regressions.

---

Definition of Good Code

Good code is:

Readable

Simple

Reusable

Predictable

Accessible

Testable

Performant

Maintainable

Production-ready
# Part 3 — Design System, Theme, UI & Animation Standards

---

# Design Philosophy

FileNova should feel like a premium productivity platform.

The experience should be:

- Fast
- Clean
- Modern
- Trustworthy
- Professional
- Consistent

Do NOT copy other products.

Take inspiration from:

- Linear
- Vercel
- Stripe
- Notion
- Raycast
- Adobe Acrobat

Maintain FileNova's own identity.

---

# Design Language

Preferred visual styles:

✓ Minimalism

✓ Bento Grid

✓ Premium Cards

✓ Subtle Glassmorphism

✓ Soft Aurora accents

Avoid:

✗ Heavy glass everywhere

✗ Neumorphism

✗ Brutalism

✗ Random gradients

✗ Overuse of blur

---

# Design Consistency

Every page must follow the same design language.

Do not create a new style for every page.

The entire application should feel like one product.

---

# Color System

Never hardcode colors.

Never use:

bg-white

text-black

bg-gray-100

text-gray-700

etc.

Instead use semantic tokens.

Example:

Background

Surface

Card

Foreground

Muted

Primary

Secondary

Accent

Success

Warning

Danger

Border

Input

Focus Ring

---

# Theme Support

Every component MUST support:

✓ Light Mode

✓ Dark Mode

Never optimize only for dark mode.

Always verify:

Text

Icons

Buttons

Cards

Dropdowns

Dialogs

Inputs

Tables

Tooltips

Modals

Workspace

Pricing

Navbar

Footer

---

# Light Mode Rules

Nothing should become invisible.

Ensure:

Readable text

Visible borders

Visible shadows

Visible icons

Good contrast

No white-on-white elements.

---

# Dark Mode Rules

Avoid:

Pure black backgrounds

Pure white text

Use softer contrast.

Maintain readability.

---

# Typography

Hierarchy must be consistent.

H1

↓

H2

↓

H3

↓

Body

↓

Caption

Avoid random font sizes.

Avoid inconsistent font weights.

Maintain visual rhythm.

---

# Spacing System

Use consistent spacing.

Never random values.

Preferred scale:

4

8

12

16

20

24

32

40

48

64

80

96

Maintain consistent vertical rhythm.

---

# Border Radius

Use consistent radius.

Avoid mixing:

2px

8px

18px

40px

Recommended scale:

Small

Medium

Large

Extra Large

Use consistently.

---

# Shadows

Keep shadows subtle.

Cards

Dropdowns

Dialogs

Popovers

should share similar shadow depth.

Avoid heavy shadows.

---

# Cards

Cards should have:

Clear hierarchy

Consistent padding

Equal spacing

Readable typography

Visible border

Appropriate elevation

Never overcrowd cards.

---

# Buttons

Buttons should have:

Consistent height

Consistent padding

Hover state

Focus state

Loading state

Disabled state

Avoid multiple button styles without purpose.

---

# Forms

Inputs should include:

Label

Placeholder

Focus state

Error state

Success state

Helper text

Validation message

---

# Navigation

Navbar must always remain:

Visible

Clickable

Responsive

Accessible

Verify:

Dropdowns

Search

Language selector

Theme switcher

User menu

Notifications

No clipping.

No hidden popovers.

---

# Search Experience

Search should be:

Fast

Keyboard accessible

Visually clear

Support:

Loading

No results

Error

Recent searches

Popular tools

Suggestions

---

# Pricing Section

Pricing should feel premium.

Cards must have:

Equal height

Clear CTA

Readable features

Proper spacing

Responsive layout

Most Popular plan highlighted elegantly.

Avoid visual clutter.

---

# Dashboard

Dashboard should prioritize:

Recent activity

Quick actions

Statistics

File history

AI tools

Everything should be immediately discoverable.

---

# Workspace

Workspace is productivity-first.

Avoid unnecessary decoration.

Prioritize:

Files

Progress

Preview

Actions

Results

Downloads

Keep distractions minimal.

---

# Empty States

Every empty state should include:

Icon or illustration

Helpful message

Primary action

Optional secondary action

Never leave blank screens.

---

# Loading States

Prefer:

Skeleton loaders

Progress indicators

Optimistic UI

Avoid endless spinners.

---

# Error States

Errors should explain:

What happened

Why

How to recover

Provide retry options.

---

# Icons

Use a single icon family.

Maintain:

Consistent size

Stroke width

Alignment

Spacing

Never mix icon styles.

---

# Animation Principles

Animations should improve usability.

Never animate just because you can.

---

# Preferred Animations

Fade

Slide

Scale

Blur reveal

Stagger

Counter

Smooth height transition

Hover elevation

Button press

Micro interactions

Avoid flashy animations.

---

# Animation Timing

Fast interactions:

100–150ms

Normal:

180–250ms

Large transitions:

250–350ms

Keep timing consistent.

---

# Hover States

Every interactive element should provide feedback.

Buttons

Cards

Links

Navigation

Dropdown items

Tool cards

---

# Motion Accessibility

Respect:

prefers-reduced-motion

Provide reduced animation automatically.

---

# Responsive Rules

Every page must support:

Mobile

Tablet

Laptop

Desktop

Ultra-wide

No hidden content.

No clipped cards.

No overflowing dialogs.

---

# Visual QA Checklist

Before completing any UI task verify:

✓ Light mode

✓ Dark mode

✓ Hover

✓ Focus

✓ Active

✓ Disabled

✓ Loading

✓ Empty

✓ Error

✓ Mobile

✓ Tablet

✓ Desktop

✓ Accessibility

---

# Final UI Goal

Every page should feel:

Clean

Premium

Consistent

Fast

Professional

Accessible

Predictable

The user should never feel that different pages were built by different designers.
# Part 4 — FileNova Product Rules & Feature Preservation

---

# FileNova Identity

FileNova is an AI-powered document productivity platform.

Every change must improve:

- Productivity
- Simplicity
- Reliability
- Performance

Never sacrifice functionality for visual improvements.

---

# Product Principle

Every tool should be usable by a first-time visitor without documentation.

If a feature becomes harder to discover after a change,
the change is incorrect.

---

# Critical Features

The following features are CORE features.

Never remove.

Never hide.

Never replace.

Never disable.

Never redesign completely.

Only improve.

---

## Navigation

Always preserve:

- Logo
- Main Navigation
- Popular Tools
- All Tools
- Search
- Theme Switcher
- Language Switcher
- User Menu
- Mobile Menu

Every navbar action must remain visible and functional.

---

## Search

Search is a core feature.

Always support:

Recent Searches

Popular Tools

Suggestions

Keyboard Navigation

Enter Key

Escape Key

Focus Trap

Loading

Empty State

Error State

Search should never disappear.

---

## Upload

Upload is the heart of FileNova.

Never remove:

Drag & Drop

Browse Files

Progress

Cancel

Retry

Multiple Upload

Large File Handling

Validation

Errors

Success Feedback

---

## Processing

Users must always understand what is happening.

Always show:

Progress

Status

Estimated Time (if available)

Success

Failure

Recovery

---

## Download

Never remove:

Download Button

Download History

Retry

Success Confirmation

File Information

---

## Workspace

Workspace is productivity-first.

Prioritize:

Preview

File List

Actions

Output

History

Downloads

Do not clutter the workspace.

---

## Dashboard

Dashboard should provide:

Recent Files

Recent Activity

Pinned Tools

AI Assistant

Quick Actions

Premium Features

Statistics

Everything important should be immediately visible.

---

## AI Assistant

AI Assistant is a flagship feature.

Never remove.

Always preserve:

Conversation

Context

Tool Recommendations

Workflow Suggestions

Streaming

Loading

Errors

Copy

Retry

Regenerate

Auto Scroll

---

## Pricing

Pricing page must include:

Clear Plans

Feature Comparison

Highlighted Plan

Clear CTA

Responsive Cards

Readable Typography

Proper Spacing

No uneven card heights.

---

## Settings

Never remove settings.

Group settings logically.

Every setting must provide:

Label

Description

Default Value

Immediate Feedback

---

## Authentication

Preserve:

Sign In

Sign Up

Forgot Password

OAuth

Session Handling

Redirects

Errors

Loading

---

## Notifications

Notifications should always include:

Icon

Message

Action (if applicable)

Dismiss

Auto-hide when appropriate

---

## Theme

Every component must support:

Light Mode

Dark Mode

Verify:

Navbar

Dropdowns

Dialogs

Cards

Workspace

Pricing

Footer

Settings

AI Assistant

Search

Nothing should become invisible.

---

## Language Support

Changing language should never:

Break layout

Overflow text

Hide content

Break buttons

---

## Tool Pages

Every tool page should include:

Title

Description

Upload Area

Processing

Result

Download

Error Handling

Loading

Help (if required)

Never remove tool functionality.

---

## Recent Files

Preserve:

History

Sorting

Filtering

Open Again

Delete

Rename (if available)

Search

---

## Empty States

Every empty page must include:

Helpful Illustration

Explanation

Primary Action

No blank screens.

---

## Error Handling

Never show generic errors.

Provide:

What happened

Why

How to fix it

Retry

---

## Loading Experience

Prefer:

Skeletons

Progress

Optimistic UI

Avoid indefinite spinners.

---

# Features That Must Never Be Removed

- Navbar
- Search
- Popular Tools
- Theme Switcher
- Language Switcher
- Upload
- Download
- AI Assistant
- Dashboard
- Workspace
- Pricing
- Settings
- Authentication
- Notifications
- History
- Recent Files
- Footer
- Responsive Layout
- Loading States
- Empty States
- Error States

---

# Regression Checklist

Before completing any task verify:

✓ Navbar works

✓ Search works

✓ Theme switching works

✓ Language switching works

✓ Upload works

✓ Processing works

✓ Download works

✓ Dashboard works

✓ AI Assistant works

✓ Pricing renders correctly

✓ Settings work

✓ Authentication works

✓ Mobile layout works

✓ Tablet layout works

✓ Desktop layout works

✓ No hidden elements

✓ No invisible text

✓ No console errors

✓ No TypeScript errors

---

# Final Product Goal

FileNova should feel like a polished, production-ready SaaS application.

Every improvement must preserve trust, usability, performance, and consistency.

Never introduce regressions while making enhancements.
# Part 5 — QA, Performance, Security & Production Release Standards

---

# Quality Assurance Philosophy

No task is complete until it has been verified.

Writing code is only 50% of the task.

The remaining 50% is validation.

Never assume the implementation works.

Always verify.

---

# Mandatory QA Process

After every completed task:

Inspect

↓

Run

↓

Verify

↓

Fix

↓

Re-test

↓

Complete

Never skip QA.

---

# Functional Testing

Verify every affected feature.

Examples:

Navigation

Buttons

Forms

Dialogs

Dropdowns

Search

Upload

Download

Workspace

Dashboard

Pricing

Authentication

Settings

Notifications

AI Assistant

History

Recent Files

Theme Switcher

Language Switcher

Nothing should break.

---

# Visual Testing

Always verify:

Spacing

Alignment

Typography

Card layout

Icons

Buttons

Images

Overflow

Visibility

Contrast

Shadows

Border radius

Glass effects

Nothing should appear visually broken.

---

# Responsive Testing

Test at:

320px

360px

375px

390px

414px

768px

1024px

1280px

1440px

1920px

Verify:

No overflow

No clipped elements

No hidden buttons

No broken grids

No broken navigation

No horizontal scrolling

---

# Light & Dark Theme Testing

Every completed task must be verified in:

✓ Light Mode

✓ Dark Mode

Inspect:

Navbar

Dropdowns

Cards

Dialogs

Workspace

Pricing

Settings

Footer

Search

Buttons

Inputs

Icons

Text

Nothing should become invisible.

---

# Accessibility Checklist

Verify:

Keyboard navigation

Tab order

Visible focus

ARIA labels

Semantic HTML

Color contrast

Reduced motion

Screen reader compatibility

WCAG 2.2 compliance where practical.

---

# Performance Standards

Every change should improve or preserve performance.

Never introduce:

Large unnecessary bundles

Duplicate rendering

Unnecessary API calls

Blocking rendering

Heavy animations

Memory leaks

Infinite loops

---

# Preferred Optimizations

Lazy loading

Dynamic imports

Route splitting

Image optimization

Font optimization

Memoization where appropriate

Caching

Debouncing

Throttling

Virtualization for large lists

---

# Animation Performance

Animations must:

Use transform and opacity when possible.

Avoid animating layout properties.

Target:

60 FPS

Avoid:

Layout thrashing

Heavy box-shadow animations

Large blur animations

Massive DOM updates

---

# Error Handling Standards

Every async operation must provide:

Loading

Success

Error

Retry

Recovery

Helpful message

Never silently fail.

---

# API Standards

Never duplicate API requests.

Handle:

Timeouts

Network failures

Validation errors

Unauthorized access

Server errors

Gracefully.

---

# Security Standards

Never expose:

Secrets

API keys

Private tokens

Environment variables

Always validate:

Uploads

Inputs

File types

File sizes

User permissions

API requests

Sanitize user input.

Never trust client-side validation alone.

---

# File Upload Standards

Validate:

Extension

MIME type

Maximum size

Duplicate uploads

Corrupted files

Display helpful feedback.

---

# Authentication Standards

Always preserve:

Sessions

Redirects

Protected routes

Logout

Password reset

OAuth

Role-based access

---

# SEO Standards

Every public page should include:

Title

Meta description

Canonical URL

Open Graph

Twitter Card

Structured data where appropriate

Readable headings

Internal links

Accessible URLs

---

# Browser Compatibility

Verify functionality in modern browsers.

Avoid browser-specific behavior unless necessary.

Gracefully degrade unsupported features.

---

# Code Review Checklist

Before finishing any task:

✓ No duplicate code

✓ No unused imports

✓ No unused variables

✓ No dead code

✓ No console logs

✓ No TODOs

✓ No commented-out code

✓ Consistent naming

✓ Proper typing

---

# Git Workflow

Work in small, focused commits.

Recommended commit format:

feat: add AI workspace improvements

fix: resolve navbar dropdown visibility

refactor: simplify upload workflow

perf: optimize dashboard rendering

style: improve pricing layout

docs: update AGENTS.md

test: verify upload functionality

Avoid large mixed commits.

---

# Regression Prevention

Before considering a task complete:

Verify that:

No feature disappeared.

No UI became hidden.

No route broke.

No dropdown broke.

No API broke.

No responsive regression occurred.

No theme regression occurred.

No accessibility regression occurred.

---

# Release Checklist

Before production deployment verify:

✓ Application builds successfully

✓ No TypeScript errors

✓ No lint errors

✓ No console errors

✓ No hydration errors

✓ No broken routes

✓ No missing assets

✓ No broken uploads

✓ No broken downloads

✓ AI Assistant functions correctly

✓ Pricing renders correctly

✓ Search works

✓ Theme switching works

✓ Language switching works

✓ Mobile navigation works

✓ Desktop navigation works

✓ Accessibility verified

✓ Performance acceptable

✓ Security review complete

---

# Definition of Done

A task is complete only when:

✓ Functionality works

✓ UI is polished

✓ Responsive behavior is verified

✓ Light mode works

✓ Dark mode works

✓ Accessibility is preserved

✓ Performance is maintained

✓ No regressions exist

✓ Code is clean

✓ Tests (manual or automated) pass

If any item above fails,

the task is NOT complete.

---

# Final Principle

Always leave the codebase better than you found it.

Prioritize:

Functionality

Quality

Maintainability

Consistency

User Experience

Never sacrifice reliability for aesthetics.

Every change should move FileNova closer to a world-class, production-ready SaaS platform.