# cityCast

## Description
cityCast is a clean, easy-to-use webapp that lets travelers create personalized audio tours tailored to their available time and interests. Using AI-generated narration and smart route planning, users can explore any city on their own terms - at a fraction of the cost of traditional guided tours.

## Problems & Solutions

### Problem 1: Existing tours aren't personal
cityCast lets you build a tour around your interests and curiosities, not a generic script.

### Problem 2: Audio tours are too expensive
Affordable pricing makes personalized audio tours accessible to every traveler.

### Problem 3: Pre-set tours don't fit your schedule
Time-based planning ensures your tour fits the hours you actually have available.

### Problem 4: No organic discovery channel
Dynamic, SEO-optimized address pages create thousands of unique, indexable landing pages targeting specific address searches to capture organic traffic.

### Problem 8: No revenue model
Premium commercial stops and Viator affiliate cards create monetization opportunities without disrupting the user experience. Admin-curated stops are always prioritized when available, giving commercial partners guaranteed placement.

### Problem 9: Address-pages and tour-stop-pages have no conversion layer
Inline Viator product cards surface bookable experiences relevant to each location, generating affiliate booking revenue from high-intent visitors.

### Problem 5: Cold traffic has no context
Address landing pages show rich neighborhood info — street descriptions, city highlights, nearby attractions — that builds trust and interest before routing visitors to the tour experience.

### Problem 6: Visitors can't plan around the weather
Tour stop pages show a live weather widget (current conditions + multi-day forecast) powered by the Open-Meteo API, based on the stop's coordinates — helping users decide when to go or what to bring.

### Problem 7: Map previews feel heavy or limited on stop pages
A static map loads instantly on each stop page with a clear expand button to open the full interactive map — balancing performance with usability.

## Key Features
- Tour builder based on current location or any city
- Time-based planning (tell it how long you have, get a tour that fits)
- POI type selection (choose what interests you: history, architecture, food, art, nature, etc.)
- AI-generated audio narration
- Smart route assistance
- Mobile-first experience with GPS guidance
- Offline download for areas without connectivity
- Dynamic address landing pages with SEO meta tags at /:stad/:straat/:huisnummer
- Street and city descriptions from database
- Nearby tour stops with descriptions on address pages
- "Explore this neighborhood" CTA routing to tour builder
- Abbreviated landing page sections (testimonials, how it works) for conversion
- Admin page (`/admin` route) for managing commercial stops and affiliate links
- Premium commercial tour stops in DynamoDB with `isCommercial: true` flag, always prioritized over AI-generated suggestions when available for a city
- Commercial stops visually identical to AI-generated stops (no special badge or treatment)
- Viator-powered affiliate product cards displayed inline on address-pages and tour-stop-pages
- Viator API integration via Lambda: attraction search, product listings, and product detail
- Weather widget on tour stop pages (current + multi-day forecast via Open-Meteo API, no API key required)
- Static map preview per stop with expand-to-interactive option
