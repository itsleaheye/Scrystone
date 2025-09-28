import type {
  Card,
  CardTypeSummary,
  CollectionCard,
  Deck,
  DeckCard,
} from "../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";
import { getCardsFromStorage, getDecksFromStorage } from "./storage";

export function getDeckManaSummary(cards: DeckCard[]) {
  const allManaTypes = new Set<string>();

  for (const card of cards) {
    for (const manaType of card.manaTypes ?? []) {
      const upper = manaType.toUpperCase();
      if (upper.length === 1 && upper >= "A" && upper <= "Z") {
        allManaTypes.add(upper);
      }
    }
  }
  return [...allManaTypes].sort();
}

export function getDeckCost(cards: (Card | DeckCard)[]): number {
  return cards.reduce((sum, { price }) => sum + (Number(price) || 0), 0);
}

export function generateUniqueDeckId() {
  return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
}

export async function getDeckTypeSummary(cards: DeckCard[]) {
  const ownedCards: CollectionCard[] = await getCardsFromStorage();
  const ownedMap = new Map<string, number>();

  for (const card of ownedCards) {
    const normalizedCardName = normalizeCardName(card.name);
    ownedMap.set(
      normalizedCardName,
      (ownedMap.get(normalizedCardName) ?? 0) + (card.quantityOwned ?? 0)
    );
  }

  const deckCountByName = new Map<
    string,
    { type: string; quantityNeeded: number; setName: string }
  >();

  cards.forEach((card) => {
    if (!card.name || !card.type) return;

    deckCountByName.set(normalizeCardName(card.name), {
      type: card.type,
      quantityNeeded: card?.quantityNeeded ?? 0,
      setName: card.setName,
    });
  });

  const quantityNeededByType = new Map<string, number>();
  const quantityOwnedByType = new Map<string, number>();

  deckCountByName.forEach(({ type, quantityNeeded }, cardName) => {
    let quantityOwned = 0;

    quantityOwned = ownedCards
      .filter((card) => normalizeCardName(card.name) === cardName)
      .reduce((sum, card) => sum + (card.quantityOwned ?? 0), 0);

    quantityNeededByType.set(
      type,
      (quantityNeededByType.get(type) ?? 0) + quantityNeeded
    );
    quantityOwnedByType.set(
      type,
      (quantityOwnedByType.get(type) ?? 0) +
        Math.min(quantityOwned, quantityNeeded)
    );
  });

  return Array.from(quantityNeededByType.entries()).map(
    ([type, quantityNeeded]) => ({
      type,
      quantityNeeded: Number(quantityNeeded),
      quantityOwned: Number(quantityOwnedByType.get(type) ?? 0),
    })
  );
}

const DEFAULT_TYPES = [
  "Artifact",
  "Creature",
  "Enchantment",
  "Instant",
  "Land",
  "Sorcery",
];

export async function getDeckTypeSummaryWithDefaults(
  cards: DeckCard[]
): Promise<CardTypeSummary[]> {
  const summary = await getDeckTypeSummary(cards);
  const summaries = new Map(summary.map((item) => [item.type, item]));

  return DEFAULT_TYPES.map(
    (type) =>
      summaries.get(type) ?? { type, quantityNeeded: 0, quantityOwned: 0 }
  );
}

export function isDeckReady(deck: Deck): boolean {
  const deckSize = deck.cards.reduce(
    (sum, card) => sum + (card.quantityNeeded || 0),
    0
  );

  let requiredSize = 60;
  switch (deck.format) {
    case "Commander":
      requiredSize = 100;
      break;
    case "Standard":
      requiredSize = 60;
      break;
    case "Draft":
      requiredSize = 40;
      break;
    default:
      requiredSize = 60; // Default to standard
      break;
  }

  return deckSize == requiredSize;
}

interface isCardInOtherDecksProps {
  card: DeckCard;
  currentDeckId: number;
}

export async function isCardInOtherDecks({
  card,
  currentDeckId,
}: isCardInOtherDecksProps) {
  const decks = await getDecksFromStorage();
  if (!decks || decks.length === 0 || !card.name || card.type === "Land")
    return { inOtherDecks: [], count: 0 };

  const otherDecks = decks.filter(
    (deck) =>
      deck.id !== currentDeckId && // Exclude the current deck
      deck.cards.some(
        (deckCard) =>
          normalizeCardName(deckCard.name) === normalizeCardName(card.name)
      )
  );

  const otherDecksMap = otherDecks.map((deck) => ({
    id: deck.id,
    name: deck.name,
  }));

  return {
    inOtherDecks: otherDecksMap,
    count: otherDecksMap.length,
  };
}

export interface DrawnCard {
  name: string;
  imageUrl?: string;
}

export function drawHand(deck: Deck) {
  if (!deck || !deck.cards || deck.cards.length === 0) {
    console.warn("Deck is empty. Cannot draw opening hand.");
    return [];
  }

  const AMOUNT_DRAWN = 7;

  const expandedCardList: DrawnCard[] = [];
  deck.cards.forEach((card) => {
    const quantity = card.quantityNeeded ?? 1;
    for (let i = 0; i < quantity; i++) {
      expandedCardList.push({ name: card.name, imageUrl: card.imageUrl });
    }
  });

  // Fisher-Yates shuffle algorithm, chosen for being the most common for simulated shuffling
  for (let i = expandedCardList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [expandedCardList[i], expandedCardList[j]] = [
      expandedCardList[j],
      expandedCardList[i],
    ];
  }

  return expandedCardList.slice(0, AMOUNT_DRAWN);
}
