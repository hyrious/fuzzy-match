const i_min = -Infinity;

const max = Math.max;

let upper_str: string;

/**
 * Returns score if each character in pattern is found sequentially within str.
 * Returns -Infinity otherwise.
 */
export function match(pattern: string, str: string): number {
  const unmatched_letter_penalty = -1;
  const s_len = str.length;
  const p_len = pattern.length;
  let score = 100;

  if (pattern[0] === "\0") {
    return score;
  }
  if (s_len < p_len) {
    return i_min;
  }

  /* We can already penalize any unused letters. */
  score += unmatched_letter_penalty * (s_len - p_len);

  /* Perform the match. */
  upper_str = str.toUpperCase();
  score = fuzzy_match_recurse(0, p_len, 0, pattern, str, score, true);
  upper_str = "";

  return score;
}

/*
 * Recursively match the whole of pattern against str.
 * The score parameter is the score of the previously matched character.
 */
function fuzzy_match_recurse(
  p_index: number,
  p_len: number,
  s_index: number,
  pattern: string,
  str: string,
  score: number,
  first_char: boolean
): number {
  if (p_index === p_len) {
    return score;
  }

  const search = pattern[p_index];
  let match = s_index - 1;
  let best_score = i_min;

  while ((match = case_index_of(str, search, match + 1)) !== -1) {
    const sub_score = fuzzy_match_recurse(
      p_index + 1,
      p_len,
      match + 1,
      pattern,
      str,
      compute_score(match - s_index, first_char, match, str),
      false
    );
    best_score = max(best_score, sub_score);
  }

  if (best_score === i_min) {
    return i_min;
  } else {
    return score + best_score;
  }
}

/**
 * Calculate the score for a single matching letter.
 * The scoring system is taken from fts_fuzzy_match v0.2.0 by Forrest Smith,
 * which is licensed to the public domain.
 *
 * The factors affecting score are:
 *   - Bonuses:
 *     - If there are multiple adjacent matches.
 *     - If a match occurs after a separator character.
 *     - If a match is uppercase, and the previous character is lowercase.
 *
 *   - Penalties:
 *     - If there are letters before the first match.
 *     - If there are superfluous characters in str (already accounted for).
 */
function compute_score(
  jump: number,
  first_char: boolean,
  match: number,
  str: string
): number {
  const adjacency_bonus = 15;
  const separator_bonus = 30;
  const camel_bonus = 30;
  const first_letter_bonus = 15;

  const leading_letter_penalty = -5;
  const max_leading_letter_penalty = -15;

  let score = 0;

  /* Apply bonuses. */
  if (!first_char && jump === 0) {
    score += adjacency_bonus;
  }
  if (!first_char || jump > 0) {
    str.charCodeAt(match);
    if (is_upper(match, str) && is_lower(match - 1, str)) {
      score += camel_bonus;
    }
    if (is_alnum(match, str) && !is_alnum(match - 1, str)) {
      score += separator_bonus;
    }
  }
  if (first_char && jump === 0) {
    /* Match at start of string gets separator bonus. */
    score += first_letter_bonus;
  }

  /* Apply penalties. */
  if (first_char) {
    score += max(leading_letter_penalty * jump, max_leading_letter_penalty);
  }

  return score;
}

function is_upper(index: number, str: string) {
  const code = str.charCodeAt(index);
  return 65 <= code && code <= 90;
}

function is_lower(index: number, str: string) {
  const code = str.charCodeAt(index);
  return 97 <= code && code <= 122;
}

function is_alnum(index: number, str: string) {
  const code = str.charCodeAt(index);
  return (
    (97 <= code && code <= 122) ||
    (65 <= code && code <= 90) ||
    (48 <= code && code <= 57)
  );
}

function case_index_of(_str: string, char: string, start: number): number {
  return upper_str.indexOf(char.toUpperCase(), start);
}
