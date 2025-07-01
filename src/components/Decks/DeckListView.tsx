import { FaArrowLeft } from "react-icons/fa";
import { primaryButton, tertiaryButton } from "../PrimaryActions";
import { FaPlus } from "react-icons/fa6";
import { DeckView } from "./DeckView";
import { getDecksFromStorage } from "../utils/storage";
import { EmptyView } from "../shared/EmptyView";

interface Props {
  setCurrentView: (view: string) => void;
}

export function DeckListView({ setCurrentView }: Props) {
  const decks = getDecksFromStorage();

  return (
    <>
      <div className="actionRow flexRow">
        {tertiaryButton("Go back", <FaArrowLeft />, () =>
          setCurrentView("dashboard")
        )}
        {primaryButton("New Deck", <FaPlus />, () =>
          setCurrentView("deckCreateEditView")
        )}
      </div>

      {decks.length > 0 ? (
        <div className="grid">
          {decks.map((deck, index) => (
            <DeckView key={index} deck={deck} setCurrentView={setCurrentView} />
          ))}
        </div>
      ) : (
        <EmptyView
          description="Click on '+ New Deck' to start building..."
          title="No decks found"
        />
      )}
    </>
  );
}
