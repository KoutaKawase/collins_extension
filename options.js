const DEFAULTS = { width: 420, height: 600, left: null, top: null, closeDelay: 300, reuse: true };
async function load() {
  const s = { ...DEFAULTS, ...((await chrome.storage.sync.get(DEFAULTS)) || {}) };
  for (const k of ['width', 'height', 'left', 'top', 'closeDelay']) document.getElementById(k).value = s[k] ?? '';
  document.getElementById('reuse').checked = !!s.reuse;
}
document.getElementById('save').addEventListener('click', async () => {
  const num = (id) => { const v = document.getElementById(id).value; return v === '' ? null : Number(v); };
  await chrome.storage.sync.set({
    width: num('width') ?? DEFAULTS.width,
    height: num('height') ?? DEFAULTS.height,
    left: num('left'), top: num('top'),
    closeDelay: num('closeDelay') ?? DEFAULTS.closeDelay,
    reuse: document.getElementById('reuse').checked,
  });
  document.getElementById('status').textContent = '保存しました';
  setTimeout(() => (document.getElementById('status').textContent = ''), 1500);
});
load();
