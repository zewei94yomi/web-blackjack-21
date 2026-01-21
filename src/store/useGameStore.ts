import { create } from 'zustand';
import { BlackjackEngine, type GameState, type GameStateListener } from '../engine/BlackjackEngine';
import { Hand } from '../engine/Hand';

interface GameStore {
    engine: BlackjackEngine;

    // Reactive State
    gameState: GameState;
    dealerHand: Hand;
    playerHands: Hand[];
    currentHandIndex: number;
    message: string;
    balance: number;

    history: string[]; // Log of past hands
    lastOutcome: 'win' | 'lose' | 'push' | 'blackjack' | null;
    isGameOver: boolean;

    // Actions
    initGame: () => void;
    placeBet: (amount: number) => void;
    hit: () => void;
    stand: () => void;
    double: () => void;
    split: () => void;
    resetMessage: () => void;
    restartGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
    const engine = new BlackjackEngine();

    // Setup Listener
    const listener: GameStateListener = {
        onStateChange: (state) => set({ gameState: state }),
        onHandsUpdate: (dealerHand, playerHands, currentHandIndex) =>
            set({ dealerHand, playerHands, currentHandIndex }),
        onMessage: (msg) => set({ message: msg }),
    };

    engine.setListener(listener);

    return {
        engine,
        gameState: 'waiting-bet',
        dealerHand: engine.dealerHand,
        playerHands: engine.playerHands,
        currentHandIndex: 0,
        message: "Welcome to Blackjack 21",
        balance: 10000, // Initial Balance

        history: [],
        lastOutcome: null,
        isGameOver: false,

        initGame: () => {
            // Any reset logic if needed
        },

        placeBet: (amount: number) => {
            const { balance } = get();
            if (amount > balance) {
                set({ message: "Insufficient funds!" });
                return;
            }
            set({ balance: balance - amount, lastOutcome: null });
            engine.placeBet(amount);
            // Dynamic import to avoid SSR issues if any (but here it's SPA)
            import('../utils/audio').then(m => m.audioManager.playBetSound());

            // After bet, wait for resolution to update balance
            // We need to hook into 'resolving' state end to add winnings.
            // We can do this by wrapping the listener or checking state changes.
            // For MVP, lets simple-hack it: 
            // We check results when state becomes 'resolving' in a useEffect or here?
            // Since state change is sync, we can't easily catch it "after" it happens here purely.
            // Better: The engine should return results or we trigger a balance check.
            // We can attach a secondary listener logic inside the store implementation.
        },

        hit: () => engine.hit(),
        stand: () => engine.stand(),
        double: () => {
            // Check balance for double
            const { balance, playerHands, currentHandIndex } = get();
            const currentBet = playerHands[currentHandIndex].bet;
            if (balance < currentBet) {
                set({ message: "Not enough chips to double!" });
                return;
            }
            set({ balance: balance - currentBet });
            engine.double();
        },
        split: () => {
            const { balance, playerHands, currentHandIndex } = get();
            const currentBet = playerHands[currentHandIndex].bet;
            if (balance < currentBet) {
                set({ message: "Not enough chips to split!" });
                return;
            }
            set({ balance: balance - currentBet });
            engine.split();
        },

        resetMessage: () => set({ message: "" }),

        restartGame: () => {
            set({
                balance: 10000,
                isGameOver: false,
                message: "Welcome back!",
                history: [],
                lastOutcome: null,
                gameState: 'waiting-bet'
            });
        }
    };
});

// Hook to handle payouts when game ends
// We can use `useGameStore.subscribe` in a component or add logic to the listener above.
// Updating the listener above to handle payouts:
// const originalListener = useGameStore.getState().engine['listener'];
// Re-inject listener with payout logic? 
// No, let's just modify the store creation to include payout handling directly in the listener.

useGameStore.setState((state) => {
    const engine = state.engine;
    const existingListener = engine['listener'];

    engine.setListener({
        onStateChange: (newState) => {
            existingListener?.onStateChange(newState);
            if (newState === 'resolving') {
                const results = engine.getResults();
                let totalProfit = 0;
                let winMsg = "";
                let netRoundChange = 0; // Tracks actual balance change vs start of round

                const currentState = useGameStore.getState();
                results.forEach(res => {
                    const handBet = currentState.playerHands[res.handIndex].bet;

                    if (res.result === 'win') {
                        // We get back Bet + Profit. 
                        // Our balance increases by (Bet + Profit).
                        // Net change from start of round (when we paid bet) is +Profit.
                        totalProfit += (handBet + res.profit);
                        netRoundChange += res.profit;
                        winMsg += `Hand ${res.handIndex + 1}: Win! `;
                        import('../utils/audio').then(m => m.audioManager.playWinSound());
                    } else if (res.result === 'push') {
                        // We get back Bet.
                        // Net change is 0.
                        totalProfit += handBet;
                        // netRoundChange += 0;
                        winMsg += `Hand ${res.handIndex + 1}: Push. `;
                    } else if (res.result === 'blackjack') {
                        totalProfit += (handBet + res.profit);
                        netRoundChange += res.profit;
                        winMsg += `Hand ${res.handIndex + 1}: Blackjack! `;
                        import('../utils/audio').then(m => m.audioManager.playWinSound());
                    } else {
                        // We get back 0.
                        // Net change is -Bet.
                        // netRoundChange -= handBet; 
                        // BUT: We already deducted the bet from balance when placed.
                        // So "Net Change" relative to 'balance before result' is 0 (for the loss part).
                        // However, the USER thinks of "Net Change" relative to "Before Round".
                        // So yes, -HandBet.

                        netRoundChange -= handBet;
                        winMsg += `Hand ${res.handIndex + 1}: Lose. `;
                    }
                });

                const newBalance = currentState.balance + totalProfit;
                const isGameOver = newBalance < 200; // Minimum bet

                useGameStore.setState(s => ({
                    balance: newBalance,
                    message: isGameOver ? "GAME OVER - Insufficient Funds" : (winMsg + (netRoundChange > 0 ? ` (+${netRoundChange})` : ` (${netRoundChange})`)),
                    history: [`Round: ${winMsg} (${netRoundChange > 0 ? '+' : ''}${netRoundChange})`, ...s.history].slice(0, 50),
                    lastOutcome: results.some(r => r.result === 'blackjack') ? 'blackjack'
                        : results.some(r => r.result === 'win') ? 'win'
                            : results.every(r => r.result === 'push') ? 'push'
                                : 'lose',
                    isGameOver: isGameOver
                }));
            }
        },
        onHandsUpdate: existingListener!.onHandsUpdate,
        onMessage: existingListener!.onMessage
    });
    return state;
});
