const path = require("path");
const fs = require("fs");

let quotesData = null;
let kingIpsumData = null;
let creepyData = null;

function loadJSON(filename) {
  const filePath = path.join(__dirname, "..", "content", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getQuotes() {
  if (!quotesData) {
    quotesData = loadJSON("quotes.json");
  }
  return quotesData;
}

function getKingIpsum() {
  if (!kingIpsumData) {
    kingIpsumData = loadJSON("king-ipsum.json");
  }
  return kingIpsumData;
}

function getCreepyPlaceholders() {
  if (!creepyData) {
    creepyData = loadJSON("creepy-placeholders.json");
  }
  return creepyData;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomQuote() {
  const quotes = getQuotes();
  return getRandomItem(quotes);
}

function getSentences(mode, count) {
  let pool;
  if (mode === "quote") {
    pool = getQuotes().map((q) => q.text);
  } else if (mode === "king-ipsum") {
    pool = getKingIpsum().sentences;
  } else {
    pool = getCreepyPlaceholders().sentences;
  }

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return result;
}

function getFragments(mode) {
  if (mode === "king-ipsum") {
    return getKingIpsum().fragments;
  }
  return getCreepyPlaceholders().fragments;
}

module.exports = {
  getQuotes,
  getKingIpsum,
  getCreepyPlaceholders,
  getRandomItem,
  getRandomQuote,
  getSentences,
  getFragments,
};
