import { BsFillGridFill } from "react-icons/bs";
import { FaList } from "react-icons/fa";
import "../styles.css";

interface ViewStyleFilterProps {
  isMobile: boolean;
  viewStyle: string;
  setViewStyle: React.Dispatch<React.SetStateAction<string>>;
}

export function ViewStyleFilter({
  isMobile,
  viewStyle = "Grid",
  setViewStyle,
}: ViewStyleFilterProps) {
  return (
    <div className="flexRow viewStylesContainer">
      {isMobile && <p className="bold">Select View Style</p>}
      <div className="viewButtons">
        <div
          className={`cursor-pointer p-2 ${
            viewStyle !== "List" ? "opacity-50" : "opacity-100"
          }`}
          onClick={() => setViewStyle("List")}
        >
          <FaList />
        </div>
        <div
          className={`cursor-pointer p-2 ${
            viewStyle !== "Grid" ? "opacity-50" : "opacity-100"
          }`}
          onClick={() => setViewStyle("Grid")}
        >
          <BsFillGridFill />
        </div>
      </div>
    </div>
  );
}
