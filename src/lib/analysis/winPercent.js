export const WIN_PERCENT_MULTIPLIER = -0.00368208;

export function cpToWinPercent(cp, mateIn = null) {
  if (mateIn !== null && mateIn !== undefined) {
    if (mateIn > 0) return Math.max(99.0, 100.0 - mateIn * 0.1);
    return Math.min(1.0, Math.abs(mateIn) * 0.1);
  }

  if (cp === null || cp === undefined) return 50.0;

  const winPercent =
    50 + 50 * (2 / (1 + Math.exp(WIN_PERCENT_MULTIPLIER * cp)) - 1);
  return Math.max(0, Math.min(100, winPercent));
}

export function winPercentLoss(before, after) {
  return Math.max(0, before - after);
}

export function moveAccuracy(winPercentLossValue) {
  const accuracy =
    103.1668 * Math.exp(-0.04354 * winPercentLossValue) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}
