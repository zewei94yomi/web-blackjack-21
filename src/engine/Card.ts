export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export class Card {
    readonly suit: Suit;
    readonly rank: Rank;
    readonly value: number;

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
        this.value = this.calculateValue(rank);
    }

    private calculateValue(rank: Rank): number {
        if (['J', 'Q', 'K'].includes(rank)) return 10;
        if (rank === 'A') return 11; // A acts as 11 primarily, logic handles reduction
        return parseInt(rank, 10);
    }

    toString(): string {
        return `${this.rank} of ${this.suit}`;
    }
}
