import { compute_score, i_min, max } from "./common";

/**
 * Returns score if each character in pattern is found sequentially within str.
 * Returns -Infinity otherwise.
 */
export function match(pattern: string, str: string): number {
  const unmatched_letter_penalty = -1;
  const s_len = str.length;
  const p_len = pattern.length;
  let score = 100;

  if (p_len === 0) {
    return score;
  }
  if (s_len < p_len) {
    return i_min;
  }

  /* We can already penalize any unused letters. */
  score += unmatched_letter_penalty * (s_len - p_len);

  /* Perform the match. */
  score = match_recurse(
    0,
    p_len,
    0,
    pattern,
    str,
    str.toUpperCase(),
    score,
    true
  );

  return score;
}

/*
 * Recursively match the whole of pattern against str.
 * The score parameter is the score of the previously matched character.
 */
function match_recurse(
  p_index: number,
  p_len: number,
  s_index: number,
  pattern: string,
  str: string,
  upper_str: string,
  score: number,
  first_char: boolean
): number {
  if (p_index === p_len) {
    return score;
  }

  let match = s_index - 1;
  let best_score = i_min;

  const search = pattern[p_index].toUpperCase();
  while ((match = upper_str.indexOf(search, match + 1)) !== -1) {
    const sub_score = match_recurse(
      p_index + 1,
      p_len,
      match + 1,
      pattern,
      str,
      upper_str,
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
