import { db, auth } from "./firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import type { CollectionCard } from "./types/MagicTheGathering";

export const saveCollection = async (cards: CollectionCard[]) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const collectionRef = collection(db, "users", uid, "collection");

  for (const card of cards) {
    await setDoc(doc(collectionRef, card.name), card); // Using card name as ID, instead of set and cardname
  }
};
