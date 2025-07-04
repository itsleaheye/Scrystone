import { FaBookOpen, FaGem, FaTree } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { HiQuestionMarkCircle } from "react-icons/hi";
import { GiTripleClaws } from "react-icons/gi";

export function getTypeIcon(type?: string) {
  if (!type) return;

  switch (type) {
    case "Creature":
      return <GiTripleClaws />;
    case "Enchantment":
      return <FaBookOpen />;
    case "Sorcery":
      return <BsStars />;
    case "Sorcerie":
      return <BsStars />;
    case "Instant":
      return <BsStars />;
    case "Artifact":
      return <FaGem />;

    case "Land":
      return <FaTree />;
    default:
      return <HiQuestionMarkCircle />;
  }
}
