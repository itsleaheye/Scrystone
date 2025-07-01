import { normalizeCardName, normalizeMana } from "./normalize";

interface ScryfallDetails {
  manaCost?: number;
  manaTypes?: string[];
  previewUrl?: string;
  price: number;
  type: string;
}

export async function getScryfallCard(
  cardName: string
): Promise<ScryfallDetails | undefined> {
  const query = encodeURIComponent(normalizeCardName(cardName));
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

    // Normalizes our returned data to a single card object
    const card = Array.isArray(data.data) ? data.data[0] : data;

    // Parse mana string
    const { cost, colours } = card.mana_cost
      ? normalizeMana(card.mana_cost)
      : { cost: undefined, colours: undefined };

    return {
      previewUrl:
        card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
      price: parseFloat(card.prices?.usd) || 0,
      manaCost: cost,
      manaTypes: colours,
      type: card.type_line?.split("—")[0]?.trim().split(" ")[0],
    };
  } catch (error) {
    console.error(`Error fetching card details for "${cardName}":`, error);

    return;
  }
}
