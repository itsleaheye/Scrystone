<p align="center">
  <img src="https://github.com/user-attachments/assets/735e172c-8334-4427-828a-fd83f9e6cbbd" width="100%">

# Scrystone | [View Live](https://scrystone.netlify.app/) | [View Style Guide](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=0-1&t=gWOUaWJ88Al3ZS2z-1)

A 'Magic the Gathering' web app built with React, Tailwind CSS, and the Scryfall API. It lets you upload your card collection from TCGPlayer, build decks, and track which cards you still need. It is all saved locally in your browser, with no account setup required.

</p>

### ✨ Features

- **Deck Building** – Create decks and categorize cards by type, mana cost, etc.

- **Card Collection Tracker** – Upload your card collection and automatically match them to your deck needs.

- **Filtering and sorting** - Search for cards by type, colour, and sort by price, type or card names

- **Deck Exporting** - Export your deck list in a MTG Goldfish format, which is wildly used by hobby shop's deck lists

  <img src="https://github.com/user-attachments/assets/3da3ec3f-55cb-4ee2-b1ce-2b40604e3c60" width="300">

- **Scryfall API Integration** – Fetch real-time card details like art, price, and rarities.

- **Local Storage** – All data is stored in-browser; no sign-up or accounts necessary.

- **Responsive UI** – A clean, fast, and mobile-friendly design, aided by Tailwind.

---

### 🛠 Tech Stack

- **Languages:** Typescript, CSS, JS
- **Libraries:** React, Vite, Tailwind, ReactIcons, DateFNSm, Select, React Router
- **Storage:** Browser Local Storage
- **IDE** - Visual Studio Code

---

### 🚀 Running Locally

**To run the app on your machine:**

1. Clone this repository
2. Open a terminal at the root folder `/scrystone` and run `cd scrystone` to open the project folder
3. If you don't have NPM or Node.js locally, install Node and NPM `npm install` _(Run this command if you see an error like `'vite' is not recognized as an internal or external command`)_
4. Start the development server `npm run dev`
5. Open your browser and go to `http://localhost:5173`

---

### 🚧 Plan for V2

- ~~Routing to support `back` keyboard actions\*\*~~ ✔️
- [Card name search bar](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=1-3&t=YXOAXnY0SHo6VljJ-4) ~~in collection view~~\*\* ✔️
- Render the art preview that matches the card (i.e. borderless card renders borderless art)
- OnClick in collection view, flip animation and show value, set, quantity, and if it's in a deck
- ~~Render mana symbols instead of just colours~~ ✔️
- Deck view [CSS update](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=1-597&t=YXOAXnY0SHo6VljJ-4)
- Hover card summary for [breakdown of missing cards](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=2-185&t=YXOAXnY0SHo6VljJ-4)
