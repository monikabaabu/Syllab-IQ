/**
 * Merge LeetCode + Codeforces calendar maps
 * Output format: YYYY-MM-DD (Codeforces style)
 *
 * LeetCode input format:
 * {
 *   "1759795200": 2,
 *   "1759968000": 1
 * }
 *
 * Codeforces input format:
 * {
 *   "2025-12-19": 3,
 *   "2025-12-17": 1
 * }
 *
 * Output:
 * {
 *   "2025-12-19": 5,
 *   "2025-12-17": 1
 * }
 */
const mergeCalendarsToDateFormat = (
  leetcodeCalendar = {},
  codeforcesCalendar = {}
) => {
  const merged = {};

  // -----------------------------
  // 1. Convert LeetCode timestamps → YYYY-MM-DD
  // -----------------------------
  for (let ts in leetcodeCalendar) {
    const count = leetcodeCalendar[ts];

    // Convert seconds → milliseconds
    const dateStr = new Date(Number(ts) * 1000)
      .toISOString()
      .split("T")[0];

    merged[dateStr] = (merged[dateStr] || 0) + count;
  }

  // -----------------------------
  // 2. Merge Codeforces calendar directly
  // -----------------------------
  for (let date in codeforcesCalendar) {
    const count = codeforcesCalendar[date];

    merged[date] = (merged[date] || 0) + count;
  }

  // -----------------------------
  // 3. Sort by date ascending
  // -----------------------------
  return Object.fromEntries(
    Object.entries(merged).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    )
  );
};

module.exports = { mergeCalendarsToDateFormat };
