import fs from 'fs';
import path from 'path';

export interface PerformanceMetric {
  testId: string;
  scenario: string;
  duration: number;
  threshold: number;
  passed: boolean;
  timestamp: string;
  networkCondition?: string;
}

export class PerformanceCollector {
  private metrics: PerformanceMetric[] = [];

  record(
    testId: string,
    scenario: string,
    duration: number,
    threshold: number,
    networkCondition?: string
  ) {
    this.metrics.push({
      testId,
      scenario,
      duration: Math.round(duration),
      threshold,
      passed: duration <= threshold,
      timestamp: new Date().toISOString(),
      networkCondition,
    });
  }

  generateReport(): string {
    const passed = this.metrics.filter((m) => m.passed).length;
    const total = this.metrics.length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

    let report = `# Authentication Performance Test Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Pass Rate:** ${passed}/${total} (${passRate}%)\n\n`;

    report += `## Summary\n\n`;
    report += `| Test ID | Scenario | Duration | Threshold | Status |\n`;
    report += `|---------|----------|----------|-----------|--------|\n`;

    for (const metric of this.metrics) {
      const status = metric.passed ? '✅ PASS' : '❌ FAIL';
      const network = metric.networkCondition ? ` (${metric.networkCondition})` : '';
      report += `| ${metric.testId} | ${metric.scenario}${network} | ${metric.duration}ms | ${metric.threshold}ms | ${status} |\n`;
    }

    if (this.metrics.length > 0) {
      report += `\n## Performance Distribution\n\n`;
      const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);
      const p50 = durations[Math.floor(durations.length * 0.5)];
      const p95 = durations[Math.floor(durations.length * 0.95)];
      const p99 = durations[Math.floor(durations.length * 0.99)];

      report += `- **P50:** ${p50}ms\n`;
      report += `- **P95:** ${p95}ms\n`;
      report += `- **P99:** ${p99}ms\n`;
      report += `- **Min:** ${Math.min(...durations)}ms\n`;
      report += `- **Max:** ${Math.max(...durations)}ms\n`;
    }

    return report;
  }

  save(filename: string = 'ui-performance-report.md') {
    const reportPath = path.join(process.cwd(), 'test-results', filename);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, this.generateReport());
    console.log(`📊 Performance report saved: ${reportPath}`);
  }
}
