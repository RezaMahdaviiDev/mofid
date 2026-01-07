import { Page } from 'playwright';
import { BuyOrder } from './buyAction';
import { executeFastBuy } from './buyAction';
import { executeJSInjectBuy } from './buyActionJS';
import { executeUltraBuy } from './buyActionUltra';
import { executeAPIBuy } from './buyActionAPI';
import { executeAPIUltraBuy } from './buyActionAPIUltra';
import { logger } from '../../core/advancedLogger';

/**
 * نتایج اجرای یک مدل
 */
export interface ModelExecutionResult {
  model: number;
  modelName: string;
  duration: number;
  success: boolean;
  orderId?: string;
  error?: string;
  skipped?: boolean;
  timestamp?: number;
}

/**
 * گزینه‌های اجرای چند مدل
 */
export interface MultiModelExecutionOptions {
  stopOnFirstSuccess: boolean; // Early Stop flag
  testAll: boolean; // اگر true باشد، حتی با موفقیت اول، بقیه را هم تست می‌کند
}

/**
 * اطلاعات مدل‌ها برای اجرا
 */
interface ModelInfo {
  number: number;
  name: string;
  executor: (page: Page, order: BuyOrder, options?: any) => Promise<number>;
  options?: any;
}

/**
 * اجرای تمام مدل‌ها به ترتیب Sequential با Early Stop
 */
export async function executeAllModels(
  page: Page,
  order: BuyOrder,
  options: MultiModelExecutionOptions = { stopOnFirstSuccess: true, testAll: false }
): Promise<ModelExecutionResult[]> {
  const results: ModelExecutionResult[] = [];
  
  // ترتیب اجرا: از سریع‌ترین به کندترین
  const models: ModelInfo[] = [
    { number: 6, name: 'Model 6 (Ultra Fast API)', executor: executeAPIUltraBuy },
    { number: 5, name: 'Model 5 (API Direct)', executor: executeAPIBuy, options: { skipVerification: false } },
    { number: 4, name: 'Model 4 (UI Ultra)', executor: executeUltraBuy },
    { number: 3, name: 'Model 3 (JS Injection)', executor: executeJSInjectBuy },
    { number: 1, name: 'Model 1 (Standard)', executor: executeFastBuy },
    // Model 2 (Keyboard) را فعلاً skip می‌کنیم چون کندترین است
    // { number: 2, name: 'Model 2 (Keyboard)', executor: executeKeyboardBuy },
  ];

  // #region agent log
  try {
    const fs = require('fs');
    const path = require('path');
    const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const debugEntry = JSON.stringify({location:'multiModelExecutor:executeAllModels',message:'Starting execution',data:{order,orderSide:order.side,options,modelsCount:models.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
    fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
  } catch (e) {}
  // #endregion

  logger.info('multiModelExecutor:executeAllModels', 'Starting multi-model execution', {
    order,
    options,
    modelsCount: models.length
  });

  let firstSuccessModel: ModelExecutionResult | null = null;

  for (const modelInfo of models) {
    const modelStartTime = Date.now();
    
    // اگر Early Stop فعال است و قبلاً یک مدل موفق شده، بقیه را skip می‌کنیم
    if (options.stopOnFirstSuccess && !options.testAll && firstSuccessModel) {
      logger.info('multiModelExecutor:executeAllModels', `Skipping ${modelInfo.name} - early stop triggered`, {
        successfulModel: firstSuccessModel.modelName
      });
      
      results.push({
        model: modelInfo.number,
        modelName: modelInfo.name,
        duration: 0,
        success: false,
        skipped: true,
        timestamp: modelStartTime
      });
      continue;
    }

    logger.info('multiModelExecutor:executeAllModels', `Executing ${modelInfo.name}`, {
      model: modelInfo.number,
      order
    });

    try {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'multiModelExecutor:executeAllModels',message:'Before model execution',data:{model:modelInfo.number,modelName:modelInfo.name,orderSide:order.side,order},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      const executionStartTime = Date.now();
      const duration = await modelInfo.executor(page, order, modelInfo.options);
      const executionEndTime = Date.now();
      const actualDuration = executionEndTime - executionStartTime;

      const result: ModelExecutionResult = {
        model: modelInfo.number,
        modelName: modelInfo.name,
        duration: duration || actualDuration,
        success: true,
        timestamp: modelStartTime
      };

      // تلاش برای استخراج orderId از لاگ‌ها (اگر موجود باشد)
      // این بعداً می‌تواند بهبود یابد
      
      results.push(result);
      
      // اگر این اولین موفقیت است و Early Stop فعال است
      if (options.stopOnFirstSuccess && !firstSuccessModel) {
        firstSuccessModel = result;
        
        if (!options.testAll) {
          logger.info('multiModelExecutor:executeAllModels', `First success: ${modelInfo.name}, stopping remaining models`, {
            model: modelInfo.number,
            duration: result.duration
          });
          // بقیه مدل‌ها skip می‌شوند در iteration بعدی
        } else {
          logger.info('multiModelExecutor:executeAllModels', `First success: ${modelInfo.name}, continuing with testAll=true`, {
            model: modelInfo.number,
            duration: result.duration
          });
        }
      }

      logger.logPerformance(`multi-model-${modelInfo.number}`, duration || actualDuration, {
        order,
        model: modelInfo.number,
        modelName: modelInfo.name,
        success: true
      });

    } catch (error: any) {
      const executionEndTime = Date.now();
      const actualDuration = executionEndTime - modelStartTime;

      const result: ModelExecutionResult = {
        model: modelInfo.number,
        modelName: modelInfo.name,
        duration: actualDuration,
        success: false,
        error: error.message || 'Unknown error',
        timestamp: modelStartTime
      };

      results.push(result);

      logger.error('multiModelExecutor:executeAllModels', `Model ${modelInfo.number} failed`, error, {
        model: modelInfo.number,
        modelName: modelInfo.name,
        order
      });

      logger.logPerformance(`multi-model-${modelInfo.number}`, actualDuration, {
        order,
        model: modelInfo.number,
        modelName: modelInfo.name,
        success: false,
        error: error.message
      });
    }

    // کمی صبر بین مدل‌ها (اگر چند مدل اجرا می‌شوند)
    if (results.length < models.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // لاگ‌گیری خلاصه
  const successfulModels = results.filter(r => r.success && !r.skipped);
  const failedModels = results.filter(r => !r.success && !r.skipped);
  const skippedModels = results.filter(r => r.skipped);

  logger.info('multiModelExecutor:executeAllModels', 'Multi-model execution completed', {
    totalModels: models.length,
    successful: successfulModels.length,
    failed: failedModels.length,
    skipped: skippedModels.length,
    results: results.map(r => ({
      model: r.model,
      name: r.modelName,
      success: r.success,
      duration: r.duration,
      skipped: r.skipped
    }))
  });

  return results;
}

/**
 * پیدا کردن بهترین مدل (سریع‌ترین مدل موفق)
 */
export function getBestModel(results: ModelExecutionResult[]): ModelExecutionResult | null {
  const successfulResults = results.filter(r => r.success && !r.skipped);
  
  if (successfulResults.length === 0) {
    return null;
  }

  return successfulResults.reduce((best, current) => {
    return current.duration < best.duration ? current : best;
  });
}

