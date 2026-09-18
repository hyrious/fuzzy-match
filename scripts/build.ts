/// <reference types="node" />
import fs from "node:fs";
import spawn from "nano-spawn";
import * as rollup from "rollup";
import * as esbuild from "esbuild";
import prettyBytes from "pretty-bytes";

fs.rmSync("dist", { recursive: true, force: true });

const esbuildPlugin: rollup.Plugin = {
  name: "esbuild",
  async load(id) {
    const { outputFiles } = await esbuild.build({
      entryPoints: [id],
      bundle: true,
      format: "esm",
      outfile: id.replace(/\.ts$/, ".js"),
      write: false,
      target: ["node14.18", "node16"],
      platform: "node",
      sourcemap: true,
      sourcesContent: false,
    });
    let code!: string, map!: string;
    for (const { path, text } of outputFiles) {
      if (path.endsWith(".map")) map = text;
      else code = text;
    }
    return { code, map };
  },
};

let start = Date.now();
const bundle = await rollup.rollup({
  input: "src/index.ts",
  plugins: [esbuildPlugin],
});

const esm = bundle.write({
  file: "dist/index.mjs",
  format: "esm",
  sourcemap: true,
  sourcemapExcludeSources: true,
});

const cjs = bundle.write({
  file: "dist/index.js",
  format: "cjs",
  sourcemap: true,
  sourcemapExcludeSources: true,
});

const esmOutput = await esm;
const cjsOutput = await cjs;
await bundle.close();
console.log("Built dist/index.{js,mjs} in", Date.now() - start, "ms");

const print = (banner: string, output: rollup.RollupOutput) => {
  console.log(`  ${banner}: ${prettyBytes(output.output[0].code.length)}`);
};
print("esm", esmOutput);
print("cjs", cjsOutput);

start = Date.now();
await spawn("npx", ["@hyrious/dts", "-o", "dist/index.d.ts"]);
fs.cpSync("dist/index.d.ts", "dist/index.d.mts");
console.log("Built dist/index.d.ts in", Date.now() - start, "ms");
