import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";

const outputPath = path.resolve(process.cwd(), "public/mtg-cards-slim.json");

async function run() {
  // Step 1: fetch bulk metadata
  const metaRes = await fetch("https://api.scryfall.com/bulk-data");
  const meta = await metaRes.json();
  const allCardsMeta = meta.data.find((d) => d.type === "all_cards");
  if (!allCardsMeta) throw new Error("No all_cards bulk data");

  // Step 2: fetch bulk JSON as stream
  const res = await fetch(allCardsMeta.download_uri);
  if (!res.ok) throw new Error("Failed to fetch bulk cards");

  // Step 3: set up stream chain to parse JSON array elements one by one
  const pipeline = chain([res.body, parser(), streamArray()]);

  // Step 4: create write stream for output JSON file
  const outStream = fs.createWriteStream(outputPath);
  outStream.write("[");

  let isFirst = true;

  pipeline.on("data", ({ value: card }) => {
    const slimCard = {
      id: card.id,
      card_faces: card.card_faces ?? null,
      color_identity: card.color_identity,
      image_uris: card.image_uris ?? null,
      mana_cost: card.mana_cost,
      name: card.name,
      set_name: card.set_name,
      set: card.set,
      tcgplayer_product_id: card.identifiers?.tcgplayer_product_id ?? null,
      type_line: card.type_line,
      prices: {
        usd: card.prices?.usd ?? null,
      },
    };

    const json = JSON.stringify(slimCard);
    if (!isFirst) outStream.write(",");

    outStream.write(json);
    isFirst = false;
  });

  pipeline.on("end", () => {
    outStream.write("]");
    outStream.end();
    console.log(`[!] Slimmed JSON written to ${outputPath}`);
  });

  pipeline.on("error", (err) => {
    console.error("[!] Streaming error:", err);
    process.exit(1);
  });
}

run().catch((err) => {
  console.error("[!] Error:", err);
  process.exit(1);
});
