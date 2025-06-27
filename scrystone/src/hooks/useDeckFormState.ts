import { useEffect, useState } from "react";
import type { Deck } from "../types/MagicTheGathering";

export function useDeckFormState(initialDeck?: Deck) {
  const [name, setName] = useState(initialDeck?.name ?? "");
  const [description, setDescription] = useState(
    initialDeck?.description ?? ""
  );
  const [format, setFormat] = useState(initialDeck?.format ?? "Commander");

  useEffect(() => {
    if (initialDeck) {
      setName(initialDeck.name);
      setDescription(initialDeck.description ?? "");
      setFormat(initialDeck.format);
    }
  }, [initialDeck]);

  return { name, setName, description, setDescription, format, setFormat };
}
