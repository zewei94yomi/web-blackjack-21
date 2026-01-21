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
        <div className="flex gap-6 items-center">
            {(gameState === 'waiting-bet' || gameState === 'resolving') ? (
                <>
                    <span className="text-white font-bold mr-4 select-none">
                        {gameState === 'resolving' ? 'New Bet:' : 'Place Bet:'}
                    </span>
                    {chips.map(val => (
                        <Chip key={val} value={val} />
                    ))}
                </>
            ) : (
                <div className="text-white/50 italic">Game in progress...</div>
            )}

            {gameState === 'resolving' && (
                <button
                    onClick={() => useGameStore.getState().engine.placeBet(0)}
                    className="hidden"
                />
            )}

            {gameState === 'resolving' && (
                <div className="ml-8 animate-bounce">
                    <span className="text-white">Place new bet to start next round</span>
                </div>
            )}
        </div>
    );
};
