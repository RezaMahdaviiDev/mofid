import { Router, Request, Response } from 'express';
import { readRecentLogs, getLogStats, LogReaderOptions } from '../../utils/logReader';

export const logsRoute = Router();

/**
 * GET /api/logs
 * دریافت آخرین لاگ‌ها
 * Query parameters:
 *   - limit: تعداد لاگ‌ها (default: 50)
 *   - types: انواع لاگ‌ها (comma-separated: buy,info,warn,error,performance)
 */
logsRoute.get('/', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const typesParam = req.query.types as string;
    
    const types: string[] = typesParam 
      ? typesParam.split(',').map(t => t.trim())
      : ['buy', 'info', 'warn', 'error', 'performance'];

    const options: LogReaderOptions = {
      limit: Math.min(limit, 100), // حداکثر 100 لاگ
      types: types
    };

    const logs = readRecentLogs(options);
    const stats = getLogStats();

    res.json({
      success: true,
      logs: logs,
      stats: stats,
      count: logs.length,
      limit: options.limit,
      types: types
    });
  } catch (error: any) {
    console.error('❌ خطا در خواندن لاگ‌ها:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'خطا در خواندن لاگ‌ها'
    });
  }
});

/**
 * GET /api/logs/stats
 * دریافت آمار کلی لاگ‌ها
 */
logsRoute.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = getLogStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error: any) {
    console.error('❌ خطا در خواندن آمار لاگ‌ها:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'خطا در خواندن آمار لاگ‌ها'
    });
  }
});



