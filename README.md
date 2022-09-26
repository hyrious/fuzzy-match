## @hyrious/fuzzy-match

> A string match function that help implementing fuzzy search like Sublime Text.

The algorithm is derived from [this C implementation of fts_fuzzy_match](https://github.com/tajmone/fuzzy-search/tree/master/fts_fuzzy_match/0.2.0/c).

## Install

```
npm add @hyrious/fuzzy-match
```

## Usage

```js
import { match, match_trace } from "@hyrious/fuzzy-match";

match("th", "tth-hash");
// => 45 (score, maybe negative)

match("not found", "string");
// => -Infinity

// Match with backtrack, useful when we want to highlight the matching chars.
match_trace("th", "tth-hash");
// => { score: 45, stops: [0, 4] }

match_trace("not found", "string");
// => null
```

### Possible Fuzzy Search Implementation

```js
import { match } from "@hyrious/fuzzy-match";

function search(text, list) {
  return list
    .map((item) => ({
      item,
      score: match(text, item),
    }))
    .filter(({ score }) => score > -Infinity)
    .sort((a, b) => b.score - a.score);
}
```

## License

MIT @ [hyrious](https://github.com/hyrious)
