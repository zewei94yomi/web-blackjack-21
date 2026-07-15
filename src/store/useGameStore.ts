import { create } from 'zustand';
import { BlackjackEngine, type GameState, type GameStateListener } from '../engine/BlackjackEngine';
import { Hand } from '../engine/Hand';
import { audioManager } from '../utils/audio';
import { evaluatePerfectPairs, evaluatePoker3 } from '../engine/SideBetRules';

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
    takeEvenMoney: () => void;
    declineEvenMoney: () => void;
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
            // Reserved for future setup; state is initialized inline above.
        },

        placeBet: (amount: number) => {
            const { balance } = get();

            if (amount > balance) {
                set({ message: "Insufficient funds!" });
                return;
            }

            set({ balance: balance - amount, lastOutcome: null, sideBetOutcome: null });
            engine.placeBet(amount);
            audioManager.playBetSound();
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
            audioManager.playBetSound();
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

        takeEvenMoney: () => engine.takeEvenMoney(),
        declineEvenMoney: () => engine.declineEvenMoney(),

        resetMessage: () => set({ message: "" }),

        restartGame: () => {
            engine.reset();
            set({
                balance: 10000,
                isGameOver: false,
                message: "Welcome back!",
                history: [],
                lastOutcome: null,
                gameState: 'waiting-bet',
                playerHands: engine.playerHands,
                dealerHand: engine.dealerHand,
                sideBets: { perfectPairs: 0, poker3: 0 },
                sideBetOutcome: null,
                // Fresh game means fresh stats.
                stats: {
                    roundsSurvived: 0,
                    peakBalance: 10000,
                    maxSingleRoundProfit: 0,
                    wins: 0,
                    losses: 0,
                    pushes: 0
                }
            });
        }
    };
});

// Side-bet outcome shape, reused by the resolver below.
type SideBetOutcomes = NonNullable<GameStore['sideBetOutcome']>;

/**
 * Settle Perfect Pairs / 21+3 against the opening cards. Safe to call on every
 * state change: it no-ops unless a side bet is live and hasn't been settled yet.
 * This must run for blackjack and even-money rounds too, where the engine skips
 * straight past the normal 'playing' phase.
 */
function resolveSideBets() {
    const s = useGameStore.getState();

    if (s.sideBetOutcome) return; // Already settled this round.
    if (s.sideBets.perfectPairs <= 0 && s.sideBets.poker3 <= 0) return;
    const pHand = s.playerHands[0];
    if (!pHand || pHand.cards.length < 2 || s.dealerHand.cards.length < 1) return;

    let balanceChange = 0;
    const outcomes: SideBetOutcomes = { perfectPairs: null, poker3: null };
    let messageStr = "";

    if (s.sideBets.perfectPairs > 0) {
        const res = evaluatePerfectPairs(pHand.cards[0], pHand.cards[1]);
        if (res.win) {
            const winAmount = s.sideBets.perfectPairs * res.multiplier + s.sideBets.perfectPairs;
            balanceChange += winAmount;
            outcomes.perfectPairs = { win: winAmount, message: `${res.name} (+${winAmount})` };
            messageStr += `${res.name}! `;
        } else {
            outcomes.perfectPairs = { win: 0, message: "Lost" };
        }
    }

    if (s.sideBets.poker3 > 0) {
        const res = evaluatePoker3(pHand.cards[0], pHand.cards[1], s.dealerHand.cards[0]);
        if (res.win) {
            const winAmount = s.sideBets.poker3 * res.multiplier + s.sideBets.poker3;
            balanceChange += winAmount;
            outcomes.poker3 = { win: winAmount, message: `${res.name} (+${winAmount})` };
            messageStr += `${res.name}! `;
        } else {
            outcomes.poker3 = { win: 0, message: "Lost" };
        }
    }

    if (balanceChange > 0) {
        audioManager.playWinSound();
        useGameStore.setState(prev => ({
            balance: prev.balance + balanceChange,
            sideBetOutcome: outcomes,
            stats: { ...prev.stats, peakBalance: Math.max(prev.stats.peakBalance, prev.balance + balanceChange) },
            message: messageStr || prev.message
        }));
        setTimeout(() => useGameStore.getState().resetMessage(), 3000);
    } else {
        useGameStore.setState({ sideBetOutcome: outcomes });
    }
}

// Re-inject the listener so state transitions drive payouts and side-bet settling.
useGameStore.setState((state) => {
    const engine = state.engine;
    const existingListener = engine['listener'];

    engine.setListener({
        onStateChange: (newState) => {
            existingListener?.onStateChange(newState);

            // Settle side bets as soon as the opening cards are known. This fires
            // for normal rounds ('playing') as well as blackjack / even-money
            // rounds that jump straight to an offer or resolution.
            if (newState === 'playing' || newState === 'offering-even-money' || newState === 'resolving') {
                resolveSideBets();
            }

            // Main game resolution + stats.
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
                        audioManager.playWinSound();
                    } else if (res.result === 'push') {
                        totalProfit += handBet;
                        winMsg += `Hand ${res.handIndex + 1}: Push. `;
                        roundPushes++;
                    } else if (res.result === 'blackjack') {
                        totalProfit += (handBet + res.profit);
                        netRoundChange += res.profit;
                        winMsg += `Hand ${res.handIndex + 1}: Blackjack! `;
                        roundWins++;
                        audioManager.playWinSound();
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
                    message: winMsg + (netRoundChange > 0 ? ` (+${netRoundChange})` : ` (${netRoundChange})`),
                    history: [`Round: ${winMsg} (${netRoundChange > 0 ? '+' : ''}${netRoundChange})`, ...s.history].slice(0, 50),
                    stats: newStats,
                    lastOutcome: results.some(r => r.result === 'blackjack') ? 'blackjack'
                        : results.some(r => r.result === 'win') ? 'win'
                            : results.every(r => r.result === 'push') ? 'push'
                                : 'lose',
                    sideBets: { perfectPairs: 0, poker3: 0 },
                    sideBetOutcome: null
                }));

                // If game over, wait 2 seconds before showing modal
                if (isGameOver) {
                    setTimeout(() => {
                        useGameStore.setState({
                            isGameOver: true,
                            message: "GAME OVER - Insufficient Funds"
                        });
                    }, 2000);
                }
            }
        },
        onHandsUpdate: existingListener!.onHandsUpdate,
        onMessage: existingListener!.onMessage
    });
    return state;
});
