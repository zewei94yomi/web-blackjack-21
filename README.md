# 🃏 Web Blackjack 21

A premium, casino-style Blackjack game built with React, TypeScript, and modern web technologies. Experience the thrill of the casino from your browser with stunning visuals, smooth animations, and immersive sound effects.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)

## ✨ Features

- 🎰 **Authentic Casino Experience** - Realistic felt table with wood rail texture and professional markings
- 🃏 **Smooth Card Animations** - Fluid dealing, flipping, and hand display powered by Framer Motion
- 💰 **Interactive Chip Betting** - Drag and click chips ($10, $25, $50, $100) to place your bets
- 🔊 **Immersive Sound Effects** - Web Audio API synthesized sounds for betting, dealing, and winning
- 📊 **Session Tracking** - Real-time game history and balance tracking
- 🎨 **Premium UI/UX** - Glass morphism effects, gold accents, and responsive design
- ⚡ **Instant Feedback** - Visual overlays for wins, losses, pushes, and blackjacks

## 🎮 Game Rules

- **Blackjack pays 3:2**
- Dealer must draw to 16 and stand on all 17s
- Table limits: $200 - $2,000
- Standard actions: Hit, Stand, Double Down

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/web-blackjack-21.git
cd web-blackjack-21

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Components |
| **TypeScript** | Type Safety |
| **Vite 7** | Build Tool & Dev Server |
| **Zustand** | State Management |
| **Framer Motion** | Animations |
| **Tailwind CSS 4** | Styling |
| **Web Audio API** | Sound Effects |

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Table.tsx       # Main game table layout
│   ├── Card.tsx        # Playing card component
│   ├── HandDisplay.tsx # Card hand visualization
│   ├── Controls.tsx    # Hit, Stand, Double buttons
│   ├── Chip.tsx        # Betting chip component
│   ├── ChipRack.tsx    # Chip selection rack
│   ├── BettingSpot.tsx # Bet placement area
│   ├── OutcomeOverlay.tsx # Win/Loss display
│   └── StatsModal.tsx  # Game statistics
├── store/
│   └── useGameStore.ts # Zustand game state
├── engine/             # Game logic
└── utils/
    └── audio.ts        # Sound effect manager
```

## 🎯 How to Play

1. **Place Your Bet** - Click on chips in the rack to add to your bet
2. **Deal** - Press the Deal button to start the hand
3. **Play Your Hand** - Choose to Hit, Stand, or Double Down
4. **Collect Winnings** - Win pays 1:1, Blackjack pays 3:2

## 📜 License

MIT License - feel free to use this project for learning or personal use.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

<p align="center">
  Made with ♠️ ♥️ ♣️ ♦️
</p>
