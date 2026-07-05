// ============================================================
// EXPRESS API SERVER — LuxeCart Platform
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { authRouter } from './routes/auth';
import { productRouter } from './routes/products';
import { categoryRouter } from './routes/categories';
import { orderRouter } from './routes/orders';
import { cartRouter } from './routes/cart';
import { wishlistRouter } from './routes/wishlist';
import { bannerRouter } from './routes/banners';
import { settingsRouter } from './routes/settings';
import { reviewRouter } from './routes/reviews';
import { couponRouter } from './routes/coupons';
import { dashboardRouter } from './routes/dashboard';
import { customerRouter } from './routes/customers';
import { uploadRouter } from './routes/upload';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.API_PORT || 4000;

// ── Middleware ───────────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (local dev only — production uses Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customerRouter);
app.use('/api/upload', uploadRouter);

// ── Error Handler ───────────────────────────────────────────

app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 LuxeCart API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
