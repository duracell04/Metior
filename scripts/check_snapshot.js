const path = require("node:path");
const fs = require("node:fs");

const KAPPA = 1e-6;
const SNAPSHOT_PATH = path.join(__dirname, "..", "src", "data", "weights_2025-10-08.json");

function loadSnapshot() {
  const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
  return JSON.parse(raw);
}

function checkSnapshot(snapshot) {
  const sumWeights = snapshot.weights.reduce((acc, w) => acc + w.w, 0);
  const sumCaps = snapshot.weights.reduce((acc, w) => acc + w.mc_usd, 0);
  const impliedPrice = KAPPA * sumCaps;

  const weightError = Math.abs(sumWeights - 1);
  const priceError = Math.abs(impliedPrice - snapshot.meo_usd) / snapshot.meo_usd;
  const capError = Math.abs(sumCaps - snapshot.m_world_usd) / snapshot.m_world_usd;

  const issues = [];
  if (weightError > 1e-12) {
    issues.push(`weights do not sum to 1 (error ${weightError})`);
  }
  if (capError > 1e-9) {
    issues.push(`m_world_usd mismatch: sumCaps=${sumCaps}, expected=${snapshot.m_world_usd}`);
  }
  if (priceError > 1e-9) {
    issues.push(`meo_usd mismatch: implied=${impliedPrice}, expected=${snapshot.meo_usd}`);
  }

  return { sumWeights, sumCaps, impliedPrice, issues };
}

function main() {
  const snapshot = loadSnapshot();
  const { sumWeights, sumCaps, impliedPrice, issues } = checkSnapshot(snapshot);

  console.log("Snapshot:", snapshot.date);
  console.log("Sum weights:", sumWeights.toFixed(12));
  console.log("Sum caps (USD):", sumCaps.toLocaleString("en-US"));
  console.log("Snapshot m_world_usd:", snapshot.m_world_usd.toLocaleString("en-US"));
  console.log("Implied MEo price (USD):", Math.round(impliedPrice).toLocaleString("en-US"));
  console.log("Snapshot meo_usd:", snapshot.meo_usd.toLocaleString("en-US"));

  if (issues.length === 0) {
    console.log("Status: PASS (weights sum to 1, kappa * sumCaps matches meo_usd, caps match m_world_usd)");
  } else {
    console.error("Status: FAIL");
    issues.forEach(issue => console.error("- " + issue));
    process.exitCode = 1;
  }
}

main();
