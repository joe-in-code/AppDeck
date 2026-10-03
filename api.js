// api.js — Minimal AppDeck API Layer
const express = require('express');
const router = express.Router();

// ---- CONFIG ----
const API_KEY = process.env.APPDECK_API_KEY || "super-secret-key";

// ---- AUTH MIDDLEWARE ----
router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// ---- STORAGE HOOKS (YOU EDIT THESE 2 FUNCTIONS) ----
const loadDeck = (deckId) => {
  // TODO: Replace with your actual deck loading logic
  return global.AppDeck.decks[deckId];
};

const saveDeck = (deckId, deck) => {
  // TODO: Replace with your actual deck saving logic
  global.AppDeck.decks[deckId] = deck;
};

const loadCard = (cardId) => {
  // TODO: Replace with your actual card loading logic
  return global.AppDeck.cards[cardId];
};

const saveCard = (cardId, card) => {
  // TODO: Replace with your actual card saving logic
  global.AppDeck.cards[cardId] = card;
};

// ---- ENDPOINTS ----

// Create card
router.post('/cards', (req, res) => {
  const { deckId, type, title, content } = req.body;

  const id = `card_${Date.now()}`;
  const card = { id, deckId, type, title, content };

  saveCard(id, card);

  const deck = loadDeck(deckId);
  deck.cards.push(id);
  saveDeck(deckId, deck);

  res.json({ id });
});

// Update card
router.put('/cards/:id', (req, res) => {
  const card = loadCard(req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  Object.assign(card, req.body);
  saveCard(req.params.id, card);

  res.json({ updated: true });
});

// Add card to deck
router.post('/decks/:deckId/cards', (req, res) => {
  const deck = loadDeck(req.params.deckId);
  if (!deck) return res.status(404).json({ error: "Deck not found" });

  deck.cards.push(req.body.cardId);
  saveDeck(req.params.deckId, deck);

  res.json({ added: true });
});

// List deck
router.get('/decks/:deckId', (req, res) => {
  const deck = loadDeck(req.params.deckId);
  if (!deck) return res.status(404).json({ error: "Deck not found" });

  res.json(deck);
});

module.exports = router;