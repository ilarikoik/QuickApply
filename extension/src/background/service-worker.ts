import type { Msg } from "../util/MessageTypes";
import { getProfiles, toProfileFormData } from "../lib/api";

chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
  if (msg.type === "GET_ACTIVE_PROFILE") {
    void (async () => {
      try {
        const stored = await chrome.storage.local.get([
          "authToken",
          "activeProfileId",
        ]);
        if (typeof stored.authToken !== "string") {
          throw new Error("Kirjaudu laajennukseen ennen profiilin käyttöä.");
        }
        const profiles = (await getProfiles(stored.authToken)).map(
          toProfileFormData,
        );
        const activeId =
          typeof stored.activeProfileId === "number"
            ? stored.activeProfileId
            : undefined;
        const profile =
          profiles.find((item) => item.id === activeId) ?? profiles[0];
        sendResponse({ profile });
      } catch (cause) {
        console.error("Could not fetch active profile:", cause);
        sendResponse({
          error:
            cause instanceof Error
              ? cause.message
              : "Aktiivista profiilia ei voitu hakea backendistä.",
        });
      }
    })();
    return true;
  }

  if (msg.type !== "UNCERTAIN_COUNT") return;

  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    sendResponse({ ok: false });
    return;
  }

  void Promise.all([
    chrome.action.setBadgeText({
      tabId,
      text: msg.count > 0 ? String(msg.count) : "",
    }),
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#f59e0b" }),
  ]).then(
    () => sendResponse({ ok: true }),
    () => sendResponse({ ok: false }),
  );
  return true;
});
