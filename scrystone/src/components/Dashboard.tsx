import React from "react";
import { useCardParser } from "../hooks/useCardParser";
import "./styles.css";
import { ArrowUpTrayIcon, WalletIcon } from "@heroicons/react/16/solid";
import { TbCardsFilled } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { DeckDetailView } from "./Decks/DeckDetailView.tsx";
import { DeckListView } from "./Decks/DeckListView.tsx";
import { CardListView } from "./Cards/CardListView.tsx";
import { getCardsFromStorage } from "./utils/storage.ts";
import { IconItem } from "./shared/IconItem.tsx";

export default function Dashboard() {
  const cards = getCardsFromStorage();
  const { loading, error, onCollectionUpload, collection } = useCardParser();

  const [currentView, setCurrentView] = React.useState("dashboard"); // Didn't feel like setting up a router or EntryPoint. Shame Leah

  return (
    <div className="container">
      <div className="headingContainer">
        <div className="pageTitle">
          <h1>SCRYSTONE</h1>
          <p>A Magic the Gathering collection tool</p>
        </div>
        <div className="summaryContainer">
          <div className="flexRow borderBottom">
            <IconItem
              icon={<GiCash />}
              text={`Value: $${Math.round(collection.value)}`}
              onClick={() => setCurrentView("dashboard")}
            />
            <IconItem
              icon={<TbCardsFilled />}
              text={`Cards: ${collection.size}`}
              onClick={() => setCurrentView("dashboard")}
            />
            <IconItem
              icon={<WalletIcon />}
              text={`My Decks`}
              onClick={() => setCurrentView("deckCollection")}
            />
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
            <p className="subtext">Last synced on {collection.updatedAt}</p>
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
        <div className="dataContainer">
          {currentView === "dashboard" && (
            <CardListView collectionCards={cards} />
          )}
          {currentView.startsWith("deckCreateEditView") &&
            renderDeckDetailView(currentView, setCurrentView)}
          {currentView === "deckCollection" && (
            <DeckListView setCurrentView={setCurrentView} />
          )}
        </div>
      )}
    </div>
  );
}

// type View = "dashboard" | "deckCollection" | `deckCreateEditView=${string}`;

function renderDeckDetailView(
  currentView: string,
  setCurrentView: React.Dispatch<React.SetStateAction<string>>
) {
  const match = currentView.match(/^deckCreateEditView=(.+)$/);
  const deckId = match ? Number(match[1]) : undefined;

  return <DeckDetailView setCurrentView={setCurrentView} deckId={deckId} />;
}
