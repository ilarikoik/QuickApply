import { useEffect, useState } from "react";
import type { UncertainDTO } from "../util/MessageTypes";

const TYPES = [
  "firstName",
  "lastName",
  "fullName",
  "email",
  "phone",
  "dateOfBirth",
  "address",
  "location",
  "city",
  "postalCode",
  "country",
  "currentTitle",
  "yearsOfExperience",
  "education",
  "school",
  "graduationYear",
  "reference",
  "linkedin",
  "github",
  "portfolio",
  "summary",
  "coverLetter",
  "salaryExpectation",
  "availability",
  "willingToRelocate",
];

export default function Popup() {
  const [items, setItems] = useState<UncertainDTO[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | undefined>();

  const sendToTab = async (msg: object) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id === undefined) return undefined;

    try {
      return await chrome.tabs.sendMessage(tab.id, msg);
    } catch {
      return undefined;
    }
  };

  const load = async () => {
    const res = await sendToTab({
      type: "GET_UNCERTAIN",
    });

    setIsConnected(res !== undefined);
    setItems(res ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ width: 320, padding: 12 }}>
      {isConnected === false && (
        <p>Aktiiviselta välilehdeltä ei saada yhteyttä lomakkeeseen.</p>
      )}
      {isConnected && items.length === 0 && <p>Ei epävarmoja kenttiä ✅</p>}

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
            {TYPES.map((t) => (
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
