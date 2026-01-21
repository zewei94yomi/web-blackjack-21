import { Card } from './src/engine/Card';
import { Deck } from './src/engine/Deck';
import { Hand } from './src/engine/Hand';
import { BlackjackEngine } from './src/engine/BlackjackEngine';

// Verification Script

console.log("=== Testing Card Logic ===");
const card1 = new Card('hearts', 'A');
console.log(`Card: ${card1.toString()}, Value: ${card1.value} (Expect 11)`);
const card2 = new Card('spades', 'K');
console.log(`Card: ${card2.toString()}, Value: ${card2.value} (Expect 10)`);
const card3 = new Card('clubs', '5');
console.log(`Card: ${card3.toString()}, Value: ${card3.value} (Expect 5)`);

console.log("\n=== Testing Deck Logic ===");
const deck = new Deck(1); // 1 deck for easier probability check
console.log(`Initial Cards: ${deck.remainingCards}`);
deck.deal();
console.log(`After 1 deal: ${deck.remainingCards}`);
deck.reset();
console.log(`After reset: ${deck.remainingCards}`);

console.log("\n=== Testing Hand Logic (Soft Ace) ===");
const hand = new Hand(100);
hand.addCard(new Card('hearts', 'A'));
hand.addCard(new Card('clubs', '6'));
console.log(`Hand: A, 6. Value: ${hand.value} (Expect 17). Soft: ${hand.isSoft} (Expect true)`);
hand.addCard(new Card('diamonds', '10'));
console.log(`Hand: A, 6, 10. Value: ${hand.value} (Expect 17). Soft: ${hand.isSoft} (Expect false)`);
hand.addCard(new Card('spades', '5'));
console.log(`Hand: A, 6, 10, 5. Value: ${hand.value} (Expect 22). Bust: ${hand.isBust} (Expect true)`);

console.log("\n=== Testing Engine Flow (Mock) ===");
const engine = new BlackjackEngine();
engine.setListener({
    onStateChange: (state) => console.log(`[Engine] State: ${state}`),
    onHandsUpdate: (d, p, i) => {
        console.log(`[Engine] Dealer: ${d.value} (${d.cards.length} cards)`);
        console.log(`[Engine] Player: ${p[0].value} (${p[0].cards.length} cards)`);
    },
    onMessage: (msg) => console.log(`[Engine] Message: ${msg}`)
});

console.log("-> Placing Bet");
engine.placeBet(100);
console.log("-> Hitting");
engine.hit();
console.log("-> Standing");
engine.stand(); // This should trigger dealer play
console.log("-> Results");
const results = engine.getResults();
console.log(JSON.stringify(results, null, 2));

console.log("=== Tests Completed ===");
