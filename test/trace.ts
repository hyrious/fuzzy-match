import { match_trace } from "../src/trace";

function test(pattern: string, str: string) {
  const match = match_trace(pattern, str);
  if (match) {
    const parts: { bold?: true; text: string }[] = [];
    let last = 0;
    match.stops.forEach((i) => {
      if (last < i) {
        parts.push({ text: str.slice(last, i) });
      }
      parts.push({ bold: true, text: str[i] });
      last = i + 1;
    });
    if (last < str.length) {
      parts.push({ text: str.slice(last) });
    }

    let output = "";
    parts.forEach(({ text, bold }) => {
      if (bold) {
        output += "\x1b[1m";
      }
      output += text;
      if (bold) {
        output += "\x1b[22m";
      }
    });
    console.log(match.score, output);
  }
}

test("th", "tth-hash");
