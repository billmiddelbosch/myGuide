# Data Model

## Entities

### User
A traveler who creates and takes audio tours. Users can build personalized tours and save them for offline access.

### Tour
A personalized audio tour created by a user for a specific city and duration. Contains a sequence of stops based on the user's selected interests and available time.

### Stop
A point of interest within a tour that has AI-generated audio narration. Each stop represents a location the user will visit during their tour.

### City
A location where tours can be created. Contains a description of the city for display on address landing pages. Cities contain points of interest that can be included in tours.

### POICategory
A category type for points of interest such as history, architecture, food, art, or nature. Users select categories to personalize their tour content.

### Province
A geographic region containing multiple cities. Provides regional context on address landing pages.

### Street
A street within a city, with a descriptive text about the street's character and history. Displayed on address landing pages for SEO and neighborhood context.

### Address
A specific address (street + house number) that serves as an SEO landing page. Inherits descriptive context from its Street and City. Coordinates are retrieved dynamically via Google Maps geocoding in the frontend.

### CommercialStop
A curated tour stop managed by an admin, stored in DynamoDB with commercial intent. Always prioritized over AI-generated stops when available for a city. Visually identical to regular stops in the tour experience.

### AffiliateLink
A Viator product associated with a City or Stop. Displays product information retrieved from the Viator API (title, description, images, price, reviews) and includes a direct booking option within myGuide via the Viator booking flow.

## Relationships

- User has many Tours
- Tour belongs to User
- Tour belongs to City
- Tour has many Stops
- Tour has many POICategories (selected interests)
- Stop belongs to Tour
- Stop belongs to POICategory
- Province has many Cities
- City belongs to Province
- City has many Streets
- City has many Stops
- Street belongs to City
- Street has many Addresses
- Address belongs to Street
- City has many CommercialStops
- CommercialStop belongs to City
- CommercialStop belongs to POICategory
- City has many AffiliateLinks
- Stop has many AffiliateLinks
- AffiliateLink belongs to City or Stop
