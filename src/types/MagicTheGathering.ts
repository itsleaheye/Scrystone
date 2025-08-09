export interface Card {
  imageUrl?: string;
  manaTypes?: string[];
  name: string;
  number?: string;
  price?: number;
  rarity?: string;
  set: string;
  setName: string;
  type?: string;
  tcgPlayerId?: string;
}

export interface CollectionCard extends Card {
  quantityOwned: number;
}

export interface DeckCard extends Card {
  quantityNeeded: number;
  quantityOwned: number;
}

export type DeckFormat = "Commander" | "Standard" | "Draft";

export interface Deck {
  cards: DeckCard[];
  colours?: string[];
  description?: string;
  featureCard?: DeckCard;
  format: DeckFormat;
  id: number;
  isFavorite?: boolean;
  name: string;
  price?: number;
  size: number;
}

export interface CardTypeSummary {
  type: string;
  quantityNeeded: number;
  quantityOwned: number;
}
