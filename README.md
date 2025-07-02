# Scrystone | [View Live](https://scrystone.netlify.app/) | [View Style Guide](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=0-1&t=gWOUaWJ88Al3ZS2z-1)

A 'Magic the Gathering' web app built with React, Tailwind CSS, and the Scryfall API. It lets you upload your card collection from TCGPlayer, build decks, and track which cards you still need. It is all saved locally in your browser, with no account setup required.

### ✨ Features

- **Deck Building** – Create decks and categorize cards by type, mana cost, etc.

- **Card Collection Tracker** – Upload your card collection and automatically match them to your deck needs.

- **Scryfall API Integration** – Fetch real-time card details like art, price, and rarities.

- **Local Storage** – All data is stored in-browser; no sign-up or accounts necessary.

- **Responsive UI** – Clean, fast, and mobile-friendly design powered by Tailwind CSS.

---

### 🛠 Tech Stack

- **Languages:** Typescript, CSS, JS
- **Libraries:** React, Vite, Tailwind, ReactIcons, DateFNS
- **Storage:** Browser Local Storage
- **IDE** - Visual Studio Code

---

### 🚀 Running Locally

**To run the app on your machine:**

1. Clone this repository
2. Open a terminal at the root folder `/scrystone` and run `cd scrystone` to open the project folder
3. If you don't have NPM locally, install NPM `npm install` _(Run this command if you see an error like `'vite' is not recognized as an internal or external command`)_
4. Start the development server `npm run dev`
5. Open your browser and go to `http://localhost:5173`

#### To Dos

- List view deck builder management functionality
- Mobile list view modal on tap
- Multi-select for some filters
- Allow deck deletion
- Only combine quantities of cards if the name and set is the same. Otherwise render set specific art if Scryfall has it
- Foil indicator
- Render the art preview that matches the card (i.e. borderless card renders borderless art)
- Mana summary on deck view needs to update in real time
- On card individual hover or click in gallery view, flip animation and show value, quantity, and if its in a deck
- Do not render card at all if no art found
- Create updated at time in localstorage so the last sync time is accurate
- Animated emblem on loading and loading/error banners or states
- Render mana symbols instead of just colours

#### ❔FAQ

**How do I upload my card collection?**

Take your scanned collection of cards from the TCGPlayer and export your collection as a `.csv`. Save that `.csv` locally, and when you go to `Sync Cards` on the web app, select your collection `.csv` ✨ _Scrystone handles the rest!_
