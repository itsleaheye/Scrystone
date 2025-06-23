# Scrystone
A 'Magic the Gathering' web app built with React, Tailwind CSS, and the Scryfall API. It lets you upload your card collection from TCGPlayer, build decks, and track which cards you still need. It is all saved locally in your browser, with no account setup required.

### ✨ Features
- **Deck Builder** – Create decks and categorize cards by type, mana cost, etc.

- **Card Collection Tracker** – Upload your owned cards and automatically match them to your deck needs.

- **Scryfall API Integration** – Fetch real-time card details like art, price, and rarity.

- **Local Storage** – All data is stored in-browser; no sign-ups or accounts necessary.

- **Responsive UI** – Clean, fast, and mobile-friendly design powered by Tailwind CSS.

---

### 🛠 Tech Stack
- **Frontend:** React + Vite

- **Styling:** Tailwind CSS and custom styling

- **APIs:** Scryfall API

- **Storage:** Browser Local Storage

---

### 🚀 Running Locally
**To run the app on your machine:**
1. Clone this repository
2. Open a terminal at the root folder `/scrystone` and run `cd scrystone` to open the project folder
3. If you don't have NPM locally, install NPM `npm install`
4. Start the development server `npm run dev`
5. Open your browser and go to `http://localhost:5173`

#### ❔FAQ
**How do I upload my card collection?**

Take your scanned collection of cards from the TCGPlayer and export your collection as a `.csv`. Save that `.csv` locally, and when you go to `Sync Cards` on the web app, select your collection `.csv` ✨ _Scrystone handles the rest!_
