import {
  normalizeCardName,
  normalizeColourIdentity,
  normalizeMana,
} from "./normalize";
import { getCachedCard, getCardFromBulkData, setCachedCard } from "./storage";

interface ScryfallDetails {
  manaCost?: number;
  manaTypes?: string[];
  previewUrl?: string;
  price: number;
  type: string;
  set: string;
}

export async function getScryfallCard(
  cardName: string
): Promise<ScryfallDetails | undefined> {
  const normalizedName = normalizeCardName(cardName);
  const query = encodeURIComponent(normalizedName);

  // Check if we have a cached version of this card first
  const cached = getCachedCard(normalizedName);
  if (cached) {
    return formatScryfallDetails(cached);
  }

  const localCard = getCardFromBulkData(cardName);
  if (localCard) {
    return formatScryfallDetails(localCard);
  }

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
    normalizeColourIdentity(card.color_identity) ?? card.mana_cost;
  const { cost, colours } = manaCost
    ? normalizeMana(manaCost as string)
    : { cost: undefined, colours: undefined };

  return {
    previewUrl:
      card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
    price: parseFloat(card.prices?.usd) || 0,
    manaCost: cost,
    manaTypes: colours,
    type: card.type_line?.split("—")[0]?.trim().split(" ")[0],
    set: card.set_name,
  };
}

const BULK_DATA = "scryfall_bulk_data";

export async function fetchAndCacheBulkData(): Promise<any[]> {
  const cached = localStorage.getItem(BULK_DATA);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(BULK_DATA); // corrupted cache
    }
  }

  // Download the bulk data from scryfall
  const res = await fetch("https://api.scryfall.com/bulk-data");
  const data = await res.json();
  const defaultCards = data.data.find(
    (entry: any) => entry.type === "default_cards"
  );
  if (!defaultCards?.download_uri)
    throw new Error("Failed to get download URI");

  const cardsRes = await fetch(defaultCards.download_uri);
  const cards = await cardsRes.json();

  localStorage.setItem(BULK_DATA, JSON.stringify(cards));

  return cards;
}
