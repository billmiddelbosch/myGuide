# Application Shell Specification

## Overview
cityCast uses a minimal header design that keeps focus on the content while providing essential navigation. The header contains the logo, a quick link to My Tours, and a user menu. Navigation between sections happens primarily through in-content CTAs and buttons.

## Navigation Structure
- **Logo** → Landing Page (home)
- **My Tours link** → My Tours section
- **User Menu** → Profile dropdown with settings and logout

## In-Content Navigation Flow
- Landing Page → "Get Started" / "Create Tour" buttons → Tour Builder
- Tour Builder → "Start Tour" button → Tour Experience
- Tour Builder → "Save Tour" button → My Tours
- Tour Experience → "Save Tour" button → My Tours
- My Tours → "Start Tour" on saved tour → Tour Experience

## User Menu
Location: Top right corner of header
Contents:
- User name display
- My Tours (shortcut)
- Settings
- Logout

## Layout Pattern
Minimal header with in-content navigation:
- Fixed header at top with logo, My Tours link, and user avatar
- Main content area below header
- No sidebar or bottom navigation
- CTAs and buttons within content guide users between sections

## Responsive Behavior
- **Desktop:** Full header with comfortable spacing, logo on left, My Tours link and user avatar on right
- **Tablet:** Same layout with slightly reduced spacing
- **Mobile:** Compact header, same elements with optimized touch targets

## Design Notes
- Header uses teal (primary) for the logo accent and active states
- User avatar shows first initial if no image is provided
- My Tours link uses amber (secondary) on hover
- Background uses slate (neutral) tones
- Typography: DM Sans for all text
- Dark mode supported via CSS custom properties
