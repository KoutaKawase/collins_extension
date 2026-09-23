let triggerEl = null;
let lastWord = '';

function removeTrigger() {
  if (triggerEl) {
    triggerEl.remove();
    triggerEl = null;
  }
}

function getSelectedWord() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return '';
  const text = sel.toString().trim();
  // Single selection only; keep raw string per spec
  if (!text || text.length > 100 || text.includes('\n')) return '';
  return text;
}

function showTrigger(x, y, word) {
  removeTrigger();
  triggerEl = document.createElement('div');
  triggerEl.id = 'collins-trigger';
  triggerEl.textContent = '📖';
  triggerEl.title = `Look up "${word}" in Collins`;
  triggerEl.style.left = `${x}px`;
  triggerEl.style.top = `${y}px`;
  triggerEl.addEventListener('mousedown', (e) => e.stopPropagation());
  triggerEl.addEventListener('mouseup', (e) => e.stopPropagation());
  triggerEl.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: 'OPEN_DICT', word });
    removeTrigger();
    window.getSelection()?.removeAllRanges();
  });
  document.documentElement.appendChild(triggerEl);
}

document.addEventListener('mouseup', (e) => {
  if (triggerEl && triggerEl.contains(e.target)) return;
  setTimeout(() => {
    const word = getSelectedWord();
    if (!word) {
      removeTrigger();
      return;
    }
    lastWord = word;
    try {
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = rect.right + window.scrollX + 6;
      const y = rect.bottom + window.scrollY + 6;
      showTrigger(x, y, word);
    } catch {
      removeTrigger();
    }
  }, 10);
});

document.addEventListener('mousedown', (e) => {
  if (triggerEl && !triggerEl.contains(e.target)) removeTrigger();
});

document.addEventListener('scroll', () => removeTrigger(), { capture: true, passive: true });
