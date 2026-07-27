/**
 * Utility functions for tracking performance metrics across data fetches and page rendering.
 */

const metrics: Record<string, number[]> = {};

export function measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    if (!metrics[name]) {
      metrics[name] = [];
    }
    metrics[name].push(duration);
    if (import.meta.env.DEV) {
      console.log(`[Perf] ${name} completed in ${duration.toFixed(2)}ms`);
    }
  });
}

export function getPerformanceMetrics(): Record<string, { count: number; avgMs: number; latestMs: number }> {
  const result: Record<string, { count: number; avgMs: number; latestMs: number }> = {};
  for (const [key, times] of Object.entries(metrics)) {
    const count = times.length;
    const total = times.reduce((a, b) => a + b, 0);
    result[key] = {
      count,
      avgMs: Math.round(total / count),
      latestMs: Math.round(times[times.length - 1] || 0),
    };
  }
  return result;
}

export function resetPerformanceMetrics() {
  for (const key of Object.keys(metrics)) {
    delete metrics[key];
  }
}
