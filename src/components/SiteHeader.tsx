import { GiCash } from "react-icons/gi";
import { IconItem } from "./shared/IconItem";
import "./styles.css";
import { WalletIcon, ArrowUpTrayIcon } from "@heroicons/react/16/solid";
import { TbCardsFilled } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import { useCardParser } from "../hooks/useCardParser";

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collection, onCollectionUpload } = useCardParser();

  const hasCollection = collection.size > 0;
  const showConfirmation =
    location.pathname.includes("/new") || location.pathname.includes("/edit");

  return (
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
            isActive={location.pathname === "/"}
            icon={<TbCardsFilled />}
            text={`Collection`}
            onClick={() => {
              if (showConfirmation && window.confirm("Discard changes?")) {
                navigate("/");
              }
              if (!showConfirmation) {
                navigate("/");
              }
            }}
          />
          <IconItem
            isActive={location.pathname.startsWith("/deck")}
            icon={<WalletIcon />}
            text={`Decks`}
            onClick={() => {
              if (showConfirmation && window.confirm("Discard changes?")) {
                navigate("/decks");
              }
              if (!showConfirmation) {
                navigate("/decks");
              }
            }}
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
              : "Never synced yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
