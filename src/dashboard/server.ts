import express from 'express';
import path from 'path';
import * as fs from 'fs';

const app = express();
const PORT = 3002;

// Log file path
const LOG_PATH = path.join(process.cwd(), '.cursor', 'debug.log');

// #region agent log
try {
  const logEntry = JSON.stringify({location:'server.ts:12',message:'Server startup initiated',data:{port:PORT,pid:process.pid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
  fs.appendFileSync(LOG_PATH, logEntry, 'utf8');
} catch (e) {}
// #endregion

// Serve static files from dist
const publicPath = path.join(__dirname, 'public');

// Serve static files
app.use(express.static(publicPath));
app.use(express.json());

// API Routes
import { buyRoute } from './routes/buy';
import { loginRoute } from './routes/login';
import { logsRoute } from './routes/logs';

app.use('/api/buy', buyRoute);
app.use('/api/login', loginRoute);
app.use('/api/logs', logsRoute);

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// #region agent log
try {
  const logEntry = JSON.stringify({location:'server.ts:40',message:'Attempting to listen on port',data:{port:PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
  fs.appendFileSync(LOG_PATH, logEntry, 'utf8');
} catch (e) {}
// #endregion

const server = app.listen(PORT, () => {
  // #region agent log
  try {
    const addr = server.address();
    const logEntry = JSON.stringify({location:'server.ts:49',message:'Server successfully started',data:{port:PORT,address:addr ? JSON.stringify(addr) : 'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
    fs.appendFileSync(LOG_PATH, logEntry, 'utf8');
  } catch (e) {}
  // #endregion
  console.log(`🚀 داشبورد در حال اجرا است: http://localhost:${PORT}`);
});

// Error handling for port conflicts
server.on('error', (error: any) => {
  // #region agent log
  try {
    const logEntry = JSON.stringify({location:'server.ts:error',message:'Server listen error occurred',data:{errorCode:error.code,errorMessage:error.message,port:PORT,errno:error.errno,syscall:error.syscall},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
    fs.appendFileSync(LOG_PATH, logEntry, 'utf8');
  } catch (e) {}
  // #endregion
  
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ پورت ${PORT} در حال استفاده است. لطفاً برنامه‌ای که از این پورت استفاده می‌کند را متوقف کنید.`);
    console.error(`   یا دستور زیر را اجرا کنید: netstat -ano | findstr :${PORT}`);
    process.exit(1);
  } else {
    // #region agent log
    try {
      const logEntry = JSON.stringify({location:'server.ts:error',message:'Unknown server error',data:{errorCode:error.code,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
      fs.appendFileSync(LOG_PATH, logEntry, 'utf8');
    } catch (e) {}
    // #endregion
    console.error('❌ خطا در راه‌اندازی سرور:', error);
    process.exit(1);
  }
});

