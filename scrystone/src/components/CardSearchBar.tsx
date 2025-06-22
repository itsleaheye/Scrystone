import { useEffect, useState } from "react";

interface Props {
  onDeckCardAdd: (cardName: string) => Promise<void>;
}

export function CardSearchBar({ onDeckCardAdd }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    if (query.length >= 3) {
      fetch(`https://api.scryfall.com/cards/autocomplete?q=${query}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => setSuggestions(data.data));
    } else {
      setSuggestions([]);
    }

    return () => controller.abort();
  }, [query]);

  const handleSuggestionClick = (cardName: string) => {
    onDeckCardAdd(cardName);
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="searchContainer">
      <p className="bold"> Card Name</p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="searchBar"
        placeholder="Search for card..."
      />
      {suggestions.length > 0 && (
        <ul className="searchResults">
          {suggestions.map((name) => (
            <li key={name} onClick={() => handleSuggestionClick(name)}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
