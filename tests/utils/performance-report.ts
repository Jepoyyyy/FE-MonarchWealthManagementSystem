interface PerformanceMetric {
  endpoint: string;
  duration: number;
  threshold: number;
  passed: boolean;
  timestamp: string;
}

export class PerformanceReporter {
  private metrics: PerformanceMetric[] = [];

  recordMetric(endpoint: string, duration: number, threshold: number) {
    this.metrics.push({
      endpoint,
      duration,
      threshold,
      passed: duration < threshold,
      timestamp: new Date().toISOString(),
    });
  }

  generateReport(): string {
    const report = ['# Authentication Performance Report\n'];
    report.push(`Generated: ${new Date().toISOString()}\n`);
    report.push('## Metrics Summary\n');
    report.push('| Endpoint | Duration (ms) | Threshold (ms) | Status |');
    report.push('|----------|---------------|----------------|--------|');

    for (const metric of this.metrics) {
      const status = metric.passed ? '✅ PASS' : '❌ FAIL';
      report.push(
        `| ${metric.endpoint} | ${metric.duration} | ${metric.threshold} | ${status} |`
      );
    }

    const avgDuration =
      this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length;
    const passRate =
      (this.metrics.filter(m => m.passed).length / this.metrics.length) * 100;

    report.push(`\n## Statistics`);
    report.push(`- Average Response Time: ${avgDuration.toFixed(2)}ms`);
    report.push(`- Pass Rate: ${passRate.toFixed(1)}%`);
    report.push(`- Total Tests: ${this.metrics.length}`);

    return report.join('\n');
  }
}
