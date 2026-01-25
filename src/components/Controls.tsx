import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const Controls: React.FC = () => {
    const { gameState, hit, stand, double, split, takeEvenMoney, declineEvenMoney, playerHands, currentHandIndex, balance } = useGameStore();

    if (gameState !== 'player-turn' && gameState !== 'offering-even-money') return null;

    if (gameState === 'offering-even-money') {
        return (
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-gold-200 font-bold text-sm sm:text-lg uppercase tracking-widest mb-2 px-4 py-1 bg-black/60 rounded-full border border-gold-500/30">
                    Even Money?
                </div>
                <div className="flex gap-4 sm:gap-8">
                    <button
                        onClick={takeEvenMoney}
                        className="group relative px-6 py-3 sm:px-12 sm:py-4 rounded-full font-black text-white tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(212,175,55,0.6)] border-2 border-gold-400 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-500 to-gold-900 group-hover:from-gold-400 group-hover:to-gold-800" />
                        <span className="relative z-10 drop-shadow-md text-sm sm:text-base">TAKE 1:1</span>
                    </button>

                    <button
                        onClick={declineEvenMoney}
                        className="group relative px-6 py-3 sm:px-12 sm:py-4 rounded-full font-black text-white tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-2 border-white/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-gray-600 group-hover:to-gray-800" />
                        <span className="relative z-10 drop-shadow-md text-sm sm:text-base">DECLINE</span>
                    </button>
                </div>
            </div>
        );
    }

    const currentHand = playerHands[currentHandIndex];
    const canSplit = currentHand.cards.length === 2 && currentHand.cards[0].rank === currentHand.cards[1].rank && balance >= currentHand.bet;
    const canDouble = currentHand.cards.length === 2 && balance >= currentHand.bet;

    return (
        <div className="flex gap-2 sm:gap-6 mt-0 sm:mt-8 scale-90 sm:scale-100 origin-bottom">
            <button
                onClick={hit}
                className="group relative px-4 py-2 sm:px-8 sm:py-3 rounded-full font-black text-white tracking-wider overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(72,187,120,0.5)] border-2 border-green-400/50 text-xs sm:text-base"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-900 group-hover:from-green-400 group-hover:to-green-800 transition-colors" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-sm" />
                <span className="relative z-10 drop-shadow-md">HIT</span>
            </button>

            <button
                onClick={stand}
                className="group relative px-4 py-2 sm:px-8 sm:py-3 rounded-full font-black text-white tracking-wider overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,101,101,0.5)] border-2 border-red-400/50 text-xs sm:text-base"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-900 group-hover:from-red-400 group-hover:to-red-800 transition-colors" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-sm" />
                <span className="relative z-10 drop-shadow-md">STAND</span>
            </button>

            <button
                onClick={double}
                disabled={!canDouble}
                className={`group relative px-4 py-2 sm:px-8 sm:py-3 rounded-full font-black tracking-wider overflow-hidden transition-all border-2 text-xs sm:text-base
                    ${canDouble
                        ? 'text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(236,201,75,0.5)] border-yellow-400/50 cursor-pointer'
                        : 'text-gray-400 border-gray-600 cursor-not-allowed opacity-40'}
                `}
            >
                <div className={`absolute inset-0 bg-gradient-to-br transition-colors ${canDouble ? 'from-yellow-500 to-yellow-800 group-hover:from-yellow-400 group-hover:to-yellow-700' : 'from-gray-700 to-gray-900'}`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-sm" />
                <span className="relative z-10 drop-shadow-md">DOUBLE</span>
            </button>

            <button
                onClick={split}
                disabled={!canSplit}
                style={{ display: canSplit ? 'block' : 'none' }} // Hide on mobile if not usable to save space? Prefer keeping layout stable but can hide.
                className={`group relative px-4 py-2 sm:px-8 sm:py-3 rounded-full font-black tracking-wider overflow-hidden transition-all border-2 text-xs sm:text-base
                    ${canSplit
                        ? 'text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(66,153,225,0.5)] border-blue-400/50 cursor-pointer'
                        : 'text-gray-400 border-gray-600 cursor-not-allowed opacity-40'}
                `}
            >
                <div className={`absolute inset-0 bg-gradient-to-br transition-colors ${canSplit ? 'from-blue-500 to-blue-800 group-hover:from-blue-400 group-hover:to-blue-700' : 'from-gray-700 to-gray-900'}`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-sm" />
                <span className="relative z-10 drop-shadow-md">SPLIT</span>
            </button>
        </div>
    );
};
