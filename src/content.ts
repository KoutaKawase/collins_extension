import type { ExtensionMessage } from "./shared/messages";
import { BASE } from "./shared/messages";

// Dict popup itself also matches <all_urls>, so content.js runs inside it.
// Clicks inside the popup must never ask background to close it.
const isDictPage: boolean =
  typeof location !== "undefined" && location.href.startsWith(BASE);

let triggerEl: HTMLDivElement | null = null;

function removeTrigger(): void {
  if (triggerEl) {
    triggerEl.remove();
    triggerEl = null;
  }
}

function getSelectedWord(): string {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return "";
  const text = sel.toString().trim();
  // Single selection only; keep raw string per spec
  if (!text || text.length > 100 || text.includes("\n")) return "";
  return text;
}

function sendMessage(msg: ExtensionMessage): void {
  try {
    chrome?.runtime?.sendMessage(msg);
  } catch (err) {
    console.warn("Collins: sendMessage failed", err);
  }
}

function showTrigger(x: number, y: number, word: string): void {
  removeTrigger();
  triggerEl = document.createElement("div");
  triggerEl.id = "collins-trigger";
  triggerEl.textContent = "📖";
  triggerEl.title = `Look up "${word}" in Collins`;
  triggerEl.style.left = `${x}px`;
  triggerEl.style.top = `${y}px`;
  triggerEl.addEventListener("mousedown", (e) => e.stopPropagation());
  triggerEl.addEventListener("mouseup", (e) => e.stopPropagation());
  triggerEl.addEventListener("click", (e) => {
    e.stopPropagation();
    sendMessage({ type: "OPEN_DICT", word });
    removeTrigger();
    window.getSelection()?.removeAllRanges();
  });
  document.documentElement.appendChild(triggerEl);
}

document.addEventListener("mouseup", (e) => {
  if (isDictPage) return;
  if (triggerEl && triggerEl.contains(e.target as Node)) return;
  setTimeout(() => {
    const word = getSelectedWord();
    if (!word) {
      removeTrigger();
      return;
    }
    try {
      const range = window.getSelection()?.getRangeAt(0);
      if (!range) {
        removeTrigger();
        return;
      }
      const rect = range.getBoundingClientRect();
      const x = rect.right + window.scrollX + 6;
      const y = rect.bottom + window.scrollY + 6;
      showTrigger(x, y, word);
    } catch {
      removeTrigger();
    }
  }, 10);
});

document.addEventListener("mousedown", (e) => {
  if (isDictPage) return;
  if (triggerEl && !triggerEl.contains(e.target as Node)) removeTrigger();
  // Close hover window on outside click; background ignores if none open.
  sendMessage({ type: "CLOSE_DICT" });
});

document.addEventListener("scroll", () => removeTrigger(), { capture: true, passive: true });
