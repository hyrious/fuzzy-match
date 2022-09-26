export const i_min = -Infinity;

export const max = Math.max;

export function is_upper(index: number, str: string) {
  const code = str.charCodeAt(index);
  return 65 <= code && code <= 90;
}

export function is_lower(index: number, str: string) {
  const code = str.charCodeAt(index);
  return 97 <= code && code <= 122;
}

export function is_alnum(index: number, str: string) {
  const code = str.charCodeAt(index);
  return (
    (97 <= code && code <= 122) ||
    (65 <= code && code <= 90) ||
    (48 <= code && code <= 57)
  );
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
export function compute_score(
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
