export interface Card {
  imageUrl?: string;
  manaTypes?: string[];
  name: string;
  number?: string;
  price?: number;
  rarity?: string;
  set?: string;
  type?: string;
  tcgPlayerId?: string;
}

export interface CollectionCard extends Card {
  quantityOwned: number;
}

export interface DeckCard extends Card {
  quantityNeeded: number;
  quantityOwned: number;
  setPreference?: string;
}

export type DeckFormat = "Commander" | "Standard" | "Draft";

export interface Deck {
  id: number;
  cards: DeckCard[];
  colours?: string[];
  description?: string;
  isFavorite?: boolean;
  name: string;
  format: DeckFormat;
  size: number;
  price?: number;
}

export interface CardTypeSummary {
  type: string;
  quantityNeeded: number;
  quantityOwned: number;
}
