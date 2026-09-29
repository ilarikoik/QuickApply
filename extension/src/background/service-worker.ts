// chrome.runtime.onMessage.addListener((msg, sender) => {
//   console.log("[content-script] MESSAGE:", msg);
//   if (msg.type === "UNCERTAIN_COUNT" && sender.tab?.id !== undefined) {
//     chrome.action.setBadgeText({
//       tabId: sender.tab.id,
//       text: msg.count > 0 ? String(msg.count) : "",
//     });
//     chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
//   }
// });
