import React, { useEffect } from "react";
import { useCardParser } from "../hooks/useCardParser";
import "./styles.css";
import { ArrowUpTrayIcon, WalletIcon } from "@heroicons/react/16/solid";
import { TbCardsFilled } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { getDecksFromStorage, useDeckParser } from "../hooks/useDeckParser";
import { DeckDetailView } from "./Decks/DeckDetailView.tsx";
import { CardsView } from "./CardsView";
import { DecksView } from "./Decks/DecksView.tsx";

export default function MTGCardUploader() {
  const decks = getDecksFromStorage();
  const {
    collectionCards,
    setCollectionCards,
    loading,
    error,
    collection,
    onCollectionUpload,
  } = useCardParser();

  const [currentView, setCurrentView] = React.useState("dashboard");

  useEffect(() => {
    const stored = localStorage.getItem("mtg_cards");
    if (stored) {
      setCollectionCards(JSON.parse(stored));
    }
  }, []);

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
              setCurrentView("deckCollection")
            )}
          </div>

          <div className="uploadContainer">
            <input
              className="hidden"
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={onCollectionUpload}
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
          <p className="text-center">Loading cards...</p>
        </div>
      ) : (
        // To do: Add sort and filter options
        <div className="dataContainer">
          {currentView === "dashboard" && <CardsView cards={collectionCards} />}
          {currentView.startsWith("deckCreateEditView") &&
            (() => {
              const match = currentView.match(/^deckCreateEditView=(.+)$/);
              if (match) {
                const deckId = Number(match[1]);
                const deck = decks.find((d) => d.id === deckId);

                if (deck) {
                  return (
                    <DeckDetailView
                      setCurrentView={setCurrentView}
                      deck={deck}
                    />
                  );
                }
                return <div>Deck not found.</div>;
              } else if (currentView === "deckCreateEditView") {
                return <DeckDetailView setCurrentView={setCurrentView} />;
              }
              return null;
            })()}
          {currentView === "deckCollection" && (
            <DecksView setCurrentView={setCurrentView} />
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
