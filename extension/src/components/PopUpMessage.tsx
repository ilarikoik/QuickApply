import { useCallback, useEffect, useState } from "react";
import {
  FIELD_TYPES,
  type FillAllResponse,
  type UncertainDTO,
} from "../util/MessageTypes";

export default function Popup() {
  const [items, setItems] = useState<UncertainDTO[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | undefined>();
  const [canReloadTab, setCanReloadTab] = useState(false);
  const [error, setError] = useState("");
  const [fillResult, setFillResult] = useState("");
  const [filling, setFilling] = useState(false);

  const sendToTab = async (msg: object) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id === undefined) {
      throw new Error("Aktiivista välilehteä ei löytynyt.");
    }

    try {
      return await chrome.tabs.sendMessage(tab.id, msg);
    } catch (cause) {
      console.warn("Could not reach the content script:", cause);
      throw cause;
    }
  };

  const load = useCallback(async () => {
    setError("");
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const res = await sendToTab({ type: "GET_UNCERTAIN" });

      setIsConnected(res !== undefined);
      setCanReloadTab(Boolean(tab?.id && /^https?:\/\//i.test(tab.url ?? "")));
      setItems(res ?? []);
    } catch {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const isWebPage = /^https?:\/\//i.test(tab?.url ?? "");
      setIsConnected(false);
      setCanReloadTab(Boolean(tab?.id && isWebPage));
      setItems([]);
      setError(
        isWebPage
          ? "Päivitä verkkosivu (F5) ja avaa laajennus uudelleen. Jos yhteys ei palaudu, tarkista Chromen laajennusasetuksista QuickApply-sivuston käyttöoikeus."
          : "Chrome ei salli lomakkeeseen yhdistämistä tällä sivulla. Avaa tavallinen verkkosivu, jossa on lomake.",
      );
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const reloadActiveTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id === undefined) return;
    await chrome.tabs.reload(tab.id);
    window.close();
  };

  const fillAll = async () => {
    setFilling(true);
    setError("");
    setFillResult("");
    try {
      const result = (await sendToTab({
        type: "FILL_ALL",
      })) as FillAllResponse | undefined;
      if (!result) {
        throw new Error("Sivulta ei saatu vastausta. Päivitä sivu ja yritä uudelleen.");
      }
      await load();
      if (result.error) {
        setError(result.error);
      } else if (result.filled === 0) {
        setFillResult(
          result.detected === 0
            ? "Sivulta ei löytynyt tuettuja lomakekenttiä."
            : `Löytyi ${result.detected} kenttää, mutta profiilissa ei ollut niihin täytettäviä arvoja.`,
        );
      } else {
        setFillResult(`Täytettiin ${result.filled} kenttää.`);
      }
    } catch (cause) {
      console.error("Could not fill the form:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Lomakkeen täyttö epäonnistui.",
      );
    } finally {
      setFilling(false);
    }
  };

  return (
    <div style={{ width: 320, padding: 12 }}>
      {isConnected === false && (
        <div>
          <p>{error || "Aktiiviselta välilehdeltä ei saada yhteyttä lomakkeeseen."}</p>
          {canReloadTab && (
            <button type="button" onClick={reloadActiveTab}>
              Päivitä välilehti
            </button>
          )}
        </div>
      )}
      {isConnected && (
        <button
          type="button"
          onClick={fillAll}
          disabled={filling}
          style={{ marginBottom: 12 }}
        >
          {filling ? "Täytetään..." : "Täytä kaikki kentät"}
        </button>
      )}
      {fillResult && <p role="status">{fillResult}</p>}
      {error && isConnected && <p role="alert">{error}</p>}
      {/* {isConnected && items.length === 0 && <p>Ei epävarmoja kenttiä ✅</p>} */}

      {items.map((i) => (
        <div key={i.uid} style={{ marginBottom: 8 }}>
          <div>
            {i.label}{" "}
            <small>
              ({i.guess}, {Math.round(i.confidence * 100)}%)
            </small>
          </div>

          <button
            onClick={() =>
              sendToTab({
                type: "HIGHLIGHT_FIELD",
                uid: i.uid,
              })
            }
          >
            Näytä
          </button>

          <select
            defaultValue={i.guess}
            onChange={async (e) => {
              await sendToTab({
                type: "FILL_FIELD",
                uid: i.uid,
                fieldType: e.target.value,
              });

              load();
            }}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
