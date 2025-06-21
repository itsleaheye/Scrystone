export interface Card {
  artist?: string;
  imageUrl?: string;
  manaCost?: number;
  manaType?: string;
  name: string;
  number?: string;
  price?: number;
  rarity?: string;
  set?: string;
  type?: string;
  isFoil?: boolean;
}

export interface CollectionCard extends Card {
  quantityOwned: number;
}

export interface DeckCard extends Card {
  quantityNeeded: number;
}

export interface MissingCard extends Card {
  card: Card;
  quantityNeeded: number;
  quantityOwned: number;
}

export interface Deck {
  cards: DeckCard[];
  colours?: string[];
  description?: string;
  isFavorite?: boolean;
  name: string;
  format: "Commander" | "Standard";
  size: number;
  value?: number;
}
