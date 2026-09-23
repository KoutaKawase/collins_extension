// Injected only on Collins dict popup window.
// Close spec: outside click (handled via background) or explicit close button.
const btn = document.createElement("button");
btn.id = "collins-dict-close";
btn.textContent = "×";
btn.title = "Close";
btn.style.cssText =
  "position:fixed;top:8px;right:8px;z-index:999999;width:32px;height:32px;font-size:18px;line-height:1;cursor:pointer;border:1px solid #ccc;border-radius:50%;background:#fff;";
btn.addEventListener("click", () => {
  try {
    chrome?.runtime?.sendMessage({ type: "CLOSE_SELF" });
  } catch {
    /* ignore */
  }
});
(document.body ?? document.documentElement).appendChild(btn);
