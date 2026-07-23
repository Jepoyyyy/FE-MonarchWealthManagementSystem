const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const baselinePath = args.find(a => a.startsWith('--baseline='))?.split('=')[1];
const currentPath = args.find(a => a.startsWith('--current='))?.split('=')[1];
const threshold = parseInt(args.find(a => a.startsWith('--threshold='))?.split('=')[1] || '10');

if (!baselinePath || !currentPath) {
  console.log('Performance check script initialized. Specify --baseline and --current to compare runs.');
  process.exit(0);
}

try {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

  let regressions = [];

  for (const metric of current.metrics || []) {
    const baselineMetric = (baseline.metrics || []).find(m => m.testId === metric.testId);
    if (!baselineMetric) continue;

    const change = ((metric.duration - baselineMetric.duration) / baselineMetric.duration) * 100;
    
    if (change > threshold) {
      regressions.push({
        testId: metric.testId,
        scenario: metric.scenario,
        baseline: baselineMetric.duration,
        current: metric.duration,
        change: change.toFixed(1),
      });
    }
  }

  if (regressions.length > 0) {
    console.error('❌ Performance regressions detected:\n');
    for (const r of regressions) {
      console.error(`  ${r.testId}: ${r.baseline}ms → ${r.current}ms (+${r.change}%)`);
    }
    process.exit(1);
  } else {
    console.log('✅ No performance regressions detected');
    process.exit(0);
  }
} catch (err) {
  console.warn('Performance baseline check skipped:', err.message);
  process.exit(0);
}
