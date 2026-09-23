# Collins Hover Dictionary (Chrome Extension)

Select English words to look up definitions in Collins dictionary via a hover popup window.

## Dev setup (Bun + TypeScript)

```bash
bun install
bun run typecheck   # tsc --noEmit
bun run build       # emits to dist/
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions`).
`dist/` is gitignored; sources live in `src/*.ts`.

## Spec (current)

- Close hover window on: outside click (parent page), × button in dict popup,
  focus lost (`windows.onFocusChanged`), tab switch (`tabs.onActivated`).
- Do NOT close on: mouse-leave, scroll/link inside dict popup.
- `CLOSE_DICT` (from parent pages) closes only the tracked dict window, never the sender.
- `CLOSE_SELF` (from dict popup close button) falls back to sender window
  only if the sender URL is a Collins dict page (survives SW restart).
- Options page: width/height/left/top/reuse (no closeDelay).

## Resume info

- Last verified: hover opens via 📖/popup, closes via outside-click/×/focus-lost/tab-switch (dict only), options save works.
- Toolchain: Bun 1.3.7, TS 5.9.3 strict + `noUncheckedIndexedAccess`, `@types/chrome`.
