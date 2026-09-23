const input = document.getElementById("word") as HTMLInputElement | null;
const button = document.getElementById("search") as HTMLButtonElement | null;

function search(): void {
  const word = input?.value.trim() ?? "";
  if (!word) return;
  try {
    chrome?.runtime?.sendMessage({ type: "OPEN_DICT", word });
  } catch (err) {
    console.warn("Collins: OPEN_DICT failed", err);
  }
  window.close();
}

button?.addEventListener("click", search);
input?.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") search();
});
