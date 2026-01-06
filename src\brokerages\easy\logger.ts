/**
 * ماژول ثبت عملکرد و زمان‌بندی
 */
export class PerformanceLogger {
  private static marks: Map<string, number> = new Map();

  static start(label: string) {
    this.marks.set(label, Date.now());
    console.log(`⏱️  شروع: ${label}...`);
  }

  static end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    console.log(`✅ پایان: ${label} | زمان: ${duration}ms`);
    return duration;
  }
}

