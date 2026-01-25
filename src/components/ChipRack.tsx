import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Chip } from './Chip';

export const ChipRack: React.FC = () => {
    const { gameState, isGameOver, restartGame } = useGameStore();
    const chips = [200, 500, 1000, 2000];

    if (isGameOver) {
        return (
            <div className="flex flex-col items-center animate-pulse">
                <div className="text-red-500 font-bold mb-2 uppercase tracking-widest text-sm">Bankrupt</div>
                <button
                    onClick={restartGame}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-[0_0_15px_rgba(229,62,62,0.6)] border border-red-400 transition-all hover:scale-105 active:scale-95"
                >
                    RESTART GAME
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center h-12 sm:h-16 w-[180px] sm:w-[280px]">
            {/* Status Tooltip (Pinned relative to the rack) */}
            <div className="absolute -top-6 sm:-top-8 left-0 sm:left-auto sm:right-0 whitespace-nowrap pointer-events-none">
                {gameState === 'waiting-bet' && (
                    <div className="text-gold-400/80 text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse">
                        Place Your Bet
                    </div>
                )}
                {gameState === 'resolving' && (
                    <div className="text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-bounce">
                        Place new bet to start next round
                    </div>
                )}
            </div>

            <div className="flex gap-2 sm:gap-4 items-center bg-black/40 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 border border-white/10 ring-1 ring-white/5">
                {(gameState === 'waiting-bet' || gameState === 'resolving') ? (
                    chips.map(val => (
                        <Chip key={val} value={val} />
                    ))
                ) : (
                    <div className="px-4 text-white/30 italic text-[10px] sm:text-sm font-medium tracking-wide whitespace-nowrap">
                        Game in progress...
                    </div>
                )}
            </div>
        </div>
    );
};
