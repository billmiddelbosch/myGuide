# Landing Page Specification

## Overview
A mobile-first landing page featuring a full-screen hero image of the user's current city with an attractive overlay tile encouraging tour creation. Logged-in users also see quick access to their saved tours. Scrolling down reveals feature highlights, a "how it works" guide, testimonials, and an inline audio preview from the user's city.

## User Flows
- Visitor arrives → sees full-screen hero with city image and overlay tile → taps primary CTA → goes to Tour Builder
- User taps "Select another city" → chooses different city → Tour Builder opens for that city
- Logged-in user arrives → sees hero with overlay tile + "My Tours" shortcut
- User swipes/scrolls down → discovers feature highlights, how it works, testimonials, and audio preview
- User taps audio player card → listens to sample narration from their city

## UI Requirements
- Full-screen hero section with location-based city background image
- Attractive overlay tile containing:
  - Header: "Ontdek [City Name]" (location-based)
  - Social proof: tour count ("199+ personen hebben eigen tour gemaakt") and/or star ratings
  - Primary CTA button: Start building your tour
  - Secondary CTA link: Select another city
- "My Tours" shortcut (logged-in users only)
- Swipe indicator at bottom of hero section
- Feature highlights section with icons, descriptions, and audio elements
- "How it works" section with step-by-step visual guide
- Testimonials/social proof section
- Inline audio player card with city-specific sample narration

## Configuration
- shell: true
