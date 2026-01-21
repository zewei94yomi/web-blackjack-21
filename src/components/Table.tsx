import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { HandDisplay } from './HandDisplay';
import { Controls } from './Controls';
import { ChipRack } from './ChipRack';
import { BettingSpot } from './BettingSpot';
import { StatsModal } from './StatsModal';
import { OutcomeOverlay } from './OutcomeOverlay';

export const Table: React.FC = () => {
    const { message, balance, resetMessage } = useGameStore();

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => resetMessage(), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, resetMessage]);

    return (
        <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
            {/* Table Rail (Wood Texture) */}
            <div className="relative w-[95vw] h-[90vh] wood-texture rounded-[100px] shadow-2xl p-8 flex items-center justify-center border-[12px] border-[#291b16]">

                {/* Felt Surface */}
                <div className="relative w-full h-full bg-felt-base rounded-[60px] shadow-inner overflow-hidden border-4 border-black/30">

                    {/* Felt Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 mix-blend-overlay pointer-events-none" />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />

                    {/* Table Markings / Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40 select-none flex flex-col items-center">
                        <div className="text-gold-400 font-serif italic text-6xl font-black tracking-widest mb-1 drop-shadow-lg">
                            BLACKJACK
                        </div>
                        <div className="w-32 h-0.5 bg-gold-500/50 mb-2"></div>
                        <div className="text-gold-100 font-sans text-xs tracking-[0.3em] font-bold uppercase py-1">
                            Pays 3 to 2
                        </div>
                        <div className="text-gold-100 font-sans text-[10px] tracking-wider opacity-80">
                            Dealer must draw to 16 and stand on all 17s
                        </div>
                    </div>

                    {/* Header / HUD */}
                    <div className="absolute top-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
                        <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/5">
                            <div className="text-xs text-gold-400 font-bold uppercase tracking-wider mb-0.5">Table Limit</div>
                            <div className="text-white/90 font-mono text-sm">$200 - $2,000</div>
                        </div>

                        <div className="flex flex-col items-end gap-3 pointer-events-auto">

                        </div>
                    </div>

                    {/* Message Toast */}
                    <div className="absolute top-24 right-0 w-full flex justify-center pointer-events-none z-50">
                        {message && (
                            <div className="bg-black/90 backdrop-blur text-gold-400 px-8 py-4 rounded-full border border-gold-500/50 shadow-2xl animate-[bounce_1s_infinite] whitespace-nowrap font-serif text-xl tracking-wide">
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Main Game Area */}
                    <div className="absolute inset-0 flex flex-col">
                        {/* Dealer Zone */}
                        <div className="flex-1 flex flex-col items-center justify-start pt-12">
                            <HandDisplay isDealer />
                        </div>

                        {/* Player Zone */}
                        <div className="flex-1 flex flex-col items-center justify-end pb-8 relative">
                            {/* Betting Circle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] border-2 border-white/5 rounded-[100%] pointer-events-none" />

                            <div className="mb-6 z-10">
                                <BettingSpot />
                            </div>

                            <div className="mb-2 z-10 scale-110 origin-bottom">
                                <HandDisplay />
                            </div>

                            {/* Controls */}
                            <div className="h-20 w-full flex justify-center items-center z-20 mt-4">
                                <Controls />
                            </div>
                        </div>
                    </div>

                    {/* Chip Rack & Balance */}
                    <div className="absolute bottom-6 right-6 z-20 flex items-center gap-6">
                        {/* Balance Moved Here */}
                        <div className="relative group perspective-1000">
                            <div className="relative bg-gradient-to-b from-gray-900 to-black border border-gold-600/30 rounded-full px-6 py-2 shadow-xl flex items-center gap-3 active:scale-95 transition-transform">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-inner flex items-center justify-center text-black font-serif font-bold text-lg border border-gold-300">$</div>
                                <span className="text-2xl font-mono font-bold text-gold-100 tracking-wider">
                                    {balance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <ChipRack />
                    </div>

                    {/* Stats/History Toggle */}
                    <div className="absolute bottom-6 left-6 z-20">
                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10 w-64 text-xs font-mono text-gold-100/70 max-h-48 overflow-y-auto shadow-xl">
                            <div className="font-bold text-gold-500 border-b border-white/10 mb-2 pb-1 sticky top-0 bg-transparent">SESSION LOG</div>
                            {useGameStore(s => s.history).map((entry, i) => (
                                <div key={i} className="mb-1 leading-tight border-b border-white/5 pb-1 last:border-0 border-dashed">
                                    {entry}
                                </div>
                            ))}
                            {useGameStore(s => s.history).length === 0 && <div className="italic opacity-50">Table is open. Place your bets.</div>}
                        </div>
                    </div>

                    <StatsModal />
                    <OutcomeOverlay />
                </div>
            </div>
        </div>
    );
};
