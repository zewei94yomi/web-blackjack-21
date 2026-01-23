import { Card } from './Card';

export type SideBetResult = {
    win: boolean;
    multiplier: number; // e.g., 25 for 25:1
    name?: string; // e.g., "Perfect Pair"
};

/**
 * Perfect Pairs Rules:
 * - Mixed Pair (Different Colors, same rank): 5:1
 * - Colored Pair (Same Color, different suit, same rank): 12:1
 * - Perfect Pair (Same Suit, Same Rank): 25:1
 */
export const evaluatePerfectPairs = (card1: Card, card2: Card): SideBetResult => {
    if (card1.rank !== card2.rank) {
        return { win: false, multiplier: 0 };
    }

    // It's a pair
    if (card1.suit === card2.suit) {
        return { win: true, multiplier: 25, name: "Perfect Pair" };
    }

    const isCard1Red = card1.suit === 'hearts' || card1.suit === 'diamonds';
    const isCard2Red = card2.suit === 'hearts' || card2.suit === 'diamonds';

    if (isCard1Red === isCard2Red) {
        // Same color (but different suit, since we checked exact suit above)
        return { win: true, multiplier: 12, name: "Colored Pair" };
    }

    // Different colors
    return { win: true, multiplier: 5, name: "Mixed Pair" };
};

/**
 * 21+3 (Poker Style) Rules:
 * Uses player's 2 cards + dealer's up card.
 * - Flush: 5:1
 * - Straight: 10:1
 * - Three of a Kind: 30:1
 * - Straight Flush: 40:1
 * - Suited Trips: 100:1
 */
export const evaluatePoker3 = (c1: Card, c2: Card, dealerCard: Card): SideBetResult => {
    const hand = [c1, c2, dealerCard];

    // Sort by rank value for straight check
    // Rank logic: 2=2...10=10, J=11, Q=12, K=13, A=14 (high for straights usually)
    // IMPORTANT: In 21+3, Ace is usually high or low? Standard poker rules apply. 
    // A-2-3 is a straight? usually A,K,Q and 3,2,A. 
    // Let's implement generic Poker logic.

    const getRankValue = (r: string): number => {
        if (['J', 'Q', 'K'].includes(r)) {
            // For Blackjack value they are 10, but for Poker rank they are distinct.
            if (r === 'J') return 11;
            if (r === 'Q') return 12;
            if (r === 'K') return 13;
        }
        if (r === 'A') return 14;
        return parseInt(r, 10);
    };

    const ranks = hand.map(c => getRankValue(c.rank)).sort((a, b) => a - b);
    const suits = hand.map(c => c.suit);

    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

    const isTrips = ranks[0] === ranks[1] && ranks[1] === ranks[2];

    // Straight logic
    // Normal straight: 5,6,7 -> difference of 1
    // A,2,3 -> 14, 2, 3 -> sorted: 2,3,14. Logic: 2,3, A(1).
    let isStraight = (ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1);

    // Special Ace Low Straight (A, 2, 3) 
    // ranks would be [2, 3, 14]
    if (!isStraight && ranks[2] === 14 && ranks[0] === 2 && ranks[1] === 3) {
        isStraight = true;
    }

    // Evaluation Priority (Highest to Lowest)

    // 1. Suited Trips (Same rank, same suit)
    if (isTrips && isFlush) {
        return { win: true, multiplier: 100, name: "Suited Trips" };
    }

    // 2. Straight Flush
    if (isStraight && isFlush) {
        return { win: true, multiplier: 40, name: "Straight Flush" };
    }

    // 3. Three of a Kind
    if (isTrips) {
        return { win: true, multiplier: 30, name: "Three of a Kind" };
    }

    // 4. Straight
    if (isStraight) {
        return { win: true, multiplier: 10, name: "Straight" };
    }

    // 5. Flush
    if (isFlush) {
        return { win: true, multiplier: 5, name: "Flush" };
    }

    return { win: false, multiplier: 0 };
};
