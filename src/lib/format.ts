export const fmtPct = (x: number, dp = 2) =>
  `${(Math.round(x * 100 * 10 ** dp) / 10 ** dp).toFixed(dp)}%`;
