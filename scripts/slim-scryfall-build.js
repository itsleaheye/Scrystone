import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const outputPath = path.resolve(process.cwd(), "public/mtg-cards-slim.json");
const bulkApiUrl = "https://api.scryfall.com/bulk-data";

async function run() {
  // 1. Fetch bulk metadata
  const res = await fetch(bulkApiUrl);
  const data = await res.json();

  const allCardsMeta = data.data.find((d) => d.type === "all_cards");
  if (!allCardsMeta) throw new Error("No all_cards bulk data found");

  // 2. Download bulk cards JSON
  console.log("Downloading Scryfall bulk card data...");
  const bulkRes = await fetch(allCardsMeta.download_uri);
  if (!bulkRes.ok) throw new Error("Failed to download bulk cards JSON");
  const allCards = await bulkRes.json();

  console.log(`Processing ${allCards.length} cards...`);

  // 3. Slim down card data
  const slimmedCards = allCards.map((card) => ({
    id: card.id,
    card_faces: card.card_faces ?? null,
    color_identity: card.color_identity,
    image_uris: card.image_uris ?? null,
    mana_cost: card.mana_cost,
    name: card.name,
    prices: {
      usd: card.prices?.usd ?? null,
    },
    set_name: card.set_name,
    set: card.set,
    tcgplayer_product_id: card.identifiers?.tcgplayer_product_id ?? null,
    type_line: card.type_line,
  }));

  // 4. Write slimmed JSON to /public
  fs.writeFileSync(outputPath, JSON.stringify(slimmedCards));

  console.log(`[! Success] Slimmed data written to ${outputPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
