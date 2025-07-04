import { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import "./reset.css";
import { fetchAndCacheBulkData } from "./components/utils/scryfall";
import { initializeBulkCards } from "./components/utils/storage";

export default function App() {
  useEffect(() => {
    async function loadData() {
      const cards = await fetchAndCacheBulkData();
      initializeBulkCards(cards);
    }

    loadData().catch(console.error);
  }, []);

  return <Dashboard />;
}
