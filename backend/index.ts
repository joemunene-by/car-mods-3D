import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/authRoutes';
import carsRoutes from './routes/carsRoutes';
import configurationsRoutes from './routes/configurationsRoutes';
import customizationsRoutes from './routes/customizationsRoutes';
import usersRoutes from './routes/usersRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Car Mods 3D API is running',
    timestamp: new Date().toISOString(),
  });
});

// Basic route
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Car Mods 3D API',
    version: process.env.API_VERSION || 'v1',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/customizations', customizationsRoutes);
app.use('/api/configurations', configurationsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
