import type { Msg } from "../util/MessageTypes";

chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
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
