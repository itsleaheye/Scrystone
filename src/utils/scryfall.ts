import {
  normalizeCardName,
  normalizeColorIdentity,
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

  // Try to fetch card details by TCGPlayer ID first
  if (tcgPlayerId) {
    const url = `https://api.scryfall.com/cards/tcgplayer/${tcgPlayerId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setCachedCard(cacheKey, data);

      return formatScryfallDetails(data);
    }
  }

  const query = encodeURIComponent(normalizedName);
  const urls = [
    `https://api.scryfall.com/cards/search?q=!${query}&set:${set}`, // exact search + set filter
    `https://api.scryfall.com/cards/search?q=${query}&set:${set}`, // fuzzy search + set filter
    `https://api.scryfall.com/cards/named?fuzzy=${query}`, // fallback fuzzy named search without set filter
    `https://api.scryfall.com/cards/search?q=${query}&set:${set}`,
  ];

  try {
    let data: any;
    // Run through each query url and check for a match of scyfall card data
    for (const url of urls) {
      const response = await fetch(url);
      if (!response.ok) continue;

      data = await response.json();

      // If response returns an array, take the 1st card and stop if valid
      data = Array.isArray(data.data) ? data.data[0] : data;
      if (data) break;
    }

    // If no matching cards were ever found, log it
    if (!data) {
      console.warn(`Card details not found: ${cardName}`);
      return;
    }

    setCachedCard(normalizedName, data);
    return formatScryfallDetails(data);
  } catch (error) {
    console.error(`Error fetching card details for "${cardName}":`, error);
    return;
  }
}

function formatScryfallDetails(card: any): ScryfallDetails {
  const manaCost =
    normalizeColorIdentity(card.color_identity) ?? card.mana_cost; //Scryfall uses American spelling and underscores
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
