# Admin Specification

## Overview
A simple admin page within the app shell, protected by a basic PIN or password. It allows admins to manually add commercial tour stops to DynamoDB (using the same fields as AI-generated stops, with no mandatory fields for MVP) and to search and link Viator products as affiliate cards to specific cities or stops. In future versions, commercial stop data will be inserted via an incoming API.

## User Flows
- Admin navigates to `/admin` and enters a PIN/password to unlock the interface
- Admin adds a commercial stop by selecting a city, filling in stop fields (name, description, category, coordinates — same as AI stops, all optional for MVP), and saving to DynamoDB
- Admin manages existing commercial stops (view list, edit, delete)
- Admin searches Viator by keyword to find a product, previews the result, and links it to a specific city or stop
- Admin manages existing affiliate links (view, unlink)

## UI Requirements
- Two tabs or sections: "Commercial Stops" and "Affiliate Links"
- Commercial stops: form with city selector and stop fields, list of existing commercial stops per city
- Affiliate links: keyword search input, Viator results list with product card preview, city/stop selector to link to, list of active affiliate links
- PIN/password gate on page load before showing any admin content

## Configuration
- shell: true
