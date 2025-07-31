const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { chain } = require("stream-chain");
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");

const outputPath = path.resolve(process.cwd(), "public/mtg-cards-slim.json");

async function run() {
  const metaRes = await fetch("https://api.scryfall.com/bulk-data");
  const meta = await metaRes.json();
  const allCardsMeta = meta.data.find((d) => d.type === "all_cards");
  if (!allCardsMeta) throw new Error("No all_cards bulk data");

  const res = await fetch(allCardsMeta.download_uri);
  if (!res.ok) throw new Error("Failed to fetch bulk cards");

  const pipeline = chain([res.body, parser(), streamArray()]);
  const index = {};

  pipeline.on("data", ({ value: card }) => {
    const layoutSkip = ["art_series", "token", "emblem", "planar"];
    if (layoutSkip.includes(card.layout)) return;

    if (!card.image_uris || card.digital || card.lang !== "en") return;

    const slimCard = {
      id: card.id,
      name: card.name,
      set: card.set,
      setName: card.setName,
      mana_cost: card.mana_cost,
      type_line: card.type_line,
      image_uris: card.image_uris ?? null,
      prices: {
        usd: card.prices?.usd ?? null,
      },
      tcgplayer_product_id: card.identifiers?.tcgplayer_product_id ?? null,
    };

    // Can't import getCardKey() or normalizeCardName()
    const normalizedName = card.name
      .normalize("NFD") // Required for accents
      .replace(/\s*\([^)]+\)/g, "") // Remove all '()' groups
      .split(" - ")[0] // Use only the part before ' - s'
      .split("//")[0] // Use only the part before '//'
      .replace(/^(Checklist Card|Token|Token Card|Emblem|Plane)\s*-\s*/i, "") // Remove prefix
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/"/g, "") // Remove quotation marks
      .trim(); // Remove trailing white spaces
    const safeName = normalizedName.replace(/\//g, "-");
    const cardKey = card.set ? `${safeName}-${card.set}` : safeName;

    // Fallback index name without set
    if (!index[safeName]) index[safeName] = slimCard;
    index[cardKey] = slimCard;
  });

  pipeline.on("end", () => {
    fs.writeFileSync(outputPath, JSON.stringify(index));
    console.log(`[✓] Successfully saved indexed card data to ${outputPath}`);
  });

  pipeline.on("error", (error) => {
    console.error("Stream error:", error);
    process.exit(1);
  });
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
