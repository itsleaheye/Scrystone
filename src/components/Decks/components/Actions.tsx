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
import {
  TbSortAscendingLetters,
  TbSortAscendingNumbers,
  TbSortAscendingShapesFilled,
  TbSortDescendingLetters,
  TbSortDescendingNumbers,
} from "react-icons/tb";
import type {
  FilterByFormat,
  FilterByStatus,
  SortBy,
} from "../../../hooks/useDeckFiltersAndSort";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import Select from "react-select";
import { type DrawnCard } from "../../../utils/decks";

interface DeckActionsProps {
  deck?: Deck;
  editable?: boolean;
  isMobile?: boolean;
  loading?: boolean;
  onBack: () => void;
  onCardsImport?: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrimary: () => void;
  setPreviewHand?: Dispatch<SetStateAction<DrawnCard[]>>;
}

export const DeckActions = ({
  deck,
  editable = false,
  isMobile = false,
  loading = false,
  onBack,
  onCardsImport,
  onPrimary,
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

interface DashboardActionsProps {
  filters: {
    status: FilterByStatus;
    format: FilterByFormat;
    sort: SortBy;
  };
  setFilters: Dispatch<
    SetStateAction<{
      status: FilterByStatus;
      format: FilterByFormat;
      sort: SortBy;
    }>
  >;
}

export function DashboardActions({
  filters,
  setFilters,
}: DashboardActionsProps) {
  const navigate = useNavigate();

  const getSortIcon = () => {
    switch (filters.sort) {
      case "nameAsc":
        return <TbSortAscendingLetters />;
      case "nameDesc":
        return <TbSortDescendingLetters />;
      case "priceAsc":
        return <TbSortAscendingNumbers />;
      case "priceDesc":
        return <TbSortDescendingNumbers />;
      case "format":
        return <TbSortAscendingShapesFilled />;
    }
  };

  const formatOptions = [
    { value: "all", label: "All" },
    { value: "commander", label: "Commander" },
    { value: "standard", label: "Standard" },
    { value: "draft", label: "Draft" },
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "isReady", label: "Ready to Play" },
    { value: "isNotReady", label: "Not Ready" },
  ];

  const sortOptions = [
    { value: "nameAsc", label: "Name (Asc)" },
    { value: "nameDesc", label: "Name (Desc)" },
    { value: "priceAsc", label: "Price (Asc)" },
    { value: "priceDesc", label: "Price (Desc)" },
    { value: "format", label: "Format" },
  ];

  return (
    <div className="centred filtersRow deckActions">
      <div className="flexCol">
        <p className="filterIconAndText">Format</p>
        <Select
          className="selectMulti"
          classNamePrefix="selectMulti"
          isSearchable={false}
          isClearable={false}
          options={formatOptions}
          value={formatOptions.find((opt) => opt.value === filters.format)}
          onChange={(selected) =>
            setFilters((prev) => ({
              ...prev,
              format: selected?.value as FilterByFormat,
            }))
          }
        />
      </div>

      <div className="flexCol">
        <p className="filterIconAndText">Is Ready</p>
        <Select
          className="selectMulti"
          classNamePrefix="selectMulti"
          isSearchable={false}
          isClearable={false}
          options={statusOptions}
          value={statusOptions.find((opt) => opt.value === filters.status)}
          onChange={(selected) =>
            setFilters((prev) => ({
              ...prev,
              status: selected?.value as FilterByStatus,
            }))
          }
        />
      </div>

      <div className="flexCol">
        <p className="filterIconAndText">
          {getSortIcon()}
          Sort By
        </p>
        <Select
          className="selectMulti"
          classNamePrefix="selectMulti"
          isSearchable={false}
          isClearable={false}
          options={sortOptions}
          value={sortOptions.find((opt) => opt.value === filters.sort)}
          onChange={(selected) =>
            setFilters((prev) => ({
              ...prev,
              sort: selected?.value as SortBy,
            }))
          }
        />
      </div>
      <div className="flexCol">
        <ActionButton
          icon={<FaPlus />}
          label={"New Deck"}
          onClick={() => {
            navigate("/deck/new");
          }}
          variation="primary"
        />
      </div>
    </div>
  );
}
