const contentLibrary = require("./content-library");

function generateByWords(mode, wordCount) {
  const sentences = contentLibrary.getSentences(mode, 50);
  const allWords = sentences.join(" ").split(/\s+/);

  const result = [];
  let i = 0;
  while (result.length < wordCount) {
    result.push(allWords[i % allWords.length]);
    i++;
  }
  return result.join(" ");
}

function generateBySentences(mode, sentenceCount) {
  const sentences = contentLibrary.getSentences(mode, sentenceCount);
  return sentences.join(" ");
}

function generateByParagraphs(mode, paragraphCount) {
  const paragraphs = [];
  const sentencesPerParagraph = mode === "creepy-placeholder" ? 3 : 4;

  for (let i = 0; i < paragraphCount; i++) {
    const sentences = contentLibrary.getSentences(mode, sentencesPerParagraph);
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}

function generateQuote(includeAttribution) {
  const quote = contentLibrary.getRandomQuote();
  if (includeAttribution) {
    return `"${quote.text}" — ${quote.source}`;
  }
  return quote.text;
}

function generate(mode, unit, amount, includeAttribution) {
  if (mode === "quote" && unit === "sentences" && amount === 1) {
    return generateQuote(includeAttribution);
  }

  let text;
  switch (unit) {
    case "words":
      text = generateByWords(mode, amount);
      break;
    case "sentences":
      text = generateBySentences(mode, amount);
      break;
    case "paragraphs":
      text = generateByParagraphs(mode, amount);
      break;
    default:
      text = generateBySentences(mode, amount);
  }
  return text;
}

module.exports = {
  generate,
  generateQuote,
  generateByWords,
  generateBySentences,
  generateByParagraphs,
};
