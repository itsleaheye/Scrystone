import {
  FaArrowLeft,
  FaTrash,
  FaSave,
  FaEdit,
  FaDownload,
} from "react-icons/fa";
import { PiExportBold } from "react-icons/pi";
import type { Deck } from "../../../types/MagicTheGathering";
import { ActionButton } from "../../shared/PrimaryActions";
import { useDeckParser } from "../../../hooks/useDeckParser";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { ImSpinner } from "react-icons/im";

interface DeckActionsProps {
  editable?: boolean;
  deck?: Deck;
  isMobile?: boolean;
  onBack: () => void;
  onPrimary: () => void;
  onCardsImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
}

export const DeckActions = ({
  editable = false,
  deck,
  isMobile = false,
  onBack,
  onPrimary,
  onCardsImport,
  loading = false,
}: DeckActionsProps) => {
  const { onDeckDelete, onDeckExport } = useDeckParser();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="actionRow flexRow">
      <ActionButton
        icon={<FaArrowLeft />}
        label={editable ? "Cancel" : isMobile ? "Back" : "Go back"}
        onClick={onBack}
        variation="tertiary"
      />
      <div className="flexRow">
        {deck && (
          <ActionButton
            hideLabel={isMobile}
            icon={<FaTrash />}
            label={"Delete"}
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this deck?")
              ) {
                onDeckDelete(deck.id);
                navigate("/decks");
              }
            }}
            variation="destroy"
          />
        )}
        {deck && !editable && (
          <ActionButton
            hideLabel={isMobile}
            icon={<PiExportBold />}
            label={"Export"}
            onClick={() => onDeckExport(deck.cards, deck.name, deck.format)}
            variation="secondary"
          />
        )}
        {location.pathname.includes("/new") && (
          <div className="importContainer">
            <input
              className="hidden"
              id="deckImportInput"
              type="file"
              accept=".txt"
              onChange={onCardsImport}
            />
            <label htmlFor="deckImportInput">
              {loading ? (
                <ImSpinner className="importSpinner" />
              ) : (
                <FaDownload className="uploadIcon" />
              )}
              {!isMobile && !loading && "Import"}
            </label>
          </div>
        )}
        {location.pathname == "/decks" ? (
          <ActionButton
            icon={<FaPlus />}
            label={"New Deck"}
            onClick={onPrimary}
            variation="primary"
          />
        ) : editable ? (
          <ActionButton
            disabled={loading}
            icon={<FaSave />}
            label={"Save"}
            onClick={onPrimary}
            variation="primary"
          />
        ) : (
          <ActionButton
            icon={<FaEdit />}
            label={"Edit"}
            onClick={onPrimary}
            variation="primary"
          />
        )}
      </div>
    </div>
  );
};
