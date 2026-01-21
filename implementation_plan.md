# Implementation Plan - Web Blackjack 21

## Goal Description
Develop a web-based, single-player (1v1) Blackjack game with a high-quality, skeumorphic UI using React, TypeScript, and Framer Motion. The logic must be strictly separated from the UI.

## User Review Required
No major breaking changes or review items initially. The requirements in `dev.md` are quite specific.

## Proposed Changes

### Tech Stack Setup
- **Build Tool:** Vite
- **Framework:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS
- **State:** Zustand
- **Animation:** Framer Motion

### Architecture

#### Core Logic (`/src/engine`)
Pure TypeScript classes, independent of React.
- `Card.ts`: Represents a single card (suit, rank, value).
- `Deck.ts`: Manages 6 decks, shuffling, and dealing.
- `Hand.ts`: Manages a hand of cards, calculates scores (soft/hard), checks for bust/blackjack.
- `BlackjackEngine.ts`: The game manager using a state machine pattern (`waiting-bet`, `dealing`, `player-turn`, `dealer-turn`, `resolving`).

#### State Store (`/src/store`)
- `useGameStore.ts`: Binds `BlackjackEngine` to the UI using Zustand. Updates React state based on engine events.

#### UI Components (`/src/components`)
- `Table.tsx`: Main container with the green felt background.
- `Card.tsx`: Visual representation of a card (SVG/CSS).
- `HandDisplay.tsx`: Shows dealer's and player's hands.
- `Chip.tsx`: Draggable chip component.
- `BettingArea.tsx`: Drop zone for chips.
- `Controls.tsx`: Action buttons.
- `StatsModal.tsx`: Game over screen.

## Verification Plan

### Automated Tests
- We will rely on TypeScript for type safety.
- We can write simple node scripts or use Vitest if needed to test the `calculateScore` logic in `Hand.ts`, as this is critical (Aces handling).

### Manual Verification
1. **Game Flow:** Verify Betting -> Dealing -> Player Actions -> Dealer Actions -> Payout.
2. **Rules:** Check Split, Double, and Blackjack payouts (3:2). Check Dealer Soft 17 rule.
3. **UI/UX:** Check animations, drag & drop smoothness, and responsiveness.
