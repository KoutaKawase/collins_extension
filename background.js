const BASE = 'https://www.collinsdictionary.com/dictionary/english/';
const DEFAULTS = { width: 420, height: 600, left: null, top: null, reuse: true };
let dictWindowId = null;

async function getOpts() {
  try {
    return { ...DEFAULTS, ...((await chrome.storage.sync.get(DEFAULTS)) || {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type !== 'OPEN_DICT' || !msg.word) return;
  const url = BASE + encodeURIComponent(msg.word.trim());
  const opts = await getOpts();

  // Reuse existing dict window if still alive
  if (opts.reuse && dictWindowId !== null) {
    try {
      const w = await chrome.windows.get(dictWindowId);
      if (w) {
        await chrome.tabs.update(w.tabs[0].id, { url });
        const upd = { focused: true, width: opts.width, height: opts.height };
        if (opts.left !== null) upd.left = opts.left;
        if (opts.top !== null) upd.top = opts.top;
        await chrome.windows.update(dictWindowId, upd);
        return;
      }
    } catch {
      dictWindowId = null;
    }
  }

  const createData = {
    url,
    type: 'popup',
    width: opts.width,
    height: opts.height,
    focused: true,
  };
  if (opts.left !== null) createData.left = opts.left;
  if (opts.top !== null) createData.top = opts.top;
  const win = await chrome.windows.create(createData);
  dictWindowId = win.id;
});

// Close dict window when focus moves elsewhere (spec: focus lost => auto close)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (dictWindowId === null) return;
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  if (windowId !== dictWindowId) {
    try {
      await chrome.windows.remove(dictWindowId);
    } catch {
      // already closed
    }
    dictWindowId = null;
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === dictWindowId) dictWindowId = null;
});
