import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Serve static files from dist
const publicPath = path.join(__dirname, 'public');

// Serve static files
app.use(express.static(publicPath));
app.use(express.json());

// API Routes
import { buyRoute } from './routes/buy';
import { loginRoute } from './routes/login';

app.use('/api/buy', buyRoute);
app.use('/api/login', loginRoute);

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 داشبورد در حال اجرا است: http://localhost:${PORT}`);
});

