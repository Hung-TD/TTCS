import * as React from "react";
import { getSynonymsFromDatamuse } from "@/services/languageToolService";

export const upgradeSimpleWords = async (text: string): Promise<(string | JSX.Element)[]> => {
  const words = text.split(/\b/);

  const upgradedWords = await Promise.all(
    words.map(async (word, idx) => {
      const lower = word.toLowerCase();
      const isWord = /^[a-zA-Z]+$/.test(lower);

      if (isWord) {
        const synonyms = await getSynonymsFromDatamuse(lower);
        const highBand = synonyms.find(
          (w) =>
            w.length > word.length + 2 &&
            !w.includes(" ") &&
            /^[a-zA-Z]+$/.test(w)
        );
        if (highBand) {
          return (
            <span
              key={`syn-${idx}`}
              style={{ color: "green", fontWeight: "bold" }}
              title={`Original: ${word}`}
            >
              {highBand}
            </span>
          );
        }
      }
      return word;
    })
  );

  return upgradedWords;
};