// import type { CollectionCard } from "../types/MagicTheGathering";
// import { loadBulkCardData } from "./cards";
// import { normalizeCardName } from "./normalize";
// import { getScryfallCard } from "./scryfall";

// const REQUEST_DELAY_MS = 100;

// export async function parseTxtToCollection(
//   collectionFile: string,
//   onProgress?: (processed: number, total: number) => void
// ): Promise<CollectionCard[]> {
//   // // await loadBulkCardData();
//   // // const rawCards: { quantity: number; cardName: string; set: string }[] = [];
//   // // collectionFile.split("\n").forEach((line) => {
//   // //   const trimmed = line.trim();
//   // //   if (!trimmed) return;
//   // //   const match = trimmed.match(/^\s*(\d+)[xX]?\s+(.+)$/); // Supports `1x name`, `1 name`, `1 x name`, and `1X name`
//   // //   if (!match) return;
//   // //   const quantity = parseInt(match[1], 10);
//   // //   const cardName = normalizeCardName(match[2].trim());
//   // //   // Skips unwanted card types
//   // //   if (
//   // //     !cardName ||
//   // //     cardName.toLowerCase().includes("token") ||
//   // //     cardName.toLowerCase().includes("checklist") ||
//   // //     cardName.toLowerCase().includes("art card")
//   // //   ) {
//   // //     return;
//   // //   }
//   // //   rawCards.push({ quantity, cardName, set });
//   // // });
//   // // let completedCards = 0;
//   // // const total = rawCards.length;
//   // // const processCard = async (rawCard: {
//   // //   quantity: number;
//   // //   cardName: string;
//   // //   set: string;
//   // // }): Promise<CollectionCard | null> => {
//   // //   try {
//   // //     const scryfallData = await getScryfallCard({
//   // //       cardName: rawCard.cardName,
//   // //       set: rawCard.set,
//   // //     });
//   // //     if (!scryfallData) return null;
//   // //     return {
//   // //       ...scryfallData,
//   // //       quantityOwned: rawCard.quantity || 1,
//   // //       setName: scryfallData.setName,
//   // //       set: scryfallData.set,
//   // //     };
//   // //   } catch (error) {
//   // //     console.warn(`Failed to fetch card: ${rawCard.cardName}`, error);
//   // //     return null;
//   // //   }
//   // };
//   // // Fetch all cards in parallel, staggered
//   // const parsedCards = await Promise.all(
//   //   rawCards.map(
//   //     (rawCard, i) =>
//   //       new Promise<CollectionCard | null>((resolve) =>
//   //         setTimeout(async () => {
//   //           try {
//   //             const result = await processCard(rawCard);
//   //             resolve(result);
//   //           } finally {
//   //             completedCards++;
//   //             onProgress?.(completedCards, total);
//   //           }
//   //         }, i * REQUEST_DELAY_MS)
//   //       )
//   //   )
//   // );
//   // return parsedCards.filter((card): card is CollectionCard => card !== null);
// }
