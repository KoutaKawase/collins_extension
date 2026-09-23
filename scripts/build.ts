import { $ } from "bun";

const entries = [
  "src/background.ts",
  "src/content.ts",
  "src/dict-close.ts",
  "src/popup.ts",
  "src/options.ts",
];

await $`rm -rf dist && mkdir -p dist`;
await Bun.build({
  entrypoints: entries,
  outdir: "dist",
  target: "browser",
  format: "iife",
  minify: false,
});

const manifest = await Bun.file("manifest.json").json();
await Bun.write("dist/manifest.json", JSON.stringify(manifest, null, 2));

for (const f of ["popup.html", "options.html", "content.css"]) {
  await Bun.write(`dist/${f}`, Bun.file(f));
}

const icons = ["icon16.png", "icon48.png", "icon128.png"];
await $`mkdir -p dist/icons`;
for (const icon of icons) {
  const src = Bun.file(`icons/${icon}`);
  if (await src.exists()) await Bun.write(`dist/icons/${icon}`, src);
}

console.log("build ok");
