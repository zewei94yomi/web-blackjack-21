import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

export const BettingSpot: React.FC = () => {
    const { playerHands, gameState } = useGameStore();

    const currentBet = playerHands[0]?.bet || 0; // MVP: Show main hand bet

    return (
        <div className="relative flex justify-center items-center">
            {/* Printed Felt Marking */}
            <div className="w-28 h-28 rounded-full border-4 border-gold-400/30 flex items-center justify-center relative select-none">
                <div className="absolute inset-0 rounded-full border border-gold-400/10 scale-90" />

                {currentBet > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentBet}
                        className="flex flex-col items-center z-10"
                    >
                        {/* Stack of Chips representation (visual abstraction) */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 border-4 border-dashed border-white shadow-2xl flex items-center justify-center text-black font-black font-serif text-lg">
                                {/* Inner Inlay */}
                                <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow-inner text-sm">
                                    ${currentBet}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentBet === 0 && gameState === 'waiting-bet' && (
                    <div className="text-gold-400/30 text-[10px] tracking-[0.2em] uppercase text-center font-bold animate-pulse">
                        Place Bet
                    </div>
                )}
            </div>
        </div>
    );
};
