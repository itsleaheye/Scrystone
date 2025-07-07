import { WelcomeStep } from "./WelcomeStep";
import "./Welcome.css";
import "../styles.css";
import { FaArrowDown } from "react-icons/fa";

export function Welcome() {
  return (
    <div className="text-center dataContainer welcomeContainer">
      <h2>Getting Started with Scrystone</h2>
      <p className="welcomeSubtext">
        <span className="bold">
          Bring your Magic the Gathering collection to life!
        </span>{" "}
        Upload your cards to instantly preview your entire collection, build and
        customize decks, and keep track of what you own and what you still need.
        <br />
        <br />
        Stay organized, synced, and ready to draft your next win, even on the
        go.
      </p>
      <WelcomeStep
        number={1}
        heading={"Export Your Collection"}
        description={`If you're using TCGPlayer to track your Magic cards, you’re in luck, as exporting is easy:`}
        steps={[
          "Open the TCGPlayer app on your mobile device",
          `Go to your desired 'Collection'`,
          `Tap the 'Export' button to generate a .csv of your card list`,
          "Save the file to your device",
        ]}
      />

      <FaArrowDown />

      <WelcomeStep
        number={2}
        heading={"Upload to Scrystone"}
        description={`Now that you have your collection in a .csv, let's upload those cards:`}
        steps={[
          "Open back up Scrystone",
          `Click “Upload Your Cards”`,
          "Select the .csv file you just exported",
          "Wait for Scrystone to process your cards",
        ]}
      />

      <FaArrowDown />

      <WelcomeStep
        number={3}
        heading={"Deck building and previews"}
        description={`After processing, your collection will be previewable. From here you can:`}
        steps={[
          "Preview cards in your collection",
          "Build and edit decks",
          "Export deck lists to share with friends",
          "See which cards you own and which you may be missing",
        ]}
      />
    </div>
  );
}
