import React from "react";
import { useCardParser } from "../hooks/useCardParser.ts";
import "./styles.css";
import { ArrowUpTrayIcon, WalletIcon } from "@heroicons/react/16/solid";
import { TbCardsFilled } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { DeckDetailView } from "./Decks/DeckDetailView.tsx";
import { DeckListView } from "./Decks/DeckListView.tsx";
import { getCardsFromStorage } from "./utils/storage.ts";
import { IconItem } from "./shared/IconItem.tsx";
import { Welcome } from "./Welcome.tsx";
import { CardPreview } from "./Cards/CardPreview.tsx";

export default function Dashboard() {
  const cards = getCardsFromStorage();
  const {
    loading,
    error,
    onCollectionUpload,
    collection,
    currentProgress,
    totalProgress,
  } = useCardParser();
  const hasCollection = collection.size > 0;

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
              onClick={() => alert("Price breakdown will be coming in V2")}
            />
            <IconItem
              isActive={currentView === "dashboard"}
              icon={<TbCardsFilled />}
              text={`Cards`}
              onClick={() => setCurrentView("dashboard")}
            />
            <IconItem
              isActive={currentView.startsWith("deck")}
              icon={<WalletIcon />}
              text={`Decks`}
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
              {hasCollection ? "Sync Cards" : "Upload Your Cards"}
            </label>
            <p className="subtext">
              {hasCollection
                ? `Last synced on ${collection.updatedAt}`
                : "Don’t have a .csv from TCGPlayer? Learn how."}
              {/* To do: 'See how to export it' should link to a popup or article */}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div>
          <p>Error loading cards: Try uploading your .csv file again</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          {/* To be replaced by spinning planewalker logo */}
          <p className="text-center">
            Loading {currentProgress}/{totalProgress} cards
          </p>
        </div>
      )}

      {hasCollection ? (
        <div
          className="dataContainer"
          style={{
            opacity: loading ? 0.5 : 1,
            pointerEvents: loading ? "none" : "auto",
            transition: "opacity 0.5s ease",
          }}
        >
          {currentView === "dashboard" && (
            <CardPreview collectionCards={cards} />
          )}
          {currentView.startsWith("deckCreateEditView") &&
            renderDeckDetailView(currentView, setCurrentView)}
          {currentView === "deckCollection" && (
            <DeckListView setCurrentView={setCurrentView} />
          )}
        </div>
      ) : (
        <Welcome />
      )}
    </div>
  );
}

function renderDeckDetailView(
  currentView: string,
  setCurrentView: React.Dispatch<React.SetStateAction<string>>
) {
  const match = currentView.match(/^deckCreateEditView=(.+)$/);
  const deckId = match ? Number(match[1]) : undefined;

  return <DeckDetailView setCurrentView={setCurrentView} deckId={deckId} />;
}
