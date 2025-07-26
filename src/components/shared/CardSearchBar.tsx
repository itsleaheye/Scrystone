import { useEffect, useRef, useState } from "react";
import { TbListSearch } from "react-icons/tb";
import { normalizeCardName } from "../../utils/normalize";
import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { FaSearch } from "react-icons/fa";
import { getCardsFromStorage } from "../../utils/storage";
import { ImSpinner6 } from "react-icons/im";

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
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const deckCardNames = new Set(
    deckCards.map((card) => normalizeCardName(card.name))
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
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimeout.current = setTimeout(() => {
      const controller = new AbortController();
      fetch(`https://api.scryfall.com/cards/autocomplete?q=${query}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.data.filter(
            (name: string) => !deckCardNames.has(normalizeCardName(name))
          );
          setSuggestions(filtered);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));

      return () => controller.abort();
    }, 300); // Debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleSuggestionClick = async (cardName: string) => {
    // If we own a card with the same name, default to it's set
    const match = ownedCards.find(
      (card: any) =>
        normalizeCardName(card.name) === normalizeCardName(cardName)
    );
    await onDeckCardAdd(cardName, undefined, match?.set);

    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="searchContainer">
      <p className="bold">Add Card</p>
      {loading ? (
        <ImSpinner6 className="inlineIcon searchSpinner" />
      ) : (
        <FaSearch className="inlineIcon" />
      )}
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
      ) : query.length > 0 && !loading ? (
        <p className="italic text-center subtext">
          <TbListSearch />
          {query.length < 3
            ? "Please enter atleast 3 characters"
            : "No matching cards found"}
        </p>
      ) : null}
    </div>
  );
}
