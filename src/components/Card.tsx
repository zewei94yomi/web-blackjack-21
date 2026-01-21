import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardModel } from '../engine/Card';

interface CardProps {
    card?: CardModel;
    hidden?: boolean;
    index: number;
}

export const Card: React.FC<CardProps> = ({ card, hidden, index }) => {
    const isRed = card?.suit === 'hearts' || card?.suit === 'diamonds';

    const getSuitIcon = (suit: string) => {
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '?';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -100, x: -100, rotate: Math.random() * 40 - 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, x: 0, rotate: crypto.getRandomValues(new Uint32Array(1))[0] % 4 - 2, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: index * 0.1 }}
            className={`
        relative 
        w-20 h-32 sm:w-24 sm:h-36 md:w-32 md:h-48 
        rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.3),0_10px_20px_rgba(0,0,0,0.2)] 
        ${hidden ? 'bg-[#003399]' : 'bg-[#fdfdfd]'}
        flex flex-col justify-between p-2.5
        select-none transform-gpu
        border-[0.5px] border-black/10 origin-bottom-left
      `}
            style={{ marginLeft: index > 0 ? 'clamp(-3rem, -4rem, -5rem)' : '0' }}
        >
            {!hidden && card && (
                <>
                    {/* Top Corner */}
                    <div className={`flex flex-col items-center leading-none absolute top-1.5 left-1.5 ${isRed ? 'text-poker-red' : 'text-poker-black'}`}>
                        <div className="text-2xl font-bold tracking-tighter">{card.rank}</div>
                        <div className="text-xl -mt-1">{getSuitIcon(card.suit)}</div>
                    </div>

                    {/* Center Suit */}
                    <div className={`absolute inset-0 flex justify-center items-center text-6xl opacity-100 ${isRed ? 'text-poker-red' : 'text-poker-black'}`}>
                        {getSuitIcon(card.suit)}
                    </div>

                    {/* Bottom Corner (Rotated) */}
                    <div className={`flex flex-col items-center leading-none absolute bottom-1.5 right-1.5 rotate-180 ${isRed ? 'text-poker-red' : 'text-poker-black'}`}>
                        <div className="text-2xl font-bold tracking-tighter">{card.rank}</div>
                        <div className="text-xl -mt-1">{getSuitIcon(card.suit)}</div>
                    </div>
                </>
            )}

            {/* Pattern for Card Back */}
            {hidden && (
                <div className="absolute inset-1 rounded bg-[#2255bb] border border-white/50 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%),
                                          repeating-linear-gradient(135deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)`,
                        backgroundSize: "10px 10px"
                    }} />
                    <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center bg-[#003399] relative z-10 shadow-lg">
                        <span className="text-white/80 font-serif font-bold italic text-sm">CASINO</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
