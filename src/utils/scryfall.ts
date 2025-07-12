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
}

export async function getScryfallCard(
  cardName: string,
  tcgPlayerId?: string
): Promise<ScryfallDetails | undefined> {
  const cached = getCachedCard(cardName);
  if (cached) return formatScryfallDetails(cached);
  // Try to fetch card details by TCGPlayer ID first
  if (tcgPlayerId) {
    const url = `https://api.scryfall.com/cards/tcgplayer/${tcgPlayerId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setCachedCard(cardName, data);

      return formatScryfallDetails(data);
    }
  }

  // Fallback to searching by card name
  const normalizedName = normalizeCardName(cardName);

  const query = encodeURIComponent(normalizedName);
  const urls = [
    `https://api.scryfall.com/cards/named?fuzzy=${query}`, //fuzzy search
    `https://api.scryfall.com/cards/search?q=${query}`, // general search
    `https://api.scryfall.com/cards/search?q=!${query}`, // exact search
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
    set: card.set_name,
  };
}
