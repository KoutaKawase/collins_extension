// Injected only on Collins dict popup window.
// Close on mouse-leave + blur (spec: auto-close when hover window loses focus).
// Delay is user-configurable via options page (storage.sync.closeDelay).
let leaveTimer = null;
let closeDelay = 300;
try {
  chrome.storage?.sync?.get({ closeDelay: 300 }).then((s) => {
    closeDelay = s.closeDelay ?? 300;
  });
  chrome.storage?.onChanged?.addListener((chg, area) => {
    if (area === 'sync' && chg.closeDelay) closeDelay = chg.closeDelay.newValue ?? 300;
  });
} catch { /* ignore */ }

function scheduleClose(ms = closeDelay) {
  clearTimeout(leaveTimer);
  leaveTimer = setTimeout(() => window.close(), ms);
}

document.addEventListener('mouseleave', () => scheduleClose());
document.documentElement?.addEventListener('mouseleave', () => scheduleClose());
document.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
window.addEventListener('blur', () => scheduleClose());
