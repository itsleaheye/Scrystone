import { findCardByNameAndSet, loadBulkCardData } from "./cards";
import {
  normalizeCardName,
  normalizeColourIdentity,
  normalizeMana,
} from "./normalize";
import { getCachedCard, setCachedCard } from "./storage";

interface ScryfallDetails {
  manaTypes?: string[];
  previewUrl?: string;
  price: number;
  type: string;
  set: string;
  setName: string;
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

  await loadBulkCardData();
  const card = findCardByNameAndSet(cardName, set);
  if (!card) {
    console.warn(`Card not found locally: ${cardName}`);
    return;
  }

  setCachedCard(cacheKey, card);
  return formatScryfallDetails(card);
}

function formatScryfallDetails(card: any): ScryfallDetails {
  const manaCost =
    card.color_identity !== undefined
      ? normalizeColourIdentity(card.color_identity)
      : card.mana_cost;
  card.mana_cost; //Scryfall uses American spelling and underscores
  const { colours } = manaCost
    ? normalizeMana(manaCost as string)
    : { colours: undefined };

  return {
    previewUrl:
      card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
    price: parseFloat(card.prices?.usd) || 0,
    manaTypes: colours,
    type: card.type_line?.split("—")[0]?.trim().split(" ")[0],
    set: card.set,
    setName: card.set_name,
  };
}
