import "./Welcome.css";
import "../styles.css";
import { FaFileCsv, FaQuestionCircle, FaUpload } from "react-icons/fa";
import { WalletIcon } from "@heroicons/react/16/solid";

const faqQuestions = [
  {
    question: "I bought some new cards. How do I update my collection?",
    answer: (
      <p>
        Grab your most up to date .csv of your cards and press the ‘Sync Cards’
        button. Scrystone will go through your collection checking for any cards
        that were added or removed, or even have a new quantity, and update your
        collection accordingly.
        <br />
        <br />
        Your decks will also automatically check against the most recent .csv
        uploaded.
      </p>
    ),
  },
  {
    question: "How can I share my decks with friends?",
    answer: (
      <p>
        After you have built a deck, check out the `Export` button to download a
        .txt file of your deck card list. You can share this .txt file with
        friends and they can even `Import` the cards list directly into their
        decks.
      </p>
    ),
  },
  {
    question: "How do I know which deck cards are missing?",
    answer: (
      <p>
        1. Your deck summary will show you for each type how many cards you own
        vs how many the deck required. It will bolden types that you are missing
        the cards for.
        <br />
        2. On deck `Export` you will see a lower section in your .txt file
        stating the quantity and name of cards missing.{" "}
        <span className="bold">
          You can copy this section into any hobby web store’s deck list to
          quickly purchase your missing cards.
        </span>
        <br />
        3. On both the gallery and list view on the deck builder, you will see
        each card shows a total of quantity owned / quantity needed.{" "}
        <span className="bold">
          The list view will highlight missing cards in red.
        </span>
      </p>
    ),
  },
];

export function Welcome() {
  return (
    <>
      <div className="howContainer text-center">
        <h2>How It Works</h2>
        <div className="flexSwap">
          <div className="step">
            <FaFileCsv />
            <p>Download your card list as a .csv</p>
          </div>
          <div className="step step2">
            <FaUpload />
            <p>Upload it to Scrystone</p>
          </div>
          <div className="step">
            <WalletIcon />
            <p>Start building and sharing decks</p>
          </div>
        </div>
      </div>
      <div className="faqContainer flexCol">
        <div className="flexRow">
          <FaQuestionCircle />
          <h2>FAQ</h2>
        </div>
        {faqQuestions.map((faq) => {
          return (
            <div className="text-center question">
              <p className="emphasis bold">{faq.question}</p>
              {faq.answer}
            </div>
          );
        })}
      </div>
    </>
  );
}
