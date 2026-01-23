import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { HandDisplay } from './HandDisplay';
import { Controls } from './Controls';
import { ChipRack } from './ChipRack';
import { BettingSpot } from './BettingSpot';
import { StatsModal } from './StatsModal';
import { OutcomeOverlay } from './OutcomeOverlay';
import { GameOverModal } from './GameOverModal';

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
            <div className="relative w-screen h-screen sm:w-[95vw] sm:h-[90vh] wood-texture sm:rounded-[60px] md:rounded-[100px] shadow-2xl flex items-center justify-center border-[4px] sm:border-[12px] border-[#291b16]">
                <GameOverModal />

                {/* Felt Surface */}
                <div className="relative w-full h-full bg-felt-base sm:rounded-[40px] md:rounded-[60px] shadow-inner overflow-hidden border-2 sm:border-4 border-black/30 flex flex-col">

                    {/* Felt Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 mix-blend-overlay pointer-events-none" />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />

                    {/* Table Markings / Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40 select-none flex flex-col items-center">
                        <div className="text-gold-400 font-serif italic text-4xl sm:text-6xl font-black tracking-widest mb-1 drop-shadow-lg opacity-80 sm:opacity-100">
                            BLACKJACK
                        </div>
                        <div className="hidden sm:block w-32 h-0.5 bg-gold-500/50 mb-2"></div>
                        <div className="text-gold-100 font-sans text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase py-1 opacity-80 sm:opacity-100">
                            Pays 3 to 2
                        </div>
                        <div className="hidden sm:block text-gold-100 font-sans text-[10px] tracking-wider opacity-80">
                            Dealer must draw to 16 and stand on all 17s
                        </div>
                    </div>

                    {/* 21+3 Side Bet Rules - Left Side */}
                    <div className="hidden sm:block absolute left-4 md:left-8 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-30">
                        <div className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">21+3</div>
                        <div className="text-[9px] text-gold-200/80 space-y-0.5 font-mono">
                            <div className="flex justify-between gap-4"><span>Flush</span><span>5:1</span></div>
                            <div className="flex justify-between gap-4"><span>Straight</span><span>10:1</span></div>
                            <div className="flex justify-between gap-4"><span>3 of Kind</span><span>30:1</span></div>
                            <div className="flex justify-between gap-4"><span>Str Flush</span><span>40:1</span></div>
                            <div className="flex justify-between gap-4"><span>Suited 3</span><span>100:1</span></div>
                        </div>
                    </div>

                    {/* Perfect Pairs Rules - Right Side */}
                    <div className="hidden sm:block absolute right-4 md:right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-30">
                        <div className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Perfect Pairs</div>
                        <div className="text-[9px] text-gold-200/80 space-y-0.5 font-mono">
                            <div className="flex justify-between gap-4"><span>Mixed Pair</span><span>5:1</span></div>
                            <div className="flex justify-between gap-4"><span>Colored</span><span>12:1</span></div>
                            <div className="flex justify-between gap-4"><span>Perfect</span><span>25:1</span></div>
                        </div>
                    </div>

                    {/* Header / HUD */}
                    <div className="relative w-full p-2 sm:p-6 flex justify-between items-start z-10 pointer-events-none shrink-0">
                        <div className="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border border-white/5">
                            <div className="text-[10px] sm:text-xs text-gold-400 font-bold uppercase tracking-wider mb-0.5">Table Limit</div>
                            <div className="text-white/90 font-mono text-xs sm:text-sm">$200 - $2,000</div>
                        </div>

                        {/* Balance display moved here for semantic structure, but handled in layout */}
                    </div>

                    {/* Message Toast */}
                    <div className="absolute top-16 sm:top-24 right-0 w-full flex justify-center pointer-events-none z-50">
                        {message && (
                            <div className="bg-black/90 backdrop-blur text-gold-400 px-6 py-2 sm:px-8 sm:py-4 rounded-full border border-gold-500/50 shadow-2xl animate-[bounce_1s_infinite] whitespace-nowrap font-serif text-base sm:text-xl tracking-wide">
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Main Game Area */}
                    <div className="flex-1 flex flex-col relative w-full">
                        {/* Dealer Zone */}
                        <div className="flex-1 flex flex-col items-center justify-start pt-6 sm:pt-12">
                            <HandDisplay isDealer />
                        </div>

                        {/* Player Zone */}
                        <div className="flex-[1.2] flex flex-col items-center justify-center sm:justify-end pb-2 sm:pb-8 relative">
                            {/* Betting Circle - Hide on small mobile to save space */}
                            <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[200px] sm:w-[300px] h-[100px] sm:h-[150px] border-2 border-white/5 rounded-[100%] pointer-events-none" />

                            <div className="mb-2 sm:mb-6 z-10">
                                <BettingSpot />
                            </div>

                            <div className="mb-2 z-10 scale-90 sm:scale-110 origin-bottom">
                                <HandDisplay />
                            </div>

                            {/* Controls */}
                            <div className="w-full flex justify-center items-center z-20 mt-2 sm:mt-4 h-16 sm:h-20">
                                <Controls />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Chip Rack & Balance */}
                    <div className="shrink-0 pb-4 sm:pb-6 px-4 sm:px-6 z-20 flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-6 w-full">

                        {/* Balance (Visible on both, styled appropriately) */}
                        <div className="relative group perspective-1000 order-2 sm:order-1">
                            <div className="relative bg-gradient-to-b from-gray-900 to-black border border-gold-600/30 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 shadow-xl flex items-center gap-2 sm:gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-inner flex items-center justify-center text-black font-serif font-bold text-sm sm:text-lg border border-gold-300">$</div>
                                <span className="text-lg sm:text-2xl font-mono font-bold text-gold-100 tracking-wider">
                                    {balance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="order-1 sm:order-2">
                            <ChipRack />
                        </div>
                    </div>

                    {/* Stats/History Toggle */}
                    <div className="absolute bottom-4 left-4 z-20 hidden sm:block">
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
