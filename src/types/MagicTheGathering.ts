export interface Card {
  imageUrl?: string;
  manaCost?: number;
  manaTypes?: string[];
  name: string;
  number?: string;
  price?: number;
  rarity?: string;
  set?: string;
  type?: string;
  isFoil?: boolean; // To do: Might remove this
}

export interface CollectionCard extends Card {
  quantityOwned: number;
}

export interface DeckCard extends Card {
  quantityNeeded: number;
  quantityOwned: number;
}

export interface Deck {
  id: number;
  cards: DeckCard[];
  colours?: string[];
  description?: string;
  isFavorite?: boolean;
  name: string;
  format: "Commander" | "Standard";
  size: number;
  price?: number;
}

export interface CardTypeSummary {
  type: string;
  quantityNeeded: number;
  quantityOwned: number;
}
