# Tour Stop Pages Specification

## Overview
SEO-optimized landing pages for individual cityCast tour stops, designed to rank highly in search results when users look up these locations. Each page displays the stop's name, description, a prominent audio player, an interactive map with nearby cityCast stops, and optional city information — with CTAs driving users into the tour builder and landing page.

## User Flows
- User arrives from a search engine on `/:stad/:stopName`
- User reads the stop description and tour type category
- User listens to the stop's audio via a prominent audio player
- User explores the interactive map showing this stop and other nearby cityCast stops in the same city
- User expands the collapsible city info section for more context
- User clicks the primary CTA ("Maak een tour") → tour builder for that city
- User clicks the secondary CTA → cityCast landing page

## UI Requirements
- Single scrollable page layout (standalone, no app shell)
- Hero section with stop name, city, and tour type
- Prominent styled audio player section as a key page feature
- Stop description section
- Interactive map showing the stop location and other nearby cityCast stops
- Collapsible city information section (when city data is available)
- Primary CTA button linking to the tour builder for that city
- Secondary CTA linking to the cityCast landing page
- cityCast branding throughout for brand awareness
- Footer with cityCast branding

## Configuration
- shell: false
