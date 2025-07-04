const fetch = require("node-fetch");

exports.handler = async function (event) {
  const query = event.queryStringParameters.name;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'name' query parameter" }),
    };
  }

  const urls = [
    `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(query)}`,
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`,
    `https://api.scryfall.com/cards/search?q=!${encodeURIComponent(query)}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
      }
    } catch (err) {
      console.warn(`Failed to fetch from: ${url}`, err);
    }
  }

  return {
    statusCode: 404,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: `No results found for '${query}'`,
    }),
  };
};
