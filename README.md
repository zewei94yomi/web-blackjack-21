# 🃏 Web Blackjack 21 - Pro Edition

A professional-grade, high-fidelity Blackjack application built with **React 19**, **TypeScript**, and **Framer Motion**. This isn't just a simple game—it's a complete casino simulation featuring advanced side-bet logic, strict dealer protocols, and a premium "Vegas-style" user interface.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)

---

## ✨ Professional Features

### 🎰 Immersive Casino Atmosphere
- **Premium Felt Texture**: A high-resolution green felt table with wood-grain rail textures.
- **Table Felt Markings**: 2x scaled, high-clarity payout charts for **21+3** and **Perfect Pairs** built directly into the table UI.
- **Physical Feedback**: Animated chips, smooth card transitions, and synthesized audio for dealing, betting, and winning.

### 🃏 Advanced Game Engine
- **Multi-Hand Logic**: Full support for **Splits** (including Split Aces restrictions) and **Double Downs**.
- **Side Bets (Pro-Level)**:
    - **21+3**: Payouts for Flush, Straight, 3-of-a-Kind, Straight Flush, and Suited Trips.
    - **Perfect Pairs**: Mixed, Colored, and Perfect Pair payouts.
- **Even Money Rule**: Authentic handling of player Blackjack vs Dealer Ace/10.
- **Smart Resolution**: 
    - Immediate settlement on player bus.
    - Full dealer turn play-through on stand for transparent "closure".
    - Intentional "dramatic pauses" between hand results.

### 🛡️ Robust Architecture
- **Stable UI Layout**: Uses **Absolute Pinning** for critical HUD elements (Balance, Chips, Session Log), ensuring zero jittering regardless of screen size or message length.
- **Atomic State Management**: Powered by **Zustand** and a dedicated `BlackjackEngine` class for high consistency between UI and logic.
- **Audio Manager**: Synthesized and sampled audio effects with automatic state cleanup.

---

## 🎮 Pro Rules
- **6-Deck Shoe**: Standard casino randomization.
- **Push on Ties**: Equal totals (and blackjack vs. blackjack) return the bet — standard casino rules.
- **Split on Matching Ranks**: Only exact rank pairs (10-10, A-A) may be split.
- **Table Limits**: $200 - $2,000 per hand.
- **Dynamic Payouts**: Standard Win 1:1, Blackjack 3:2, Even Money 1:1.
- **Progress Saved**: Balance, stats, and history persist in your browser via `localStorage`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **npm** or **pnpm**

### Installation
```bash
# Clone the repository
git clone https://github.com/zewei94yomi/web-blackjack-21.git
cd web-blackjack-21

# Install dependencies
npm install

# Launch the Vegas floor
npm run dev
```

The game will be available at [http://localhost:5173](http://localhost:5173).

---

## 🛠️ Tech Stack Details

- **React 19**: Utilizing the latest concurrent rendering features.
- **Zustand**: Lightweight, high-performance state management for the game loop.
- **Framer Motion**: Physical-based animations for cards and UI overlays.
- **Tailwind CSS 4**: Modern utility-first styling with high-performance CSS-in-JS.
- **TypeScript**: Strict typing across the engine and UI components.

---

## 📁 Key Project Components

| Component | Responsibility |
|-----------|----------------|
| `BlackjackEngine.ts` | The core "Heart" - manages deck, dealing, and rule enforcement. |
| `useGameStore.ts` | The "Brain" - syncs engine state with React and persists history. |
| `Table.tsx` | The "Body" - coordinates the physical layout and absolute UI anchors. |
| `HandDisplay.tsx` | Visualizes the player and dealer hands with dynamic result badges. |
| `ChipRack.tsx` | Stabilized betting interface with floating status indicators. |

---

## 📜 License
MIT © 2026. Built with precision for the ultimate gaming experience.

<p align="center">
  Made with ♠️ ♥️ ♣️ ♦️
</p>
