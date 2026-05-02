const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.io and attach event handlers.
 * Call this once from server.js after creating the http server.
 *
 * @param {import('socket.io').Server} socketIO
 */
const initSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} — total: ${io.engine.clientsCount}`);

    // Client can join a named room (e.g., per-location in multi-branch setups)
    socket.on('join:room', (room) => {
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error on ${socket.id}: ${err.message}`);
    });
  });

  logger.info('Socket.io initialized');
};

/**
 * Get the active Socket.io instance.
 * Throws if called before initSocket().
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket() first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
