import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import { pricingRouter, reorderRouter } from './routes/suggestionRoutes.js';
import engineRoutes from './routes/engineRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import { commerceEngine } from './engine/commerceEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Mount API routes with both /api/ and direct prefixes for full specification compliance
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/pricing-suggestions', pricingRouter);
app.use('/pricing-suggestions', pricingRouter);

app.use('/api/reorder-suggestions', reorderRouter);
app.use('/reorder-suggestions', reorderRouter);

app.use('/api/engine', engineRoutes);
app.use('/engine', engineRoutes);

app.use('/api/seed', seedRoutes);
app.use('/seed', seedRoutes);

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Stockpulse Reactive Commerce Advisor',
    strategy: commerceEngine.getActiveStrategy(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Stockpulse Reactive Commerce Advisor',
    strategy: commerceEngine.getActiveStrategy(),
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    await commerceEngine.initialize();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Stockpulse Reactive Commerce Advisor Server`);
      console.log(`🌐 Running on http://localhost:${PORT}`);
      console.log(`🤖 Active Strategy: ${commerceEngine.getActiveStrategy()}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
