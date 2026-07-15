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

    /** True when the player accepted "Even Money" on a blackjack vs a dealer Ace. */
    private evenMoneyTaken = false;

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

    reset() {
        this.deck = new Deck(6);
        this.dealerHand = new Hand();
        this.playerHands = [new Hand()];
        this.currentHandIndex = 0;
        this.state = 'waiting-bet';
        this.evenMoneyTaken = false;
        this.notifyUpdate();
    }

    private notifyUpdate(msg: string = "") {
        if (this.listener) {
            this.listener.onStateChange(this.state);
            this.listener.onHandsUpdate(this.dealerHand, this.playerHands, this.currentHandIndex);
            if (msg) this.listener.onMessage(msg);
        }
    }

    placeBet(amount: number) {
        // Sets up the bet only; the round starts later via startRound().
        if (this.state !== 'waiting-bet' && this.state !== 'resolving') return;
        if (amount <= 0) return;

        if (this.playerHands.length === 0 || this.state === 'resolving') {
            // Starting a fresh round: clear the previous hands.
            this.playerHands = [new Hand(amount)];
            this.dealerHand = new Hand();
            this.currentHandIndex = 0;
            this.evenMoneyTaken = false;
            this.state = 'waiting-bet';
        } else {
            // Same betting phase: accumulate onto the existing bet.
            this.playerHands[0].bet += amount;
        }

        this.notifyUpdate();
    }

    startRound() {
        if (this.playerHands[0].bet <= 0) return;

        this.evenMoneyTaken = false;
        this.state = 'dealing';
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


        // Enter 'playing' so the store can resolve side bets against the opening
        // cards, then hand control to the player after a short beat.
        this.state = 'playing';
        this.notifyUpdate("Side Bets...");

        setTimeout(() => {
            if (this.state === 'playing') { // Guard: may have already resolved.
                this.state = 'player-turn';
                this.notifyUpdate("Your turn.");
            }
        }, 1500); // Delay lets the side-bet outcome show.
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

        // Double the bet, deal exactly one card, then the hand is done.
        currentHand.bet *= 2;
        currentHand.addCard(this.deck.deal());
        audioManager.playDealSound();

        this.finishCurrentHand();
    }

    takeEvenMoney() {
        if (this.state !== 'offering-even-money') return;

        // Even money pays 1:1 guaranteed. getResults() reads evenMoneyTaken.
        this.evenMoneyTaken = true;
        this.state = 'resolving';
        this.notifyUpdate("Even Money!");
    }

    declineEvenMoney() {
        if (this.state !== 'offering-even-money') return;

        // Player holds a natural blackjack, so there is nothing left to act on:
        // reveal the dealer and resolve (3:2 win, or push if the dealer also has BJ).
        this.state = 'dealer-turn';
        this.notifyUpdate("Playing it out...");
        this.playDealer();
    }

    split() {
        if (this.state !== 'player-turn') return;
        const currentHand = this.playerHands[this.currentHandIndex];
        if (!currentHand.canSplit()) return;
        // Max splits check? MVP simplified: let's allow basic split first.

        // Create new hand
        const splitCard = currentHand.cards.pop()!;
        const newHand = new Hand(currentHand.bet);
        newHand.fromSplit = true;
        currentHand.fromSplit = true; // 21 on either split hand pays 1:1, not 3:2.
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

    private async finishCurrentHand() {
        if (this.currentHandIndex < this.playerHands.length - 1) {
            this.currentHandIndex++;

            const currentHand = this.playerHands[this.currentHandIndex];
            if (currentHand.cards.length === 1) {
                currentHand.addCard(this.deck.deal());
            }

            this.notifyUpdate("Next hand.");
        } else {
            // All hands done
            const allBusted = this.playerHands.every(h => h.isBust);
            if (allBusted) {
                this.notifyUpdate("Busted!");
                await new Promise(r => setTimeout(r, 1200)); // Short pause to see bust
                this.state = 'resolving';
                this.notifyUpdate("Round Over.");
                return;
            }

            this.state = 'dealer-turn';
            await this.playDealer();
        }
    }

    private async playDealer() {
        this.notifyUpdate("Dealer's turn...");
        await new Promise(r => setTimeout(r, 1000)); // Pause before revealing

        // Dealer Flip (handled visually by revealing hidden card)
        this.notifyUpdate("Revealing...");
        await new Promise(r => setTimeout(r, 1000)); // Pause after revealing

        try {
            while (this.dealerHand.value < 17) {
                if (this.deck.remainingCards === 0) {
                    this.deck.reset();
                }
                this.dealerHand.addCard(this.deck.deal());
                audioManager.playDealSound();
                this.notifyUpdate("Dealer hits...");
                await new Promise(r => setTimeout(r, 800)); // Delay between hits
            }
        } catch (e) {
            console.error("Dealer loop error:", e);
        }

        this.notifyUpdate("Dealer stands.");
        await new Promise(r => setTimeout(r, 1500)); // Final pause before resolving

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

            if (this.evenMoneyTaken && hand.isBlackjack) {
                // Player locked in a guaranteed 1:1 payout on their blackjack.
                result = 'win';
                profit = hand.bet;
            } else if (hand.isBust) {
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
