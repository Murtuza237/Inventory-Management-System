const Notification = require('../models/Notification');
const { getIO } = require('../sockets/inventorySocket');
const logger = require('../utils/logger');

/**
 * Create a notification and emit it via Socket.io.
 */
const createNotification = async ({ type, title, message, product, location }) => {
  const notification = await Notification.create({ type, title, message, product, location });

  try {
    const io = getIO();
    io.emit('notification:new', notification);
  } catch (e) {
    // Socket.io may not be initialized in scripts
    logger.warn(`Socket emit skipped: ${e.message}`);
  }

  logger.info(`Notification created: [${type}] ${title}`);
  return notification;
};

/**
 * Get paginated notifications.
 */
const getNotifications = async ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = {};
  if (unreadOnly) filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate('product', 'name rfid')
      .populate('location', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({ isRead: false });

  return { notifications, total, unreadCount, page: Number(page), limit: Number(limit) };
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (id) => {
  const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  return notification;
};

/**
 * Mark all notifications as read.
 */
const markAllAsRead = async () => {
  const result = await Notification.updateMany({ isRead: false }, { isRead: true });
  return { modified: result.modifiedCount };
};

module.exports = { createNotification, getNotifications, markAsRead, markAllAsRead };
