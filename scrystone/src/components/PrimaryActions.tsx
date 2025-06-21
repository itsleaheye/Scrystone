import { FaSave } from "react-icons/fa";
import { FaArrowLeft, FaPen, FaPlus } from "react-icons/fa6";
import "./styles.css";

export function PrimaryActions({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}): React.JSX.Element {
  const { leftActions, rightActions } = getActionsForView(
    currentView,
    setCurrentView
  );

  return (
    <>
      {rightActions ? (
        <div className="actionRow flexRow">
          {leftActions}
          {rightActions}
        </div>
      ) : (
        <div className="flexRow centred">{leftActions}</div>
      )}
    </>
  );
}

function getActionsForView(
  currentView: string,
  setCurrentView: (view: string) => void
): {
  leftActions: React.JSX.Element;
  rightActions?: React.JSX.Element;
} {
  const primaryButton = (
    label: string,
    icon: React.ReactNode,
    targetView: string
  ): React.JSX.Element => {
    return (
      <button
        className="primaryButton"
        onClick={() => setCurrentView(targetView)}
      >
        {icon}
        {label}
      </button>
    );
  };

  const tertiaryButton = (
    label: string,
    icon: React.ReactNode,
    targetView: string
  ): React.JSX.Element => {
    return (
      <a className="tertiaryButton" onClick={() => setCurrentView(targetView)}>
        {icon}
        {label}
      </a>
    );
  };

  switch (currentView) {
    case "dashboard":
      return {
        leftActions: <p>Filters and sorting incoming...</p>,
        rightActions: undefined,
      };
    case "deckCreateEditView":
      return {
        leftActions: tertiaryButton(
          "Cancel and Go Back",
          <FaArrowLeft />,
          "decks"
        ),
        rightActions: primaryButton("Save", <FaSave />, "decks"),
      };
    case "deckView":
      return {
        leftActions: <p>Filters and sorting incoming...</p>,
        rightActions: primaryButton(
          "Edit Deck",
          <FaPen />,
          "deckCreateEditView"
        ),
      };
    // Decks by default
    default:
      return {
        leftActions: tertiaryButton("Go Back", <FaArrowLeft />, "dashboard"),
        rightActions: primaryButton(
          "New Deck",
          <FaPlus />,
          "deckCreateEditView"
        ),
      };
  }
}
