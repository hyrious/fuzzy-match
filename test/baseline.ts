import * as assert from "assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { get } from "https";
import { match } from "../src/match";

let lines: string[];
let expected: string[];
let results: string[];

async function fetch(url: string): Promise<string> {
  const cache_dir = "node_modules/.cache";
  const cache_file = cache_dir + url.slice(url.lastIndexOf("/"));
  if (existsSync(cache_file)) {
    return readFileSync(cache_file, "utf8");
  }
  mkdirSync(cache_dir, { recursive: true });
  const text = await new Promise<string>((resolve) => {
    get(url, async (r) => {
      const cs: Buffer[] = [];
      for await (const c of r) cs.push(c);
      resolve(Buffer.concat(cs).toString());
    });
  });
  writeFileSync(cache_file, text);
  return text;
}

{
  const dataset =
    "https://cdn.jsdelivr.net/gh/" +
    "tajmone/fuzzy-search/dataset/ue4_filenames.txt";

  lines = (await fetch(dataset)).trimEnd().split(/\r?\n/);
}

{
  const url =
    "https://cdn.jsdelivr.net/gh/" +
    "tajmone/fuzzy-search/fts_fuzzy_match/0.2.0/expected_results.txt";

  expected = (await fetch(url)).trimEnd().split(/\r?\n/);
}

{
  results = [];
  const MAX_MATCH = 100;
  const PATTERN = "LLL";
  let matches = 0;
  for (const line of lines) {
    const score = match(PATTERN, line);
    if (score !== -Infinity) {
      results.push(`${score}|${line}`);
      matches++;
      if (matches === MAX_MATCH) {
        break;
      }
    }
  }
}

{
  assert.equal(results.length, expected.length);
  for (let i = 0; i < results.length; ++i) {
    assert.equal(results[i], expected[i]);
  }

  console.log("All tests passed!");
}
