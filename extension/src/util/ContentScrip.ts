// content-script.ts
// Ajetaan jokaisella rekrytointisivustolla (manifest.json: content_scripts)

import testData from "../testData.json";

type FieldType =
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "address"
  | "city"
  | "postalCode"
  | "country"
  | "currentTitle"
  | "yearsOfExperience"
  | "education"
  | "school"
  | "reference"
  | "linkedin"
  | "github"
  | "portfolio"
  | "summary"
  | "coverLetter"
  | "salaryExpectation"
  | "availability"
  | "willingToRelocate"
  | "unknown";

//{ fi, en } eikä pelkkä string
const LOCALIZED_FIELDS: FieldType[] = [
  "currentTitle",
  "education",
  "summary",
  "availability",
];

interface LocalizedValue {
  fi: string;
  en: string;
}

interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  type: FieldType;
  confidence: number; // 0–1
  signals: string[]; // debug: mistä matchi tuli
}

// regex
const PATTERNS: Record<Exclude<FieldType, "unknown">, RegExp> = {
  firstName: /first.?name|given.?name|etunimi|preferred name/i,
  lastName: /last.?name|surname|family.?name|sukunimi/i,
  fullName: /full.?name|kokonimi/i,
  email: /e-?mail|sähköposti/i,
  phone: /phone|mobile|tel(?!t)|puhelin/i,
  dateOfBirth: /date.?of.?birth|birth.?date|syntymäaika/i,
  address: /^address|street.?address|katuosoite|osoite/i,
  city: /city|town|paikkakunta|kaupunki/i,
  postalCode: /postal.?code|zip.?code|postinumero/i,
  country: /country|maa(?!il)/i,
  currentTitle: /current.?title|job.?title|nykyinen.?tehtävä|ammattinimike/i,
  yearsOfExperience: /years?.?of.?experience|work.?experience|työkokemus/i,
  education: /education|degree|koulutus|tutkinto/i,
  school: /school|university|college|oppilaitos|koulu|yliopisto/i,
  linkedin: /linkedin/i,
  github: /github/i,
  portfolio: /portfolio/i,
  summary: /summary|about.?(me|you)|profile|esittely|kuvaus/i,
  coverLetter: /cover.?letter|motivation|saatekirje/i,
  salaryExpectation: /salary|compensation|palkkatoive/i,
  availability:
    /availability|start.?date|notice.?period|saatavuus|aloitusajankohta|milloin voit aloittaa/i,
  willingToRelocate: /relocat|muuttohalukkuus|valmis muuuttamaan/i,
  reference: /reference|suosittelija/i,
};

// autocomplete-arvot ovat luotettavin signaali -> painotetaan korkeammalle
const AUTOCOMPLETE_MAP: Record<string, FieldType> = {
  "given-name": "firstName",
  "family-name": "lastName",
  name: "fullName",
  email: "email",
  tel: "phone",
  bday: "dateOfBirth",
  "street-address": "address",
  "address-level2": "city",
  "postal-code": "postalCode",
  country: "country",
  "country-name": "country",
};

// yksittäisen kentän analyysi
function collectSignals(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): { text: string; source: string }[] {
  const signals: { text: string; source: string }[] = [];

  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label?.textContent)
      signals.push({ text: label.textContent, source: "label" });
  }

  // lähin edeltävä label/teksti DOM:ssa, jos eksplisiittistä sidontaa ei ole
  const parentLabel = el.closest("label");
  if (parentLabel?.textContent)
    signals.push({ text: parentLabel.textContent, source: "parentLabel" });

  // fallback: vanhanmalliset taulukkopohjaiset lomakkeet, joissa teksti on
  // pelkkänä tekstinä samassa <td>:ssä tai edellisessä sisarsolussa, ilman <label>-elementtiä
  const cell = el.closest("td, th");
  if (cell) {
    // teksti samassa solussa (input-elementin ulkopuolella)
    const ownCellText = Array.from(cell.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    if (ownCellText) signals.push({ text: ownCellText, source: "tableCell" });

    // teksti edellisessä sisarsolussa (yleisin rakenne: <td>Etunimi:</td><td><input></td>)
    const prevCell = cell.previousElementSibling;
    if (prevCell?.textContent?.trim())
      signals.push({ text: prevCell.textContent, source: "tableCellSibling" });
  }

  if (el.getAttribute("placeholder"))
    signals.push({
      text: el.getAttribute("placeholder")!,
      source: "placeholder",
    });
  if (el.getAttribute("aria-label"))
    signals.push({
      text: el.getAttribute("aria-label")!,
      source: "aria-label",
    });
  if (el.name) signals.push({ text: el.name, source: "name" });
  if (el.id) signals.push({ text: el.id, source: "id" });

  return signals;
}

function classifyField(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): DetectedField {
  // korkein luottamus: autocomplete-attribuutti
  const autocomplete = el.getAttribute("autocomplete");
  if (autocomplete && AUTOCOMPLETE_MAP[autocomplete]) {
    return {
      element: el,
      type: AUTOCOMPLETE_MAP[autocomplete],
      confidence: 0.95,
      signals: [`autocomplete:${autocomplete}`],
    };
  }

  // type="email" / type="tel" antaa suoraan vahvan vihjeen
  if (el instanceof HTMLInputElement) {
    if (el.type === "email")
      return {
        element: el,
        type: "email",
        confidence: 0.85,
        signals: ["type=email"],
      };
    if (el.type === "tel")
      return {
        element: el,
        type: "phone",
        confidence: 0.8,
        signals: ["type=tel"],
      };
  }

  // muuten: kerää tekstisignaalit ja matchaa regexeillä
  const signals = collectSignals(el);
  const combined = signals
    .map((s) => s.text)
    .join(" ")
    .toLowerCase();

  let bestType: FieldType = "unknown";
  let bestScore = 0;
  const matchedSignals: string[] = [];

  for (const [type, pattern] of Object.entries(PATTERNS) as [
    FieldType,
    RegExp,
  ][]) {
    if (pattern.test(combined)) {
      // painota sen mukaan mistä signaali tuli (label/taulukkosolu > name/id > placeholder)
      const hasLabelMatch = signals.some(
        (s) =>
          (s.source === "label" ||
            s.source === "parentLabel" ||
            s.source === "tableCell" ||
            s.source === "tableCellSibling") &&
          pattern.test(s.text),
      );
      const score = hasLabelMatch ? 0.75 : 0.55;
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
        matchedSignals.push(type);
      }
    }
  }

  return {
    element: el,
    type: bestType,
    confidence: bestScore,
    signals: matchedSignals,
  };
}

const CONFIDENCE_THRESHOLD = 0.6;
function scanForm(): { toFill: DetectedField[]; uncertain: DetectedField[] } {
  const rawFields = Array.from(
    document.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select"),
  ).filter((el) => {
    if (el instanceof HTMLInputElement && el.type === "hidden") return false;
    if (el.disabled) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });

  const classified = rawFields
    .map(classifyField)
    .filter((f) => f.type !== "unknown");

  return {
    toFill: classified.filter((f) => f.confidence >= CONFIDENCE_THRESHOLD),
    uncertain: classified.filter((f) => f.confidence < CONFIDENCE_THRESHOLD),
  };
}

// arvon asetus React-yhteensopivasti

function setNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  // simuloidaan koko käyttäjän interaktio
  // monet lomakekirjastot (Formik, react-hook-form) merkitsevät kentän
  // "kosketetuksi" (touched) vasta focus+blur-syklin perusteella,
  // eivätkä aja validointia pelkän input/change-eventin varassa --> FocusEvent + input/change + BlurEvent
  el.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
  el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));

  el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  el.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
}

// tunnistaa sivun kielen: ensisijaisesti <html lang="">, fallback body-tekstin perusteella
function detectPageLanguage(): "fi" | "en" {
  const htmlLang = document.documentElement.lang?.toLowerCase();
  if (htmlLang?.startsWith("fi")) return "fi";
  if (htmlLang?.startsWith("en")) return "en";

  // karkea fallback: lasketaan suomalaisten sanojen esiintymät bodyn tekstistä
  const sample = document.body.innerText.slice(0, 2000).toLowerCase();
  const fiHits = (sample.match(/\b(ja|on|ei|työ|hae|lähetä)\b/g) || []).length;
  return fiHits > 3 ? "fi" : "en";
}

function resolveValue(
  type: FieldType,
  profile: Record<string, string | LocalizedValue | boolean>,
  lang: "fi" | "en",
): string | undefined {
  const raw = profile[type];
  if (raw === undefined) return undefined;

  if (LOCALIZED_FIELDS.includes(type)) {
    const localized = raw as LocalizedValue;
    return localized[lang] || localized.en || localized.fi;
  }

  if (typeof raw === "boolean") return undefined; // esim. willingToRelocate -> ei tekstikenttä
  return raw as string;
}

function fillFields(
  fields: DetectedField[],
  profile: Record<string, string | LocalizedValue | boolean>,
) {
  const lang = detectPageLanguage();

  for (const field of fields) {
    if (field.type === "unknown") continue;

    /// skipataan FILE input - tietoturva
    if (
      field.element instanceof HTMLInputElement &&
      field.element.type === "file"
    )
      continue;

    const value = resolveValue(field.type, profile, lang);
    if (!value) continue;

    try {
      if (
        field.element instanceof HTMLInputElement ||
        field.element instanceof HTMLTextAreaElement
      ) {
        setNativeValue(field.element, value);
      }
      // HTMLSelectElement: erillinen logiikka (option-matchaus arvolle) tarvitaan tähän myöhemmin
      // willingToRelocate (checkbox/radio): erillinen logiikka tarvitaan tähän myöhemmin
    } catch (err) {
      // yksittäisen kentän virhe ei saa pysäyttää koko täyttöä
      console.warn(
        "[content-script] kentän täyttö epäonnistui:",
        field.type,
        err,
      );
    }
  }
}

// ---------- 6. Dynaamiset lomakkeet (esim. Workday, Greenhouse) ----------
function watchForFormChanges(onChange: () => void) {
  const observer = new MutationObserver(() => onChange());
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

function run() {
  const { toFill, uncertain } = scanForm();

  console.log(
    `[content-script] löytyi ${toFill.length} täytettävää, ${uncertain.length} epävarmaa`,
  );
  console.log(
    "[content-script] toFill:",
    toFill.map((f) => ({ type: f.type, confidence: f.confidence })),
  );

  // hae oikea data
  fillFields(toFill, testData);

  if (uncertain.length > 0) {
    // popupille epävarmojen kenttien lista (chrome.runtime.sendMessage)
    console.log(
      "Epävarmat kentät:",
      uncertain.map((f) => ({ signals: f.signals, confidence: f.confidence })),
    );
  }
}
console.log("[content-script] ladattu, sivu:", location.href);
watchForFormChanges(() => run());
run();
