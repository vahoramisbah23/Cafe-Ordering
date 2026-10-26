import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Category from './models/Category.js';
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB and seed default categories & users
connectDB().then(async () => {
  try {
    const DEFAULT_CATEGORIES = [
      'Coffee & Hot Drinks',
      'Coolers & Refreshers',
      'Quick Bites',
      'Sandwiches & Burgers',
      'Pasta & Maggi',
      'Desserts',
    ];
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES.map((name) => ({ name })));
      console.log('[Café Server] Seeded default categories into DB');
    }

    // Seed default Admin user
    const adminExists = await User.findOne({ email: 'admin@cafepoint.in' });
    if (!adminExists) {
      const admin = new User({
        name: 'Café Point Admin',
        email: 'admin@cafepoint.in',
        phone: '9898816709',
        role: 'admin',
      });
      admin.setPassword('admin123');
      await admin.save();
      console.log('[Café Server] Seeded default Admin user (admin@cafepoint.in / admin123)');
    }

    // Seed sample Customer user
    let customer = await User.findOne({ email: 'customer@cafepoint.in' });
    if (!customer) {
      customer = new User({
        name: 'Café Customer',
        email: 'customer@cafepoint.in',
        phone: '9898816709',
        role: 'customer',
      });
      customer.setPassword('customer123');
      await customer.save();
      console.log('[Café Server] Seeded default Customer user (customer@cafepoint.in / customer123)');
    } else if (customer.name === 'Rahul Sharma') {
      customer.name = 'Café Customer';
      await customer.save();
      console.log('[Café Server] Updated default Customer name from Rahul Sharma to Café Customer');
    }
  } catch (err) {
    console.error('[Café Server Seeding Error]:', err.message);
  }
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ignore favicon requests or return 204
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Café Ordering API is operational',
    currency: 'INR (₹)',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallback root endpoint
  app.get('/', (req, res) => {
    res.send({
      message: 'Welcome to the MERN Café Ordering API',
      endpoints: {
        menu: '/api/menu',
        menuCategories: '/api/menu/categories',
        orders: '/api/orders',
        health: '/api/health',
      },
    });
  });
}

// 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Café Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} is already in use.`);
  } else {
    console.error('[Server Error]', err);
  }
});
