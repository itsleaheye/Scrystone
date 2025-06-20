import React, { useEffect } from "react";
import { useCardParser } from "../hooks/useCardParser";
import "./styles.css";
import {
  ArrowUpTrayIcon,
  BanknotesIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  InboxIcon,
  RectangleStackIcon,
  WalletIcon,
} from "@heroicons/react/16/solid";
import { Card } from "./Card";
import { TbCards, TbCardsFilled } from "react-icons/tb";
import { GiCash } from "react-icons/gi";

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
      <div className="headingContainer">
        <div className="pageTitle">
          <h1>Scrystone</h1>
          <p>A Magic the Gathering card management app</p>
        </div>
        <div className="summaryContainer">
          <div className="flexRow borderBottom">
            {iconItem(<GiCash />, `Value: $${Math.round(collection.value)}`)}
            {iconItem(<TbCardsFilled />, `Cards: ${cards.length}`)}
            {iconItem(<WalletIcon />, `My Decks`)}
          </div>

          <div className="uploadContainer">
            <input
              className="hidden"
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={onFileUpload}
            />
            <label htmlFor="fileInput">
              <ArrowUpTrayIcon className="uploadIcon" />
              Sync Cards
            </label>
            <p className="subtext">Last synced on MM DD, YYYY</p>
          </div>
        </div>
      </div>

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
            <Card key={index} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

export function iconItem(
  icon: React.ReactNode,
  text: string
): React.JSX.Element {
  return (
    <div className="flexCol iconItem">
      {icon}
      <p>{text}</p>
    </div>
  );
}
