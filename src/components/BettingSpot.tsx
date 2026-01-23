import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

export const BettingSpot: React.FC = () => {
    const { playerHands, gameState, sideBets, sideBetOutcome } = useGameStore();

    const currentBet = playerHands[0]?.bet || 0;

    return (
        <div className="relative flex justify-center items-center gap-4 sm:gap-8 z-10">

            {/* 21+3 Side Bet Target */}
            <div
                data-bet-target="poker3"
                className={`
                    relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 
                    flex items-center justify-center transition-all cursor-pointer
                    ${sideBets.poker3 > 0 ? 'border-gold-500 bg-black/40' : 'border-white/10 bg-black/20 hover:bg-white/5'}
                `}
            >
                <div className="absolute -top-4 sm:-top-5 text-[8px] sm:text-[10px] text-white/50 font-bold tracking-wider">21+3</div>
                {sideBets.poker3 > 0 ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 border border-white/50 shadow-lg flex items-center justify-center text-[10px] font-bold text-white relative">
                        {sideBets.poker3}
                        {sideBetOutcome?.poker3 && sideBetOutcome.poker3.win > 0 && (
                            <motion.div
                                initial={{ y: 0, opacity: 0 }}
                                animate={{ y: -20, opacity: 1 }}
                                className="absolute -top-6 text-green-400 font-bold whitespace-nowrap text-xs shadow-black drop-shadow-md"
                            >
                                +{sideBetOutcome.poker3.win}
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="text-[10px] text-white/20 text-center leading-none select-none">POKER<br />3</div>
                )}
            </div>

            {/* Main Bet Target */}
            <div
                data-bet-target="main"
                className={`
                relative flex justify-center items-center
                w-20 h-20 sm:w-28 sm:h-28 
                rounded-full border-4 flex items-center justify-center relative select-none
                transition-all duration-300
                ${currentBet > 0 ? 'border-gold-500/50 bg-black/40' : 'border-gold-400/30'}
                `}
            >
                <div className="absolute inset-0 rounded-full border border-gold-400/10 scale-90" />

                {currentBet > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentBet} // Re-animate on bet change
                        className="flex flex-col items-center z-10"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 border-4 border-dashed border-white shadow-2xl flex items-center justify-center text-black font-black font-serif text-sm sm:text-lg">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 bg-white/90 rounded-full flex items-center justify-center shadow-inner text-[10px] sm:text-sm">
                                    ${currentBet}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentBet === 0 && gameState === 'waiting-bet' && (
                    <span className="text-white/20 text-xs sm:text-sm font-bold tracking-widest uppercase animate-pulse absolute pointer-events-none">
                        Place Bet
                    </span>
                )}

                {/* Deal Button Overlay */}
                {currentBet > 0 && gameState === 'waiting-bet' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute z-20"
                    >
                        <button
                            onClick={() => useGameStore.getState().deal()}
                            className="bg-gold-500 hover:bg-gold-400 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-pulse hover:animate-none active:scale-95 transition-all border-2 border-white/20"
                        >
                            DEAL
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Perfect Pairs Side Bet Target */}
            <div
                data-bet-target="perfectPairs"
                className={`
                    relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 
                    flex items-center justify-center transition-all cursor-pointer
                    ${sideBets.perfectPairs > 0 ? 'border-gold-500 bg-black/40' : 'border-white/10 bg-black/20 hover:bg-white/5'}
                `}
            >
                <div className="absolute -top-4 sm:-top-5 text-[8px] sm:text-[10px] text-white/50 font-bold tracking-wider">PAIRS</div>
                {sideBets.perfectPairs > 0 ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 border border-white/50 shadow-lg flex items-center justify-center text-[10px] font-bold text-white relative">
                        {sideBets.perfectPairs}
                        {sideBetOutcome?.perfectPairs && sideBetOutcome.perfectPairs.win > 0 && (
                            <motion.div
                                initial={{ y: 0, opacity: 0 }}
                                animate={{ y: -20, opacity: 1 }}
                                className="absolute -top-6 text-green-400 font-bold whitespace-nowrap text-xs shadow-black drop-shadow-md"
                            >
                                +{sideBetOutcome.perfectPairs.win}
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="text-[10px] text-white/20 text-center leading-none select-none">PERFECT<br />PAIR</div>
                )}
            </div>

        </div>
    );
};
