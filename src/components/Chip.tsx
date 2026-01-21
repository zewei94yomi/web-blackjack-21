import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface ChipProps {
    value: number;
}

export const Chip: React.FC<ChipProps> = ({ value }) => {
    const { placeBet } = useGameStore();

    const getColor = (val: number) => {
        switch (val) {
            case 200: return 'bg-gradient-to-br from-green-600 to-green-800 border-green-400';
            case 500: return 'bg-gradient-to-br from-purple-500 to-purple-800 border-purple-300';
            case 1000: return 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-300';
            case 2000: return 'bg-gradient-to-br from-gray-900 to-black border-red-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <motion.div
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.2, zIndex: 100, rotate: 10 }}
            whileHover={{ scale: 1.1, y: -5 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
                if (info.offset.y < -100) {
                    placeBet(value);
                }
            }}
            className={`
        w-12 h-12 sm:w-16 sm:h-16 rounded-full border-[4px] sm:border-[6px] shadow-[0_6px_10px_rgba(0,0,0,0.5),inset_0_-4px_4px_rgba(0,0,0,0.3)] 
        flex items-center justify-center
        text-white font-bold text-[10px] sm:text-sm cursor-grab active:cursor-grabbing
        border-dashed
        ${getColor(value)}
        relative
        touch-none
      `}
        >
            {/* Inner Ring (Inlay contrast) */}
            <div className="absolute inset-0 rounded-full border-[8px] border-white/10 border-dashed animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }} />

            <div className="w-11 h-11 rounded-full bg-white/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center border border-gray-300 relative z-10">
                <div className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center bg-transparent">
                    <span className="drop-shadow-sm text-black font-black text-xs font-serif tracking-tight">${value}</span>
                </div>
            </div>
        </motion.div>
    );
};
