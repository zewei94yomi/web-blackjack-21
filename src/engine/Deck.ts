import { Card, type Suit, type Rank } from './Card';

export class Deck {
    private cards: Card[] = [];
    private readonly numDecks: number;

    constructor(numDecks: number = 6) {
        this.numDecks = numDecks;
        this.reset();
    }

    reset(): void {
        this.cards = [];
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (let i = 0; i < this.numDecks; i++) {
            for (const suit of suits) {
                for (const rank of ranks) {
                    this.cards.push(new Card(suit, rank));
                }
            }
        }
        this.shuffle();
    }

    shuffle(): void {
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(): Card {
        if (this.cards.length === 0) {
            throw new Error("Deck is empty!");
        }
        return this.cards.pop()!;
    }

    get remainingCards(): number {
        return this.cards.length;
    }

    // Penetration check (< 25% remaining)
    get needsShuffle(): boolean {
        const totalCards = this.numDecks * 52;
        return this.cards.length < (totalCards * 0.25);
    }
}
