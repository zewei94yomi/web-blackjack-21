import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const OutcomeOverlay: React.FC = () => {
    const { gameState, lastOutcome } = useGameStore();
    const [outcome, setOutcome] = useState<'win' | 'lose' | 'push' | 'blackjack' | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (gameState === 'resolving' && lastOutcome) {
            setOutcome(lastOutcome);
            setVisible(true);

            // Auto-hide after 3 seconds so user can bet again
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        } else {
            // Ensure it's hidden for any other state (player-turn, waiting-bet via reset, etc.)
            setVisible(false);
        }
    }, [gameState, lastOutcome]);

    const getText = () => {
        switch (outcome) {
            case 'win': return 'YOU WIN';
            case 'lose': return 'DEALER WINS';
            case 'push': return 'PUSH';
            case 'blackjack': return 'BLACKJACK!';
            default: return '';
        }
    };

    const getColor = () => {
        switch (outcome) {
            case 'win': return 'text-gold-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]';
            case 'lose': return 'text-red-600 drop-shadow-[0_0_10px_rgba(229,62,62,0.8)]';
            case 'push': return 'text-blue-400 drop-shadow-[0_0_10px_rgba(66,153,225,0.8)]';
            case 'blackjack': return 'text-purple-400 drop-shadow-[0_0_10px_rgba(159,122,234,0.8)]';
            default: return 'text-white';
        }
    };

    return (
        <AnimatePresence>
            {visible && outcome && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                    <div className="relative">
                        {/* Background flare */}
                        <motion.div
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={{ opacity: 1, rotate: 180 }}
                            transition={{ duration: 1 }}
                            className={`absolute -inset-20 bg-gradient-to-r ${outcome === 'win' ? 'from-gold-500/0 via-gold-500/20 to-gold-500/0' : 'from-black/0 via-black/50 to-black/0'} blur-3xl`}
                        />

                        <motion.h1
                            className={`text-8xl font-black italic tracking-tighter ${getColor()} stroke-black paint-order-stroke`}
                            style={{ WebkitTextStroke: '4px rgba(0,0,0,0.5)' }}
                            animate={{
                                scale: [1, 1.1, 1],
                                textShadow: [
                                    "0 0 20px rgba(255,255,255,0.1)",
                                    "0 0 40px rgba(255,255,255,0.5)",
                                    "0 0 20px rgba(255,255,255,0.1)"
                                ]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            {getText()}
                        </motion.h1>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
