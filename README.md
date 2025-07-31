<p align="center">
<img  width="100%"alt="image" src="https://github.com/user-attachments/assets/ad7475e4-9eec-4b25-8a01-527bffe7e16e" />

# Scrystone | [View Live](https://scrystone.netlify.app/) | [View Style Guide](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=0-1&t=gWOUaWJ88Al3ZS2z-1)

A 'Magic the Gathering' web app built with React, Tailwind CSS, and the Scryfall API. It lets you upload your card collection from TCGPlayer, build decks, and track which cards you still need. It is all saved locally in your browser, with no account setup required.

</p>

### ✨ Features

- **Deck Building** – Create decks and categorize cards by type, mana cost, etc.

- **Card Collection Tracker** – Upload your card collection and automatically match it to your deck needs

- **Filtering and sorting** - Search for cards by type, colour, and sort by price, type or card names

- **Deck Exporting** - Export your deck list to see what cards you're missing or to share with friends

- **Scryfall API Integration** – Fetch real-time card details like art, price, and rarities

- **Local Storage** – All data is stored in-browser; no sign-up or accounts necessary

  - _Firebase prototype in the `/firebase` branch_

- **Responsive UI** – A clean, fast, and mobile-friendly design, aided by Tailwind

- **FTUX and Help page** - A page to help orient first-time users getting started

---

### 🛠 Tech Stack

- **Languages:** Typescript, CSS, JS
- **Libraries:** React, Vite, Tailwind, ReactIcons, DateFNSm, Select, React Router
- **Storage:** Browser Local Storage & Firebase
- **IDE** - Visual Studio Code

---

### 🚀 Running Locally

**To run the app on your machine:**

1. Clone this repository
2. Open a terminal at the root folder `/scrystone` and run `cd scrystone` to open the project folder
3. If you don't have Node.js locally, [install Node](https://nodejs.org/en/download)
4. Start the development server `npm run dev`
5. Open a browser and go to `http://localhost:5173`

---

### 🚧 Plan for V2

- [x] Improve collection download speeds V1
- [] Performance overhaul V2 (upload speeds, collection search & view, etc.)
- [x] Routing integration
- [x] Card search bar added to card action row | [Design](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=1-3&t=YXOAXnY0SHo6VljJ-4)
- [x] Card collection set distinguishment
- [ ] Deck building set control
- [x] Design V2 (new nav, FTUX, theming)
- [x] Render the art preview that matches the card (i.e. borderless card renders borderless art)
- [ ] OnClick in collection view, flip animation and show value, set, quantity, and if it's in a deck
- [x] Ability to import decks
- [x] Render mana symbols instead of placeholder solid colours
- [ ] Deck view [CSS update](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=1-597&t=YXOAXnY0SHo6VljJ-4)
- [ ] Hover card summary for breakdown of missing cards | [Design](https://www.figma.com/design/K4yFBl1FcD3B8TdgK76oQl/Scrystone?node-id=2-185&t=YXOAXnY0SHo6VljJ-4)

## Stills of the feature:

<img width="750" alt="image" src="https://github.com/user-attachments/assets/b546a82a-269a-4dc9-9928-4bbda3cdb654" />
<img width="750" alt="image" src="https://github.com/user-attachments/assets/fe55edcb-aa15-46d1-be8b-4b818c6c783b" />
<img width="750" alt="image" src="https://github.com/user-attachments/assets/fa656b76-c20b-4f5e-abe8-44f252125202" />
<img width="750" alt="image" src="https://github.com/user-attachments/assets/b991831a-f9ac-4a3b-9538-1a04834cad3f" />
<img width="750" alt="image" src="https://github.com/user-attachments/assets/a1507162-9c4e-4dca-900e-33d2e2c064ce" />

### V1 stills

<img src="https://github.com/user-attachments/assets/735e172c-8334-4427-828a-fd83f9e6cbbd" width="750" >
