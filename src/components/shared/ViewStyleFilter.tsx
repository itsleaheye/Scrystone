import { BsFillGridFill } from "react-icons/bs";
import { FaList } from "react-icons/fa";
import "./ViewStyleFilter.css";

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
    <div className={!isMobile ? "flexCol" : "mobileBottom"}>
      {!isMobile && <p className="bold">View</p>}
      <div className="flexRow viewStylesContainer">
        {isMobile && <p className="bold">Select View Style</p>}
        <div className="viewButtons">
          <div
            className={viewStyle !== "List" ? "inactive" : "active"}
            onClick={() => setViewStyle("List")}
          >
            <FaList />
          </div>
          <div
            className={viewStyle !== "Grid" ? "inactive" : "active"}
            onClick={() => setViewStyle("Grid")}
          >
            <BsFillGridFill />
          </div>
        </div>
      </div>
    </div>
  );
}
