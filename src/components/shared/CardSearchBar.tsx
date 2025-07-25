import { useEffect, useState } from "react";
import { TbListSearch } from "react-icons/tb";
import { normalizeCardName } from "../../utils/normalize";
import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { FaSearch } from "react-icons/fa";
import { getCardsFromStorage } from "../../utils/storage";

interface CardSearchBarProps {
  onDeckCardAdd: (
    cardName: string,
    quantityNeeded?: number,
    setPreference?: string
  ) => Promise<void>;
  deckCards: DeckCard[];
}

export function CardSearchBar({
  onDeckCardAdd,
  deckCards,
}: CardSearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const deckCardNames = new Set(
    deckCards.map((c) => normalizeCardName(c.name))
  );

  const [ownedCards, setOwnedCards] = useState<CollectionCard[]>([]);
  useEffect(() => {
    getCardsFromStorage()
      .then((data) => {
        setOwnedCards(data);
      })
      .catch(() => {
        setOwnedCards([]);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (query.length >= 3) {
      fetch(`https://api.scryfall.com/cards/autocomplete?q=${query}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => {
          // Filter out cards already in the deck
          const filtered = data.data.filter(
            (name: string) => !deckCardNames.has(normalizeCardName(name))
          );
          setSuggestions(filtered);
        });
    } else {
      setSuggestions([]);
    }

    return () => controller.abort();
  }, [query]);

  const handleSuggestionClick = async (cardName: string) => {
    // If we own a card with the same name, default to it's set
    const match = ownedCards.find(
      (card: any) =>
        normalizeCardName(card.name) === normalizeCardName(cardName)
    );
    if (match) {
      await onDeckCardAdd(cardName, undefined, match.set);
    } else {
      await onDeckCardAdd(cardName); // If not found in collection
    }
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="searchContainer">
      <p className="bold">Add Card</p>
      <FaSearch className="inlineIcon" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="searchBar"
        placeholder="Search for card name..."
      />
      {suggestions.length > 0 ? (
        <ul className="searchResults">
          {suggestions.map((name) => (
            <li key={name} onClick={() => handleSuggestionClick(name)}>
              {name}
            </li>
          ))}
        </ul>
      ) : query.length > 0 ? (
        <p className="italic text-center subtext">
          <TbListSearch />
          No matching cards found
        </p>
      ) : (
        <></>
      )}
    </div>
  );
}
