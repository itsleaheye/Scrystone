export interface Card {
  artist?: string;
  imageUrl?: string;
  manaCost?: number;
  manaType?: string;
  name: string;
  number?: string;
  price?: number;
  quantity: number;
  rarity?: string;
  set?: string;
  type?: string;
  isFoil?: boolean;
}

type PlayStyle = "Commander" | "Standard";

interface DeckCards extends Card {
  isOwned?: boolean;
}

export interface Deck {
  cards: DeckCards[];
  description?: string;
  isFavorite?: boolean;
  name: string;
  playStyle: PlayStyle;
  size: number;
  value?: number;
  colours?: string[];
}
