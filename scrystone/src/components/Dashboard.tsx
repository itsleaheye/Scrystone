import React, { useEffect } from "react";
import { useCardParser } from "../hooks/useCardParser";
import "./styles.css";
import { ArrowUpTrayIcon, WalletIcon } from "@heroicons/react/16/solid";
import { TbCardsFilled } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { useDeckParser } from "../hooks/useDeckParser";
import { Deck } from "./Decks/Deck.tsx";
import { DeckView } from "./Decks/DeckView";
import { CardsView } from "./CardsView";
import { PrimaryActions } from "./PrimaryActions";

export default function MTGCardUploader() {
  const {
    collectionCards,
    setCollectionCards,
    loading,
    error,
    collection,
    onCardCollectionUpload,
  } = useCardParser();
  const { decks } = useDeckParser();

  const [currentView, setCurrentView] = React.useState("dashboard");

  useEffect(() => {
    const stored = localStorage.getItem("mtg_cards");
    if (stored) {
      setCollectionCards(JSON.parse(stored));
    }
  }, []);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (collectionCards.length) {
      localStorage.setItem("mtg_cards", JSON.stringify(collectionCards));
    }
  }, [collectionCards]);

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
              () => setCurrentView("dashboard")
            )}
            {iconItem(<TbCardsFilled />, `Cards: ${collection.size}`, () =>
              setCurrentView("dashboard")
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
              onChange={onCardCollectionUpload}
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
          <PrimaryActions
            currentView={currentView}
            setCurrentView={setCurrentView}
          />

          {currentView === "dashboard" && <CardsView cards={collectionCards} />}
          {currentView === "deckCreateEditView" && (
            <DeckView isEditable={true} />
          )}
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
