import { Card } from './Card';

export type HandType = 'normal' | 'blackjack' | 'bust';

export class Hand {
    cards: Card[] = [];
    bet: number = 0;
    /** Hands created by a split can total 21 but never count as a natural blackjack. */
    fromSplit: boolean = false;

    constructor(bet: number = 0) {
        this.bet = bet;
    }

    addCard(card: Card): void {
        this.cards.push(card);
    }

    get value(): number {
        let score = 0;
        let aces = 0;

        for (const card of this.cards) {
            score += card.value;
            if (card.rank === 'A') {
                aces += 1;
            }
        }

        // Adjust for aces if bust
        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    }

    get isSoft(): boolean {
        let score = 0;
        let aces = 0;

        for (const card of this.cards) {
            score += card.value;
            if (card.rank === 'A') {
                aces += 1;
            }
        }

        // If we have an Ace contributing 11, it is soft.
        // If we reduced all Aces to 1, it's hard.
        // To check this: calculate score with an Ace as 11. If <= 21, it is soft.
        // Simple logic: if score > 21 after fully expanding aces, we reduce them.
        // If we can support an Ace as 11 without busting, it is soft.

        // Let's re-calculate cleanly
        let tempScore = 0;
        let tempAces = 0;
        for (const card of this.cards) {
            tempScore += card.value; // Ace is 11
            if (card.rank === 'A') tempAces++;
        }

        while (tempScore > 21 && tempAces > 0) {
            tempScore -= 10;
            tempAces--;
        }

        // If after adjustments we still have an "active" Ace (as 11)
        // The number of aces contributing 11 is tempAces.
        return tempAces > 0;
    }

    get isBust(): boolean {
        return this.value > 21;
    }

    get isBlackjack(): boolean {
        return this.cards.length === 2 && this.value === 21 && !this.fromSplit;
    }

    canSplit(): boolean {
        if (this.cards.length !== 2) return false;
        // House rule: only split an exact rank pair (10-10, A-A) — not merely
        // equal value, so K-10 cannot be split. Matches the button gating in the UI.
        return this.cards[0].rank === this.cards[1].rank;
    }

    canDouble(): boolean {
        return this.cards.length === 2;
    }
}
