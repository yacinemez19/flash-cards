const MIN_CARDS = 5;
const MAX_CARDS_FACTOR = 20;

export function computeXp(score: number, total: number): number {
	if (total < MIN_CARDS) return 0;
	const accuracy = score / total;
	const sizeFactor = Math.min(total, MAX_CARDS_FACTOR) / MAX_CARDS_FACTOR;
	const accuracyWeight = Math.pow(accuracy, 1.5);
	return Math.round(100 * sizeFactor * accuracyWeight);
}

export function xpProgress(totalXp: number): {
	level: number;
	xpIntoLevel: number;
	xpNeeded: number;
	progressPct: number;
} {
	const level = Math.floor(Math.sqrt(totalXp / 100));
	const xpStart = 100 * level * level;
	const xpNext = 100 * (level + 1) * (level + 1);
	const xpIntoLevel = totalXp - xpStart;
	const xpNeeded = xpNext - xpStart;
	return { level, xpIntoLevel, xpNeeded, progressPct: xpIntoLevel / xpNeeded };
}
