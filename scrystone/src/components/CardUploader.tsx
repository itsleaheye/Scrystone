import React, { useEffect } from "react";
import { useCardParser } from "../hooks/useCardParser";
import "./CardUploader.css";

export default function MTGCardUploader() {
  const { cards, setCards, loading, error, collection, onFileUpload } =
    useCardParser();
  // const [cards, setCards] = useState<Card[]>([]);

  // Load cards from localStorage on initial render
  useEffect(() => {
    const stored = localStorage.getItem("mtg_cards");
    // Check if stored data exists and ensure it is valid JSON
    if (stored) {
      setCards(JSON.parse(stored));
    }
  }, []);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (cards.length) {
      localStorage.setItem("mtg_cards", JSON.stringify(cards));
    }
  }, [cards]);

  return (
    <div className="container">
      <div className="pageTitle">
        <h1>Scrystone</h1>
        <p>A Magic the Gathering card management app</p>
      </div>
      <div>
        <h4>Collection size: {collection.size}</h4>
        <h4>Collection value: ${Math.round(collection.value)}USD</h4>
      </div>
      <input type="file" accept=".csv" onChange={onFileUpload} />

      {error && (
        <div>
          <p>Error loading cards: Try uploading your .csv file again</p>
        </div>
      )}

      {loading ? (
        <div>
          {/* To be replaced by spinning planewalker logo */}
          <p>Loading cards...</p>
        </div>
      ) : (
        // To do: Add sort and filter options
        <div className="grid">
          {cards.map((card, index) => (
            // To do: On hover, flip card to show quantity, details, favourite, deck, etc
            <div key={index} className="card">
              {card.imageUrl ? (
                <img src={card.imageUrl} alt={card.name} className="cardArt" />
              ) : (
                // To do: Find placeholder card or generate placeholder based on details.
                <div className="cardPlaceholder">
                  <p className="emphasis">{card.name}</p>
                  <p>{card.type}</p>
                  <p>
                    {card.manaCost}
                    {card.manaType}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
