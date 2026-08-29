const authKey = import.meta.env.VITE_DEEPL_API_KEY;

export async function translateText(
  text: string,
  targetLang: "EN" | "FI",
): Promise<string> {
  if (!text.trim()) return "";
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      text,
      target_lang: targetLang,
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation error: ${response.status}`);
  }

  const data = await response.json();
  return data.translations[0].text;
}
