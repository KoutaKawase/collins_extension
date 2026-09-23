import { BASE, DEFAULTS, type ExtensionMessage, type ExtensionOptions } from "./shared/messages";

let dictWindowId: number | null = null;

async function getOpts(): Promise<ExtensionOptions> {
  try {
    const stored = await chrome.storage.sync.get(DEFAULTS as unknown as { [key: string]: unknown });
    return { ...DEFAULTS, ...(stored as Partial<ExtensionOptions>) };
  } catch {
    return { ...DEFAULTS };
  }
}

async function closeDictWindow(): Promise<void> {
  if (dictWindowId === null) return;
  try {
    await chrome.windows.remove(dictWindowId);
  } catch {
    // already closed
  }
  dictWindowId = null;
}

chrome.runtime.onMessage.addListener(
  async (msg: ExtensionMessage, sender: chrome.runtime.MessageSender): Promise<void> => {
    if (msg?.type === "CLOSE_DICT") {
      // From parent pages: close only the tracked dict window, never the sender.
      await closeDictWindow();
      return;
    }
    if (msg?.type === "CLOSE_SELF") {
      // From the dict popup's close button.
      await closeDictWindow();
      // Fallback for SW restart: close sender only if it is a dict page.
      const senderUrl: string = sender?.tab?.url ?? "";
      const senderWindowId: number | undefined = sender?.tab?.windowId;
      if (senderWindowId !== undefined && senderUrl.startsWith(BASE)) {
        try {
          await chrome.windows.remove(senderWindowId);
        } catch {
          // already closed
        }
      }
      return;
    }
    if (msg?.type !== "OPEN_DICT" || !msg.word) return;
    const url = BASE + encodeURIComponent(msg.word.trim());
    const opts = await getOpts();

    // Reuse existing dict window if still alive
    if (opts.reuse && dictWindowId !== null) {
      try {
        const w = await chrome.windows.get(dictWindowId);
        if (w) {
          const tabId: number | undefined = w.tabs?.[0]?.id;
          if (tabId !== undefined) await chrome.tabs.update(tabId, { url });
          const upd: chrome.windows.UpdateInfo = {
            focused: true,
            width: opts.width,
            height: opts.height,
          };
          if (opts.left !== null) upd.left = opts.left;
          if (opts.top !== null) upd.top = opts.top;
          await chrome.windows.update(dictWindowId, upd);
          return;
        }
      } catch {
        dictWindowId = null;
      }
    }

    const createData: chrome.windows.CreateData = {
      url,
      type: "popup",
      width: opts.width,
      height: opts.height,
      focused: true,
    };
    if (opts.left !== null) createData.left = opts.left;
    if (opts.top !== null) createData.top = opts.top;
    const win = await chrome.windows.create(createData);
    dictWindowId = win?.id ?? null;
  },
);

// Close when focus leaves the hover window (Alt+Tab, other window/app).
chrome.windows.onFocusChanged.addListener(async (windowId: number): Promise<void> => {
  if (dictWindowId === null) return;
  if (windowId === dictWindowId) return;
  await closeDictWindow();
});

// Close on tab switch within the same window (focus stays but context changed).
chrome.tabs.onActivated.addListener(async (): Promise<void> => {
  await closeDictWindow();
});

chrome.windows.onRemoved.addListener((windowId: number): void => {
  if (windowId === dictWindowId) dictWindowId = null;
});
