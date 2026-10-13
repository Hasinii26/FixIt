const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration supporting Vercel deployment and local dev
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean)
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Render internal probes, health checks)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow local development and Vercel preview/production domains
      if (
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'FixIt API is operational.',
    health: '/api/health',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);

// Detailed Health check endpoint for Render / monitoring
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [result] = await pool.query('SELECT 1 AS alive');
    if (result && result[0] && result[0].alive === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    service: 'FixIt Complaint and Maintenance Management API',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server with error handling, explicitly binding to 0.0.0.0 for Render
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log('========================================================');
  console.log(`🚀 FixIt Backend Server running on port http://0.0.0.0:${PORT}`);
  console.log('========================================================');
  await testConnection();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [Server Error] Port ${PORT} is already in use.`);
    console.error(`A FixIt server instance is already running on port ${PORT}, or another application is using it.`);
    console.error(`You can change PORT in backend/.env or stop the existing process.\n`);
    process.exit(1);
  } else {
    console.error('\n❌ [Server Fatal Error]:', err.message);
    process.exit(1);
  }
});

// Graceful termination
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Port released. Goodbye!');
    process.exit(0);
  });
});
