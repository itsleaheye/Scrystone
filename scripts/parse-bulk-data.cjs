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

  const outStream = fs.createWriteStream(outputPath);
  outStream.write("[");

  let isFirst = true;

  pipeline.on("data", ({ value: card }) => {
    const layoutSkip = ["art_series", "token", "emblem", "planar"];
    if (layoutSkip.includes(card.layout)) return;

    if (!card.image_uris || card.digital || card.lang !== "en") return; // Skips cards without image_uris (tokens, emblems, etc.), non-En cards, and digital cards

    const slimCard = {
      id: card.id,
      name: card.name,
      set: card.set,
      mana_cost: card.mana_cost,
      type_line: card.type_line,
      image_uris: card.image_uris ?? null,
      prices: {
        usd: card.prices?.usd ?? null,
      },
      tcgplayer_product_id: card.identifiers?.tcgplayer_product_id ?? null,
    };

    const json = JSON.stringify(slimCard);

    if (!isFirst) {
      outStream.write(",");
    }

    outStream.write(json); // This must always be a string
    isFirst = false;
  });

  pipeline.on("end", () => {
    outStream.write("]");
    outStream.end();
    console.log(`[✓] Finished parsing Scryfall bulk data to ${outputPath}`);
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
