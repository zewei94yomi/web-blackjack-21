import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const GameOverModal: React.FC = () => {
    const { isGameOver, stats, restartGame } = useGameStore();

    if (!isGameOver) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-900 border-2 border-gold-500 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

                    <h2 className="text-4xl font-serif font-bold text-red-500 mb-2 relative z-10 drop-shadow-lg tracking-widest">GAME OVER</h2>
                    <p className="text-gray-400 mb-6 text-sm relative z-10">You've run out of funds.</p>

                    <div className="space-y-4 mb-8 relative z-10 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-gray-400 text-sm uppercase tracking-wider">Rounds Survived</span>
                            <span className="text-white font-mono text-xl">{stats.roundsSurvived}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-gray-400 text-sm uppercase tracking-wider">Peak Balance</span>
                            <span className="text-gold-400 font-mono text-xl">${stats.peakBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-gray-400 text-sm uppercase tracking-wider">Best Win</span>
                            <span className="text-green-400 font-mono text-xl">+${stats.maxSingleRoundProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-400 text-sm uppercase tracking-wider">Record</span>
                            <div className="flex gap-3 text-sm font-bold">
                                <span className="text-green-500">{stats.wins}W</span>
                                <span className="text-red-500">{stats.losses}L</span>
                                <span className="text-gray-400">{stats.pushes}P</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={restartGame}
                        className="relative z-10 w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-black uppercase tracking-widest text-lg rounded-full shadow-[0_0_20px_rgba(236,201,75,0.4)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        Play Again
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
