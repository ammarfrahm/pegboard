export const BIGINT_TAG = '@@BIGINT@@';

/** Wrap integers exceeding Number.MAX_SAFE_INTEGER as tagged strings before JSON.parse */
export function wrapBigInts(json: string): string {
  return json.replace(
    /"(?:[^"\\]|\\.)*"|\b(\d{16,})\b/g,
    (match, num) => {
      if (!num) return match;
      if (Number.isSafeInteger(Number(num))) return match;
      return `"${BIGINT_TAG}${num}"`;
    },
  );
}

/** Restore tagged big integers to bare numbers in formatted JSON output */
export function unwrapBigInts(json: string): string {
  return json.replace(new RegExp(`"${BIGINT_TAG}(\\d+)"`, 'g'), '$1');
}

/** Check if a value is a tagged big integer, return the original number string or null */
export function parseBigIntTag(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith(BIGINT_TAG)) {
    return value.slice(BIGINT_TAG.length);
  }
  return null;
}
