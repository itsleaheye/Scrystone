import { findCardByNameAndSet, loadBulkCardData } from "./cards";
import { normalizeCardName, normalizeMana } from "./normalize";
import { getCachedCard, setCachedCard } from "./storage";

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
  const cacheKey = `${normalizedName}-${set}`;
  const cached = getCachedCard(cacheKey);
  if (cached) return formatScryfallDetails(cached);

  await loadBulkCardData();
  const card = findCardByNameAndSet(cardName, set);
  if (!card) {
    console.warn(`Card not found locally: ${cardName}`);
    return;
  }

  // Fetch with tcg player ID as a backup
  if (tcgPlayerId) {
    const url = `https://api.scryfall.com/cards/tcgplayer/${tcgPlayerId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setCachedCard(cacheKey, data);

      return formatScryfallDetails(data);
    }
  }

  setCachedCard(cacheKey, card);
  return formatScryfallDetails(card);
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
    setName: card.set_name ?? card.set,
    type: card.type_line?.split("—")[0]?.trim().split(" ")[0],
  };
}
