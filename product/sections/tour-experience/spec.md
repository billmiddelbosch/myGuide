# Tour Experience Specification

## Overview
De Tour Experience begeleidt gebruikers door hun gepersonaliseerde tour met twee afwisselende modes: navigatie naar de volgende stop en het beleven van de stop met audio. De sectie combineert Google Maps navigatie met AI-gegenereerde audio-verhalen.

## User Flows
- Navigatie-mode: Google Maps toont route naar volgende stop, met kleine visual preview van de bestemming als overlay
- Aankomst detectie: Automatische GPS-detectie wanneer gebruiker binnen bereik is, plus handmatige "Ik ben er" knop
- Stop-mode: Bij aankomst verschijnt grote visual, beschrijving van de locatie, en audio player om het verhaal af te spelen
- Volgende stop: CTA knop om navigatie naar volgende locatie te starten
- Voortgang: Progress bar toont waar gebruiker is in de tour
- Tour controls: Mogelijkheid om tour te pauzeren of volledig te stoppen
- Einde tour: Feedback scherm met rating/review optie na voltooiing

## UI Requirements
- Fullscreen Google Maps met kleine visual overlay tijdens navigatie
- Stop detail view met grote afbeelding, tekst beschrijving en audio player
- Progress bar zichtbaar in beide modes
- Pauze en stop knoppen toegankelijk
- "Ik ben er" knop als fallback voor GPS
- "Volgende stop" CTA na audio

## Configuration
- shell: true
