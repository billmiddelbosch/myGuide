# Tour Builder Specification

## Overview
A multi-step tour creation experience where users set their preferences (transport mode, available time, interests), receive an AI-generated tour proposal displayed on a map, can customize by adding or removing stops, and then approve to save the tour and trigger audio generation for all POIs.

## User Flows
- User arrives from Landing Page with city pre-selected (based on GPS location)
- User selects transport mode (walk, bike, car, or public transport)
- User sets available time using a slider (e.g., 30 min to 4+ hours)
- User selects POI types via multi-select chips (e.g., History, Art, Nature, Food, Architecture)
- User taps "Generate Tour" → system creates a tour proposal with route and POIs
- User views map-focused proposal with route line and POI markers
- User taps a POI marker → detail panel shows name, photo, and description
- User can add or remove stops to customize the tour
- User approves tour → tour is saved and audio is generated for all POIs
- User can choose to start the tour immediately or save for later

## UI Requirements
- Preferences step with transport mode selector, time slider, and POI type chips
- "Generate Tour" button to request the AI-generated proposal
- Map-focused proposal view showing route line and POI markers
- POI detail panel/card appears when a marker is tapped (name, photo, description)
- Add/remove controls for individual stops
- Summary showing total stops, estimated duration, and distance
- "Approve & Save" and "Start Tour" action buttons
- Loading states during tour generation and audio generation

## Configuration
- shell: true
