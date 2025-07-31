import { findCardByName, findCardByNameAndSet } from "./cards";
import { normalizeCardName, normalizeMana, normalizeSet } from "./normalize";

interface ScryfallDetails {
  manaTypes?: string[];
  name: string;
  imageUrl?: string;
  price: number;
  set: string;
  setName: string;
  type: string;
}

interface getScryfallCardProps {
  cardName: string;
  set?: string;
  tcgPlayerId?: string;
}

export async function getScryfallCard({
  cardName,
  set,
  tcgPlayerId,
}: getScryfallCardProps): Promise<ScryfallDetails | undefined> {
  const normalizedName = normalizeCardName(cardName);

  const localMatch =
    (set && findCardByNameAndSet(cardName, set)) || findCardByName(cardName);
  if (localMatch) {
    return formatScryfallDetails(localMatch);
  }

  if (tcgPlayerId) {
    try {
      const res = await fetch(
        `https://api.scryfall.com/cards/tcgplayer/${tcgPlayerId}`
      );
      if (res.ok) {
        const data = await res.json();
        return formatScryfallDetails(data);
      }
    } catch (error) {
      console.warn("Failed TCGPlayer fallback:", error);
    }
  }

  const encodedName = encodeURIComponent(normalizedName);
  const fallbackUrls = [
    `https://api.scryfall.com/cards/search?q=${encodedName}${
      set ? `+set:${set}` : ""
    }`,
    `https://api.scryfall.com/cards/named?fuzzy=${encodedName}`,
  ];

  for (const url of fallbackUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();

      if (Array.isArray(data.data)) {
        const matchingCard = data.data.find(
          (card: any) => (!set || card.set === set) && !card.set
        );
        if (matchingCard) {
          return formatScryfallDetails(matchingCard);
        }
      }

      if (data && (!set || data.set === set)) {
        return formatScryfallDetails(data);
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${url}`, error);
    }
  }

  return undefined;
}

export function formatScryfallDetails(card: any): ScryfallDetails {
  const { colours } = normalizeMana(card.mana_cost);

  return {
    imageUrl:
      card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
    manaTypes: colours ?? [],
    name: card.name,
    price: parseFloat(card.prices?.usd) || 0,
    set: card.set,
    setName: normalizeSet(card.set),
    type: card.type_line?.split("—")[0].trim(),
  };
}
