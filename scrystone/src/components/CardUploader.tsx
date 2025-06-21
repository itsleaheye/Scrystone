import React, { useEffect } from "react";
import { useCardParser } from "../hooks/useCardParser";
import "./styles.css";
import { ArrowUpTrayIcon, WalletIcon } from "@heroicons/react/16/solid";
import { TbCardsFilled } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { useDeckParser } from "../hooks/useDeckParser";
import { Deck } from "./Deck";
import { DeckView } from "./DeckView";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { CardsView } from "./CardsView";

export default function MTGCardUploader() {
  const { cards, setCards, loading, error, collection, onFileUpload } =
    useCardParser();
  const { decks } = useDeckParser();

  const [currentView, setCurrentView] = React.useState("cards");

  useEffect(() => {
    const stored = localStorage.getItem("mtg_cards");
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
          <h1>SCRYSTONE</h1>
          <p>A Magic the Gathering collection tool</p>
        </div>
        <div className="summaryContainer">
          <div className="flexRow borderBottom">
            {iconItem(
              <GiCash />,
              `Value: $${Math.round(collection.value)}`,
              () => setCurrentView("cards")
            )}
            {iconItem(<TbCardsFilled />, `Cards: ${cards.length}`, () =>
              setCurrentView("cards")
            )}
            {iconItem(<WalletIcon />, `My Decks`, () =>
              setCurrentView("decks")
            )}
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
        <div className="dataContainer">
          <div className="actionRow flexRow">
            {currentView !== "cards" ? (
              <a onClick={() => setCurrentView("cards")}>
                <FaArrowLeft /> Go Back
              </a>
            ) : (
              <a>Placeholder for filtering and search...</a>
            )}
            {currentView === "deckEditView" ? (
              // <button
              //   className="primaryButton"
              //   onClick={() => setCurrentView("editDeck")}
              // >
              //   <FaEdit />
              //   Edit
              // </button>
              <div className="flexRow">
                <button> Cancel </button>
                <button
                  className="primaryButton"
                  onClick={() => setCurrentView("decks")}
                >
                  <FaSave /> Save{" "}
                </button>
              </div>
            ) : (
              <button
                className="primaryButton"
                onClick={() => setCurrentView("deckEditView")}
              >
                <FaPlus />
                New Deck
              </button>
            )}
          </div>

          {currentView === "cards" && <CardsView cards={cards} />}
          {currentView === "deckEditView" && <DeckView isEditable={true} />}
          {currentView === "decks" && (
            <>
              {decks.map((deck, index) => (
                <Deck key={index} deck={deck} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function iconItem(
  icon: React.ReactNode,
  text: string,
  onClick?: () => void
): React.JSX.Element {
  return (
    <div className="flexCol iconItem" onClick={onClick}>
      {icon}
      <p>{text}</p>
    </div>
  );
}
