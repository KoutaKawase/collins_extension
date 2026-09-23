import { DEFAULTS, type ExtensionOptions } from "./shared/messages";

type OptionKey = "width" | "height" | "left" | "top";

function getInput(id: string): HTMLInputElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) throw new Error(`Missing input: ${id}`);
  return el;
}

function getButton(id: string): HTMLButtonElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLButtonElement)) throw new Error(`Missing button: ${id}`);
  return el;
}

async function load(): Promise<void> {
  const stored = await chrome.storage.sync.get(DEFAULTS as unknown as { [key: string]: unknown });
  const s: ExtensionOptions = { ...DEFAULTS, ...(stored as Partial<ExtensionOptions>) };
  for (const k of ["width", "height", "left", "top"] as const satisfies readonly OptionKey[]) {
    getInput(k).value = s[k] === null ? "" : String(s[k]);
  }
  getInput("reuse").checked = s.reuse;
}

getButton("save").addEventListener("click", async () => {
  const num = (id: string): number | null => {
    const v = getInput(id).value;
    return v === "" ? null : Number(v);
  };
  await chrome.storage.sync.set({
    width: num("width") ?? DEFAULTS.width,
    height: num("height") ?? DEFAULTS.height,
    left: num("left"),
    top: num("top"),
    reuse: getInput("reuse").checked,
  } satisfies Record<string, number | boolean | null>);
  const status = document.getElementById("status");
  if (status) {
    status.textContent = "保存しました";
    setTimeout(() => (status.textContent = ""), 1500);
  }
});

void load();
