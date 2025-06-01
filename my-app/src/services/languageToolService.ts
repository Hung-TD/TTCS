export const checkGrammar = async (text: string): Promise<{ correctedText: string, matches: any[] }> => {
  const formData = new URLSearchParams();
  formData.append("text", text);
  formData.append("language", "en-US");

  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) return { correctedText: text, matches: [] };
  const result = await response.json();
  return { correctedText: text, matches: result.matches || [] };
};

export const getSynonymsFromDatamuse = async (word: string): Promise<string[]> => {
  try {
    const res = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
    const data = await res.json();
    return data.map((item: any) => item.word);
  } catch {
    return [];
  }
};