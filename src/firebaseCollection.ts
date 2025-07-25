import { db, auth } from "./firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import type { CollectionCard } from "./types/MagicTheGathering";
import { normalizeCardName } from "./utils/normalize";

export const saveCollection = async (cards: CollectionCard[]) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const collectionRef = collection(db, "users", uid, "collection");

  for (const card of cards) {
    const normalizedName = normalizeCardName(card.name);
    const cacheKey = `${normalizedName}-${card.set}`;
    await setDoc(doc(collectionRef, cacheKey), card); // Using card name as ID, instead of set and cardname
  }
};
