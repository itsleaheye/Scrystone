import { FaBookOpen, FaGem } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { HiQuestionMarkCircle } from "react-icons/hi";
import { GiTripleClaws } from "react-icons/gi";
import { FaMountainSun } from "react-icons/fa6";

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
    case "Basic Land":
      return <FaMountainSun />;
    case "Land":
      return <FaMountainSun />;
    default:
      return <HiQuestionMarkCircle />;
  }
}
