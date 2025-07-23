const fs = require("fs");
const path = require("path");
const { chain } = require("stream-chain");
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const { Writable } = require("stream");

// We need to stream the bulk JSON due to error "ERR_STRING_TOO_LONG: Cannot create a string longer than 0x1fffffe8 characters"
const inputPath = path.resolve(__dirname, "../public/mtg-cards-bulk.json");
const outputPath = path.resolve(__dirname, "../public/mtg-cards-slim.json");

const outputStream = fs.createWriteStream(outputPath);
outputStream.write("[");

let isFirst = true;

const pipeline = chain([
  fs.createReadStream(inputPath),
  parser(),
  streamArray(),
  new Writable({
    objectMode: true,
    write({ value: card }, _, callback) {
      const slimCard = {
        id: card.id,
        name: card.name,
        set: card.set,
        set_name: card.set_name,
        mana_cost: card.mana_cost,
        color_identity: card.color_identity,
        type_line: card.type_line,
        image_uris: card.image_uris ?? null,
        card_faces: card.card_faces ?? null,
        prices: {
          usd: card.prices?.usd ?? null,
        },
        tcgplayer_product_id: card.identifiers?.tcgplayer_product_id ?? null,
      };

      const json = JSON.stringify(slimCard);
      outputStream.write((isFirst ? "" : ",") + json);
      isFirst = false;

      callback();
    },
  }),
]);

pipeline.on("end", () => {
  outputStream.write("]");
  outputStream.end();
  console.log(`[!] Success! Slimmed JSON to: ${outputPath}`);
});

pipeline.on("error", (error) => {
  console.error("[!] Error:", error);
});
