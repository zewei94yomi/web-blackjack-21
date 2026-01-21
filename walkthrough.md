# Web Blackjack 21 - Walkthrough

## Overview
This is a single-player (1v1) Blackjack web application built with React, TypeScript, Tailwind CSS, and Framer Motion. It features a skeumorphic design with green felt textures and smooth animations.

## Key Features
- **Core Logic Engine**: Pure TypeScript implementation of Blackjack rules (splitting, doubling, soft aces).
- **Interactive UI**: Drag-and-drop betting chips, animated card dealing.
- **Audio Experience**: Sound effects for betting, dealing, and winning.
- **Game State Management**: Powered by Zustand for reactive updates.
- **Responsive Design**: Adapts to different screen sizes.

## How to Run
1. ** Install Dependencies**
   ```bash
   npm install
   ```
2. **Start Dev Server**
   ```bash
   npm run dev
   ```
3. **Build for Production**
   ```bash
   npm run build
   ```

## How to Play
1. **Place Bet**: Drag chips from the bottom rack to the center "Drop Zone" or click chips to add to bet.
2. **Deal**: The game starts automatically once a bet is placed (or you can add a "Deal" button if preferred, currently auto-starts on drag drop if logic permits, or click chips). *Note: Logic in ChipRack allows clicking to place bet and start.*
3. **Player Turn**:
   - **Hit**: Take another card.
   - **Stand**: End turn.
   - **Double**: Double bet and take exactly one card.
   - **Split**: If you have a pair, split into two hands.
4. **Dealer Turn**: Dealer plays according to rules (Stand on Soft 17).
5. **Result**: Win/Loss is calculated and balance updated.
6. **Next Round**: When the round ends, simply place a new bet to start the next round!
7. **Game Over**: If balance drops below $100, the game ends. Click "Start New Career" to reset.

## Project Structure
- `src/engine`: Core game logic (Card, Deck, Hand, BlackjackEngine).
- `src/store`: State management (useGameStore).
- `src/components`: UI Components (Table, Card, Chip, etc.).
