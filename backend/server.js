require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/inventorySocket');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

initSocket(io);

// Connect to MongoDB then start HTTP server
const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📡 Socket.io ready for real-time connections`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  });
};

// Graceful shutdown
const shutdown = (signal) => {
  logger.warn(`${signal} received — shutting down gracefully`);
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

startServer();
