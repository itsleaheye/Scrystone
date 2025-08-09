import { ImSpinner6 } from "react-icons/im";

export function DeckHeaderLoading() {
  return (
    <div className="deckOverview loadingDeckOverview">
      <div className="flexCol">
        <ImSpinner6 className="inlineIcon searchSpinner" />
        <h3 className="text-center emphasis">Loading your deck...</h3>
      </div>
    </div>
  );
}
