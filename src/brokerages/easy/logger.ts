/**
 * سیستم لاگ‌گیری عملکرد برای اندازه‌گیری سرعت اجرا
 */
export class PerformanceLogger {
  private static timers: Map<string, number> = new Map();

  static start(label: string): void {
    this.timers.set(label, Date.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (startTime === undefined) {
      console.warn(`⚠️ تایمر "${label}" پیدا نشد`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    console.log(`⏱️ ${label}: ${duration}ms`);
    return duration;
  }

  static clear(): void {
    this.timers.clear();
  }
}




