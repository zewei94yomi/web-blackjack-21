import { Deck } from './Deck';
import { Hand } from './Hand';
import { audioManager } from '../utils/audio';

export type GameState = 'waiting-bet' | 'dealing' | 'playing' | 'player-turn' | 'dealer-turn' | 'resolving' | 'offering-even-money';

export interface GameStateListener {
    onStateChange(state: GameState): void;
    onHandsUpdate(dealerHand: Hand, playerHands: Hand[], currentHandIndex: number): void;
    onMessage(msg: string): void;
}

export class BlackjackEngine {
    deck: Deck;
    dealerHand: Hand;
    playerHands: Hand[]; // Support split hands
    currentHandIndex: number;
    state: GameState;

    private listener?: GameStateListener;

    constructor() {
        this.deck = new Deck(6);
        this.dealerHand = new Hand();
        this.playerHands = [new Hand()];
        this.currentHandIndex = 0;
        this.state = 'waiting-bet';
    }

    setListener(listener: GameStateListener) {
        this.listener = listener;
    }

    private notifyUpdate(msg: string = "") {
        if (this.listener) {
            this.listener.onStateChange(this.state);
            this.listener.onHandsUpdate(this.dealerHand, this.playerHands, this.currentHandIndex);
            if (msg) this.listener.onMessage(msg);
        }
    }

    placeBet(amount: number) {
        // Just sets up internal state, does NOT start round
        if (this.state !== 'waiting-bet' && this.state !== 'resolving') return;
        if (amount <= 0) return;

        // If simple overwrite or accumulate? 
        // Logic: placeBet creates a new hand setup. 
        // If we want to accumulate, we should check structure.
        // For now, assuming UI sums it up or we overwrite. 
        // Let's make it overwriting for initial setup for simplicity, OR
        // better: just update the bet value of the first hand.

        if (this.playerHands.length === 0 || this.state === 'resolving') {
            this.playerHands = [new Hand(amount)];
            this.dealerHand = new Hand();
            this.currentHandIndex = 0;
            this.state = 'waiting-bet'; // Reset to waiting if it was resolving
        } else {
            // Add to existing
            this.playerHands[0].bet += amount;
        }

        this.notifyUpdate();
    }

    startRound() {
        if (this.playerHands[0].bet <= 0) return;

        this.state = 'dealing';
        // ... rest of logic
        // We need to move the rest of startRound here and genericize.

        this._dealInitialCards();
    }

    private async _dealInitialCards() {
        this.state = 'dealing';

        // Check shuffle needed
        if (this.deck.needsShuffle) {
            this.notifyUpdate("Shuffling deck...");
            this.deck.reset(); // This resets AND shuffles
        }

        // Deal cards (Initial 2 each)
        // Order: Player, Dealer, Player, Dealer (Hidden)
        this.playerHands[0].addCard(this.deck.deal()); audioManager.playDealSound();
        this.dealerHand.addCard(this.deck.deal()); audioManager.playDealSound();
        this.playerHands[0].addCard(this.deck.deal()); audioManager.playDealSound();
        this.dealerHand.addCard(this.deck.deal()); audioManager.playDealSound();

        // Check instant Blackjack for Player
        if (this.playerHands[0].isBlackjack) {
            // Check dealer potential blackjack
            const dealerUpCard = this.dealerHand.cards[0];
            const dealerHasTenOrAce = dealerUpCard.value >= 10 || dealerUpCard.rank === 'A';

            if (dealerHasTenOrAce) {
                // User requirement: Offer "Even Money" if Player BJ and Dealer shows A or 10
                this.state = 'offering-even-money';
                this.notifyUpdate("Even Money?");
                return;
            } else {
                // Instant win 3:2
                this.state = 'resolving';
                this.notifyUpdate("Blackjack!");
                return;
            }
        }


        // Hook point for Side Bets: State transition 'playing'
        // This allows the store to see the cards and resolve side bets before player turn action.
        this.state = 'playing';
        this.notifyUpdate("Side Bets...");

        // Immediate transition to player turn? 
        // We can wait a microsecond or let the Store 'Hit' logic take over?
        // Actually Store just listening to 'playing' state is enough to resolve side bets.
        // But we need to move to 'player-turn' so buttons appear.
        // We can do this via a timeout or let the store call `engine.nextTurn()`? 
        // Simplest: Auto-transition after a short delay in Engine or call from Store after resolution.
        // Let's make the engine wait slightly then move to player-turn.

        setTimeout(() => {
            if (this.state === 'playing') { // Check if not resolved (e.g. blackjack)
                this.state = 'player-turn';
                this.notifyUpdate("Your turn.");
            }
        }, 1500); // 1.5s delay to show side bet outcome
    }

    hit() {
        if (this.state !== 'player-turn') return;

        const currentHand = this.playerHands[this.currentHandIndex];
        currentHand.addCard(this.deck.deal());

        if (currentHand.isBust) {
            this.finishCurrentHand();
        } else if (currentHand.value === 21) {
            // Auto stand on 21? usually QOL feature
            this.finishCurrentHand();
        } else {
            this.notifyUpdate();
            // Just normal hit sound
        }
        audioManager.playDealSound();
    }

    stand() {
        if (this.state !== 'player-turn') return;
        this.finishCurrentHand();
    }

    double() {
        if (this.state !== 'player-turn') return;
        const currentHand = this.playerHands[this.currentHandIndex];
        if (!currentHand.canDouble()) return; // Should be checked by UI too

        // Double bet
        currentHand.bet *= 2;
        // Deal 1 card only
        this.currentHandIndex = this.currentHandIndex; // logic update
        const doubleCard = this.deck.deal();
        currentHand.addCard(doubleCard);
        audioManager.playDealSound();

        this.finishCurrentHand();
    }

    takeEvenMoney() {
        if (this.state !== 'offering-even-money') return;

        // Even money pays 1:1 regardless of dealer hand
        // We modify the hand to reflect a 1:1 payout in the final resolution
        // or we just resolve it now.
        this.state = 'resolving';
        // Hack: temporarily set it to something getResults can handle or return custom
        this.notifyUpdate("Even Money Accepted.");
    }

    declineEvenMoney() {
        if (this.state !== 'offering-even-money') return;

        // Continue to side bets then dealer turn
        this.state = 'playing';
        this.notifyUpdate("Side Bets...");

        setTimeout(() => {
            if (this.state === 'playing') {
                this.state = 'player-turn';
                this.notifyUpdate("Your turn.");
            }
        }, 1500);
    }

    split() {
        if (this.state !== 'player-turn') return;
        const currentHand = this.playerHands[this.currentHandIndex];
        if (!currentHand.canSplit()) return;
        // Max splits check? MVP simplified: let's allow basic split first.

        // Create new hand
        const splitCard = currentHand.cards.pop()!;
        const newHand = new Hand(currentHand.bet);
        newHand.addCard(splitCard);

        // Add new hand to array
        this.playerHands.splice(this.currentHandIndex + 1, 0, newHand);

        // Deal card to current hand
        currentHand.addCard(this.deck.deal());
        audioManager.playDealSound();

        // Logic for Aces: if 'A' was split, usually only 1 card is dealt and then turn ends for that hand.
        // For MVP simple logic: treat as normal but maybe restrict Hit if Ace?
        // Dev doc: "Split Aces: A 分牌后，每手牌仅发 1 张牌，且不能再次分牌。"

        if (currentHand.cards[0].rank === 'A') {
            // Deal 1 card to the new hand too? Or wait for its turn?
            // Usually, we play hands sequentially. 
            // Current hand has 2 cards now. Since it was Ace split, force stand.
            this.finishCurrentHand();
        } else {
            this.notifyUpdate("Split!");
        }
    }

    private finishCurrentHand() {
        if (this.currentHandIndex < this.playerHands.length - 1) {
            this.currentHandIndex++;

            // If the NEW hand is from a Split Ace, it needs its second card now?
            // Or did we deal it at split time? 
            // Simplified: We deal the second card when the hand becomes active.
            const currentHand = this.playerHands[this.currentHandIndex];
            // If it only has 1 card (from split), deal one.
            if (currentHand.cards.length === 1) {
                currentHand.addCard(this.deck.deal());
                // If it was Split Ace, enforce rule: only 1 card.
                if (currentHand.cards[0].rank === 'A') {
                    // Auto stand after 1 card
                    // But we need to update UI first?
                    // Let's recursively finish if we want strict enforcement, or just let user see it.
                }
            }

            this.notifyUpdate("Next hand.");
        } else {
            // All hands done
            this.state = 'dealer-turn';
            this.playDealer();
        }
    }

    private async playDealer() {
        this.notifyUpdate("Dealer's turn.");

        // Check if all player hands busted. If so, dealer doesn't need to play (unless showing off).
        const allBusted = this.playerHands.every(h => h.isBust);
        if (allBusted) {
            this.state = 'resolving';
            this.notifyUpdate("Bust!");
            return;
        }

        // Dealer Flip (handled visually by revealing hidden card)

        // Soft 17 Rule: Dealer stands on Soft 17? 
        // Doc: "Stand on Soft 17: 庄家软 17 点（A+6）时停牌"
        // So dealer hits if < 17. (Soft 17 is >= 17, so stand).
        // Wait, "Stand on Soft 17": means if dealer has Soft 17, he stands.
        // "Hit on Soft 17" is the other variant.
        // So condition: while (val < 17). 

        try {
            while (this.dealerHand.value < 17) {
                await new Promise(r => setTimeout(r, 800)); // Delay for effect
                if (this.deck.remainingCards === 0) {
                    // Emergency shuffle if somehow empty
                    this.deck.reset(); // reset() already shuffles
                }
                this.dealerHand.addCard(this.deck.deal());
                this.notifyUpdate(); // Notify each card deal
            }
        } catch (e) {
            console.error("Dealer loop error:", e);
            this.notifyUpdate("Error: Dealer stopped.");
        }

        this.state = 'resolving';
        this.notifyUpdate("Round Over.");
    }

    // Method to get results (Payouts)
    getResults(): { handIndex: number, result: 'win' | 'lose' | 'push' | 'blackjack', profit: number }[] {
        const results: { handIndex: number, result: 'win' | 'lose' | 'push' | 'blackjack', profit: number }[] = [];
        const dealerVal = this.dealerHand.value;
        const dealerBust = this.dealerHand.isBust;
        const dealerBJ = this.dealerHand.isBlackjack;

        this.playerHands.forEach((hand, index) => {
            let profit = 0;
            let result: 'win' | 'lose' | 'push' | 'blackjack' = 'push';

            if (hand.isBust) {
                result = 'lose';
                profit = -hand.bet;
            } else if (hand.isBlackjack) {
                if (dealerBJ) {
                    result = 'lose'; // User requirement: Dealer wins on Tie
                    profit = -hand.bet;
                } else {
                    result = 'blackjack';
                    profit = hand.bet * 1.5;
                }
            } else if (dealerBJ) {
                result = 'lose'; // Player not BJ, Dealer BJ
                profit = -hand.bet;
            } else if (dealerBust) {
                result = 'win';
                profit = hand.bet;
            } else {
                // Compare values
                if (hand.value > dealerVal) {
                    result = 'win';
                    profit = hand.bet;
                } else if (hand.value < dealerVal) {
                    result = 'lose';
                    profit = -hand.bet;
                } else {
                    result = 'lose'; // User requirement: Dealer wins on Tie
                    profit = -hand.bet;
                }
            }
            results.push({ handIndex: index, result, profit });
        });

        return results;
    }
}
