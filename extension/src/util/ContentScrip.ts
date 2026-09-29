// content-script.ts
// Ajetaan jokaisella rekrytointisivustolla (manifest.json: content_scripts)

import type { Profile, ProfileFormData } from "../interface/ProfileInterface";
import testData from "../testData.json";
import type { Msg, UncertainDTO } from "./MessageTypes";

type FieldType =
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "address"
  | "location"
  | "city"
  | "postalCode"
  | "country"
  | "currentTitle"
  // | "technologies"
  | "yearsOfExperience"
  | "education"
  | "school"
  | "graduationYear"
  | "reference"
  | "linkedin"
  | "github"
  | "portfolio"
  | "summary"
  | "coverLetter"
  | "coverLetter"
  | "salaryExpectation"
  | "availability"
  | "willingToRelocate"
  | "unknown";
// technologies - Which technologies have you worked with?
// muista muokata testDataa oikein

//{ fi, en } eikä pelkkä string
const LOCALIZED_FIELDS: FieldType[] = [
  "currentTitle",
  "education",
  "summary",
  "availability",
  "coverLetter",
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
  fullName: /full.?name|koko.?nimi|kokonimi/i,
  email: /e-?mail|sähköposti/i,
  phone: /phone|mobile|\btel\b|Puhelinnumero/i,
  dateOfBirth: /date.?of.?birth|birth.?date|syntymäaika/i,
  // technologies: /technologies|skills|osaaminen|taitot/i,
  address:
    /\baddress\b|address.?line|street.?address|katuosoite|lähiosoite|kotiosoite|osoiterivi|\bosoite\b/i,
  city: /\bcity\b|\btown\b|paikkakunta|kaupunki/i,
  location:
    /location|where are you based|sijainti|asuinpaikka|postitoimipaikka|Asuinkunta/i,
  postalCode: /postal.?code|zip.?code|postinumero|postinro/i,
  country: /country|maa(?!il)/i,
  currentTitle:
    /current.?title|job.?title|nykyinen.?tehtävä|ammattinimike|työnimike|ammatti/i,
  yearsOfExperience: /years?.?of.?experience|work.?experience|työkokemus/i,
  education: /education|degree|koulutus|tutkinto/i,
  school: /school|university|college|oppilaitos|koulu|yliopisto/i,
  graduationYear: /graduation.?year|valmistumisvuosi/i,
  linkedin: /linkedin/i,
  github: /github/i,
  portfolio: /portfolio/i,
  summary:
    /summary|yhteenveto|about.?(me|you)|profile|miksi olisit sopiva työntekijä meille|esittely|kuvaus/i,
  coverLetter: /cover.?letter|motivation|saatekirje|hakemusteksti/i,
  salaryExpectation: /salary|compensation|palkkatoive|palkkatoivomus/i,
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

let uncertainMap = new Map<string, DetectedField>();

function registerUncertain(fields: DetectedField[]) {
  uncertainMap = new Map();
  fields.forEach((f, i) => {
    const uid = f.element.dataset.afUid ?? `af-${i}-${Date.now()}`;
    f.element.dataset.afUid = uid;
    uncertainMap.set(uid, f);
  });
  chrome.runtime.sendMessage({
    type: "UNCERTAIN_COUNT",
    count: uncertainMap.size,
  } satisfies Msg);
}

chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
  if (msg.type === "GET_UNCERTAIN") {
    const list: UncertainDTO[] = [...uncertainMap].map(([uid, f]) => ({
      uid,
      guess: f.type,
      confidence: f.confidence,
      label:
        collectSignals(f.element)[0]?.text.trim().slice(0, 60) ||
        f.element.name ||
        "(ei nimeä)",
    }));
    sendResponse(list);
    return; // sync response
  }

  if (msg.type === "HIGHLIGHT_FIELD") {
    const el = uncertainMap.get(msg.uid)?.element;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
    if (el) el.style.outline = "2px solid orange";
  }

  if (msg.type === "FILL_FIELD") {
    const f = uncertainMap.get(msg.uid);
    if (f) {
      f.type = msg.fieldType as FieldType;
      getActiveProfile().then((p) => p && fillFields([f], p));
      f.element.style.outline = "";
      uncertainMap.delete(msg.uid);
      chrome.runtime.sendMessage({
        type: "UNCERTAIN_COUNT",
        count: uncertainMap.size,
      } satisfies Msg);
    }
  }
});

async function getActiveProfile(): Promise<ProfileFormData | undefined> {
  const profiles = testData as ProfileFormData[];
  const result = await chrome.storage.local.get("activeProfileId");
  const activeId = result.activeProfileId as number | undefined;
  if (activeId === undefined) return profiles[0]; // fallback
  return profiles.find((p) => p.id === activeId);
}

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

  // Rekrysivut voivat näyttää otsikon <span class="label">-elementissä
  // kentän wrapperin sisällä ilman label[for]-sidosta. Etsi lähin edeltävä
  // otsikko enintään neljän wrapper-tason sisältä.
  let wrapper: Element | null = el.parentElement;
  for (let depth = 0; wrapper && depth < 4; depth++) {
    const precedingLabels = Array.from(
      wrapper.querySelectorAll(".label, label, span"),
    ).filter(
      (candidate) =>
        Boolean(
          candidate.compareDocumentPosition(el) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ) && Boolean(candidate.textContent?.trim()),
    );
    const adjacentLabel = precedingLabels.at(-1);
    if (adjacentLabel?.textContent?.trim()) {
      signals.push({ text: adjacentLabel.textContent, source: "adjacentText" });
      break;
    }
    wrapper = wrapper.parentElement;
  }

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
      // Näkyvä label, placeholder ja aria-label ovat vahvoja kenttäsignaaleja.
      // name/id jäävät heikommiksi, koska niissä voi olla satunnaisia osumia.
      const hasDirectMatch = signals.some(
        (s) =>
          (s.source === "label" ||
            s.source === "parentLabel" ||
            s.source === "tableCell" ||
            s.source === "tableCellSibling" ||
            s.source === "adjacentText" ||
            s.source === "placeholder" ||
            s.source === "aria-label") &&
          pattern.test(s.text),
      );
      const score = hasDirectMatch ? 0.75 : 0.55;
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
    // Jobbsivustojen sijaintihaku (ei hakijan profiilikenttä); täyttö avaa
    // ehdotuslistan, jonka DOM-muutokset käynnistäisivät skannauksen uudelleen.
    if (el.closest(".geosuggest")) return false;
    if (el instanceof HTMLInputElement && el.type === "hidden") return false;
    if (
      el instanceof HTMLInputElement &&
      (el.readOnly || el.classList.contains("hasDatepicker"))
    )
      return false;
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
  profile: Profile,
  lang: "fi" | "en",
): string | undefined {
  if (type === "location") {
    const city = profile["city"] as string | undefined;
    const country = profile["country"] as string | undefined;
    if (city && country) return `${city}, ${country}`;
    return city || country;
  }
  const raw = profile[type];
  if (raw === undefined) return undefined;

  if (LOCALIZED_FIELDS.includes(type)) {
    const localized = raw as LocalizedValue;
    return localized[lang] || localized.en || localized.fi;
  }

  if (typeof raw === "boolean") return undefined;
  return raw as string;
}

function fillFields(
  fields: DetectedField[],
  profile: Record<string, string | number | LocalizedValue | boolean>,
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

function watchForFormChanges(onChange: () => void) {
  let timeout: number | undefined;

  const observer = new MutationObserver(() => {
    clearTimeout(timeout);

    timeout = window.setTimeout(() => {
      onChange();
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log("[content-script] MESSAGE:", msg);
  if (msg.type === "UNCERTAIN_COUNT" && sender.tab?.id !== undefined) {
    chrome.action.setBadgeText({
      tabId: sender.tab.id,
      text: msg.count > 0 ? String(msg.count) : "",
    });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
  }
});

async function run() {
  const { toFill, uncertain } = scanForm();

  console.log(
    `[content-script] löytyi ${toFill.length} täytettävää, ${uncertain.length} epävarmaa`,
  );
  console.log(
    "[content-script] toFill:",
    toFill.map((f) => ({ type: f.type, confidence: f.confidence })),
  );

  // hae oikea data
  const profile = await getActiveProfile();
  if (!profile) {
    console.warn("[content-script] profiilia ei löytynyt testidatasta");
    return;
  }
  fillFields(toFill, profile);

  // if (uncertain.length > 0) {
  //   // popupille epävarmojen kenttien lista (chrome.runtime.sendMessage)
  //   console.log(
  //     "Epävarmat kentät:",
  //     uncertain.map((f) => ({ signals: f.signals, confidence: f.confidence })),
  //   );
  // }

  if (uncertain.length > 0) {
    registerUncertain(uncertain);
  }
}
// console.log("[content-script] ladattu, sivu:", location.href);
watchForFormChanges(() => run());
run();
