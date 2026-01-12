# Data Model

## Entities

### User
A traveler who creates and takes audio tours. Users can build personalized tours and save them for offline access.

### Tour
A personalized audio tour created by a user for a specific city and duration. Contains a sequence of stops based on the user's selected interests and available time.

### Stop
A point of interest within a tour that has AI-generated audio narration. Each stop represents a location the user will visit during their tour.

### City
A location where tours can be created. Cities contain points of interest that can be included in tours.

### POICategory
A category type for points of interest such as history, architecture, food, art, or nature. Users select categories to personalize their tour content.

## Relationships

- User has many Tours
- Tour belongs to User
- Tour belongs to City
- Tour has many Stops
- Tour has many POICategories (selected interests)
- Stop belongs to Tour
- Stop belongs to POICategory
