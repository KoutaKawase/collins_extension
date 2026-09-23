const input = document.getElementById('word');
const button = document.getElementById('search');

function search() {
  const word = input.value.trim();
  if (!word) return;
  chrome.runtime.sendMessage({ type: 'OPEN_DICT', word });
  window.close();
}

button.addEventListener('click', search);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') search();
});
