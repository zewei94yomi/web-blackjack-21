import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';

interface HandDisplayProps {
    isDealer?: boolean;
}

export const HandDisplay: React.FC<HandDisplayProps> = ({ isDealer }) => {
    const { dealerHand, playerHands, currentHandIndex, gameState } = useGameStore();

    if (isDealer) {
        return (
            <div className="flex flex-col items-center">
                <div className="flex">
                    {dealerHand.cards.map((card, idx) => (
                        <Card
                            key={`${idx}-${card.suit}-${card.rank}`}
                            card={card}
                            index={idx}
                            hidden={idx === 1 && gameState !== 'resolving' && gameState !== 'dealer-turn' && gameState !== 'waiting-bet'} // Hide 2nd card until dealer turn
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-8">
            {playerHands.map((hand, hIdx) => {
                // Determine result for badge if resolving
                let badge = null;
                const score = hand.value;
                if (gameState === 'resolving') {
                    // We need to know result. Store message has it, but parsing is hacky.
                    // Better: use score vs dealer.
                    // Or reuse message logic? 
                    // Let's rely on simple comparison for visual badge since exact calculation matches sync.
                    const dealerScore = dealerHand.value;
                    const dealerBust = dealerHand.isBust;
                    const dealerBJ = dealerHand.isBlackjack;
                    const playerBJ = hand.isBlackjack;
                    const playerBust = hand.isBust;

                    if (playerBust) badge = <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow animate-bounce">BUST</span>;
                    else if (playerBJ && !dealerBJ) badge = <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold shadow animate-bounce">BLACKJACK</span>;
                    else if (dealerBust) badge = <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow animate-bounce">WIN</span>;
                    else if (dealerBJ) badge = <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow">LOSE</span>;
                    else if (score > dealerScore) badge = <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow animate-bounce">WIN</span>;
                    else if (score < dealerScore) badge = <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow">LOSE</span>;
                    else badge = <span className="bg-gray-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow">PUSH</span>;
                }

                return (
                    <div
                        key={hIdx}
                        className={`flex flex-col items-center transition-opacity ${hIdx === currentHandIndex ? 'opacity-100 scale-105' : 'opacity-60 scale-95'} relative`}
                    >
                        {/* Result Badge */}
                        {badge && (
                            <div className="absolute -top-6 z-20">
                                {badge}
                            </div>
                        )}

                        <div className="flex">
                            {hand.cards.map((card, cIdx) => (
                                <Card key={`${hIdx}-${cIdx}`} card={card} index={cIdx} />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
