/* utils/gamification.js */
export const xpForLevel = L => 100 * Math.pow(L, 1.5);

export const cumulativeXpToLevel = L => {
  let sum = 0;
  for (let i = 1; i < L; i++) sum += xpForLevel(i);
  return sum;          // XP required to *start* level L
};

export function getGamificationProgress(totalXp) {
  let level = 1;
  let startXp = 0;

  // find current level
  while (totalXp >= startXp + xpForLevel(level)) {
    startXp += xpForLevel(level);
    level++;
  }

  const intoLevel   = totalXp - startXp;   // XP earned *inside* current level
  const threshold   = xpForLevel(level);   // XP needed to finish this level
  const percent     = Math.min(100, (intoLevel / threshold) * 100);

  return { level, intoLevel, threshold, percent };
}
