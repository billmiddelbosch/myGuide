# Address Pages Specification

## Overview
SEO-optimized landing pages for individual addresses that satisfy the search intent of users looking up a specific address. Each page displays a rich address profile with all available data, an interactive map with nearby POIs and tour stops, and collapsible content sections. The primary goal is to route users to the cityCast landing page or build brand awareness.

## User Flows
- User arrives from a search engine on `/:stad/:straat/:huisnummer`
- User views address details (street, house number, postal code, city, municipality, province, neighborhood)
- User expands collapsible sections to see more detail (neighborhood description, street history, area characteristics)
- User explores the interactive map with nearby POIs (restaurants, museums, parks, transit) and cityCast tour stops
- User clicks the primary CTA ("Explore this neighborhood") → cityCast landing page
- User clicks an affiliate link → external partner site (partners TBD)

## UI Requirements
- Single scrollable page layout
- Address header section with key details prominently displayed
- Collapsible "more info" sections to progressively reveal detailed content (neighborhood descriptions, historical context, area data)
- Interactive map (pan/zoom) showing the address location, nearby POIs of varied types, and cityCast tour stops
- Prominent primary CTA button linking to the cityCast landing page
- Secondary affiliate link placements (partners to be determined, placeholder spots)
- cityCast branding present throughout for brand awareness
- All available data from the database and public sources displayed

## Configuration
- shell: false
