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

    // Side Bets
    sideBets: {
        perfectPairs: number;
        poker3: number;
    };
    sideBetOutcome: {
        perfectPairs: { win: number; message: string } | null;
        poker3: { win: number; message: string } | null;
    } | null;

    // Statistics
    stats: {
        roundsSurvived: number;
        peakBalance: number;
        maxSingleRoundProfit: number;
        wins: number;
        losses: number;
        pushes: number;
    };

    history: string[]; // Log of past hands
    lastOutcome: 'win' | 'lose' | 'push' | 'blackjack' | null;
    isGameOver: boolean;

    // Actions
    initGame: () => void;
    placeBet: (amount: number) => void;
    placeSideBet: (type: 'perfectPairs' | 'poker3', amount: number) => void;
    clearBets: () => void;
    deal: () => void;
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

        sideBets: { perfectPairs: 0, poker3: 0 },
        sideBetOutcome: null,
        stats: {
            roundsSurvived: 0,
            peakBalance: 10000,
            maxSingleRoundProfit: 0,
            wins: 0,
            losses: 0,
            pushes: 0
        },

        history: [],
        lastOutcome: null,
        isGameOver: false,

        initGame: () => {
            // Any reset logic if needed
        },

        placeBet: (amount: number) => {
            const { balance } = get();

            // Only allow main bet if balance can cover it
            if (amount > balance) {
                set({ message: "Insufficient funds!" });
                return;
            }

            // NOTE: Requirement says "Player must first place Main Bet then Side Bets". 
            // Usually in UI we can toggle. But here, let's just deduct.
            // Actually, usually Main Bet is required to DEAL. Side bets are optional.

            set({ balance: balance - amount, lastOutcome: null, sideBetOutcome: null });
            engine.placeBet(amount);
            import('../utils/audio').then(m => m.audioManager.playBetSound());
        },

        placeSideBet: (type, amount) => {
            const { balance, gameState, sideBets, playerHands } = get();

            // Can only bet during waiting phase
            if (gameState !== 'waiting-bet') return;

            // Must place main bet first!
            if (!playerHands[0] || playerHands[0].bet <= 0) {
                set({ message: "Place main bet first!" });
                return;
            }

            if (amount > balance) {
                set({ message: "Insufficient funds for Side Bet!" });
                return;
            }

            const newSideBets = { ...sideBets, [type]: sideBets[type] + amount };
            set({
                balance: balance - amount,
                sideBets: newSideBets
            });
            import('../utils/audio').then(m => m.audioManager.playBetSound());
        },

        clearBets: () => {
            const { playerHands, sideBets, gameState, balance } = get();

            // Only allow clearing during betting phase
            if (gameState !== 'waiting-bet') return;

            // Calculate total bet to refund
            const mainBet = playerHands[0]?.bet || 0;
            const sideBetTotal = sideBets.perfectPairs + sideBets.poker3;
            const refund = mainBet + sideBetTotal;

            if (refund === 0) return; // Nothing to clear

            // Reset engine state - create fresh Hand with 0 bet
            const engine = get().engine;
            engine.playerHands = [new Hand(0)];
            engine.dealerHand = new Hand();

            // Update store state - IMPORTANT: also update playerHands reference from engine
            set({
                balance: balance + refund,
                sideBets: { perfectPairs: 0, poker3: 0 },
                playerHands: engine.playerHands, // Sync with engine
                dealerHand: engine.dealerHand,
                message: `Bets cleared (+$${refund})`
            });
        },

        deal: () => {
            const { playerHands } = get();
            const engine = get().engine;

            // Check if main bet exists (MVP: hand[0].bet > 0)
            if (!playerHands[0] || playerHands[0].bet <= 0) {
                set({ message: "Place a bet first!" });
                return;
            }
            // Start engine
            engine.startRound();
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

// ... imports at top need to include evaluate helpers
import { evaluatePerfectPairs, evaluatePoker3 } from '../engine/SideBetRules';

useGameStore.setState((state) => {
    const engine = state.engine;
    const existingListener = engine['listener'];

    engine.setListener({
        onStateChange: (newState) => {
            existingListener?.onStateChange(newState);

            const s = useGameStore.getState();

            // 1. Resolve Side Bets immediately after dealing (Transition to 'playing')
            // 'playing' is set after initial deal.
            if (newState === 'playing' && s.playerHands[0].cards.length === 2) {
                const pHand = s.playerHands[0];
                const dHand = s.dealerHand;

                // Only evaluate if we haven't already (e.g., after split/hit we are still 'playing')
                // Check if this is the FIRST 'playing' state content (2 cards).
                // Actually safer to check if sideBets > 0 and outcomes are null.
                if ((s.sideBets.perfectPairs > 0 || s.sideBets.poker3 > 0) && !s.sideBetOutcome) {
                    let balanceChange = 0;
                    const outcomes: any = { perfectPairs: null, poker3: null };
                    let messageStr = "";

                    // Eval Perfect Pairs
                    if (s.sideBets.perfectPairs > 0) {
                        const res = evaluatePerfectPairs(pHand.cards[0], pHand.cards[1]);
                        if (res.win) {
                            const winAmount = s.sideBets.perfectPairs * res.multiplier + s.sideBets.perfectPairs;
                            balanceChange += winAmount;
                            outcomes.perfectPairs = { win: winAmount, message: `${res.name} (+${winAmount})` };
                            messageStr += `${res.name}! `;
                            import('../utils/audio').then(m => m.audioManager.playWinSound());
                        } else {
                            outcomes.perfectPairs = { win: 0, message: "Lost" };
                        }
                    }

                    // Eval 21+3
                    if (s.sideBets.poker3 > 0 && dHand.cards.length > 0) {
                        const res = evaluatePoker3(pHand.cards[0], pHand.cards[1], dHand.cards[0]);
                        if (res.win) {
                            const winAmount = s.sideBets.poker3 * res.multiplier + s.sideBets.poker3;
                            balanceChange += winAmount;
                            outcomes.poker3 = { win: winAmount, message: `${res.name} (+${winAmount})` };
                            messageStr += `${res.name}! `;
                            import('../utils/audio').then(m => m.audioManager.playWinSound());
                        } else {
                            outcomes.poker3 = { win: 0, message: "Lost" };
                        }
                    }

                    if (balanceChange > 0) {
                        useGameStore.setState(prev => ({
                            balance: prev.balance + balanceChange,
                            sideBetOutcome: outcomes,
                            // Peak balance check
                            stats: { ...prev.stats, peakBalance: Math.max(prev.stats.peakBalance, prev.balance + balanceChange) },
                            message: messageStr || prev.message
                        }));

                        // Clear message after a delay
                        setTimeout(() => useGameStore.getState().resetMessage(), 3000);
                    } else {
                        useGameStore.setState({ sideBetOutcome: outcomes });
                    }
                }
            }


            // 2. Main Game Resolution (Existing Logic + Stats)
            if (newState === 'resolving') {
                const results = engine.getResults();
                let totalProfit = 0;
                let winMsg = "";
                let netRoundChange = 0;
                let roundWins = 0;
                let roundLosses = 0;
                let roundPushes = 0;

                const currentState = useGameStore.getState();

                results.forEach(res => {
                    const handBet = currentState.playerHands[res.handIndex].bet;

                    if (res.result === 'win') {
                        totalProfit += (handBet + res.profit);
                        netRoundChange += res.profit;
                        winMsg += `Hand ${res.handIndex + 1}: Win! `;
                        roundWins++;
                        import('../utils/audio').then(m => m.audioManager.playWinSound());
                    } else if (res.result === 'push') {
                        totalProfit += handBet;
                        winMsg += `Hand ${res.handIndex + 1}: Push. `;
                        roundPushes++;
                    } else if (res.result === 'blackjack') {
                        totalProfit += (handBet + res.profit);
                        netRoundChange += res.profit;
                        winMsg += `Hand ${res.handIndex + 1}: Blackjack! `;
                        roundWins++;
                        import('../utils/audio').then(m => m.audioManager.playWinSound());
                    } else {
                        netRoundChange -= handBet;
                        winMsg += `Hand ${res.handIndex + 1}: Lose. `;
                        roundLosses++;
                    }
                });

                const newBalance = currentState.balance + totalProfit;
                const isGameOver = newBalance < 200; // Minimum bet

                // Update Stats
                const newStats = {
                    ...currentState.stats,
                    roundsSurvived: currentState.stats.roundsSurvived + 1,
                    peakBalance: Math.max(currentState.stats.peakBalance, newBalance),
                    maxSingleRoundProfit: Math.max(currentState.stats.maxSingleRoundProfit, netRoundChange),
                    wins: currentState.stats.wins + roundWins,
                    losses: currentState.stats.losses + roundLosses,
                    pushes: currentState.stats.pushes + roundPushes
                };

                useGameStore.setState(s => ({
                    balance: newBalance,
                    message: isGameOver ? "GAME OVER - Insufficient Funds" : (winMsg + (netRoundChange > 0 ? ` (+${netRoundChange})` : ` (${netRoundChange})`)),
                    history: [`Round: ${winMsg} (${netRoundChange > 0 ? '+' : ''}${netRoundChange})`, ...s.history].slice(0, 50),
                    stats: newStats,
                    lastOutcome: results.some(r => r.result === 'blackjack') ? 'blackjack'
                        : results.some(r => r.result === 'win') ? 'win'
                            : results.every(r => r.result === 'push') ? 'push'
                                : 'lose',
                    isGameOver: isGameOver,
                    sideBets: { perfectPairs: 0, poker3: 0 }, // Reset side bets for next round
                    sideBetOutcome: null
                }));
            }
        },
        onHandsUpdate: existingListener!.onHandsUpdate,
        onMessage: existingListener!.onMessage
    });
    return state;
});
