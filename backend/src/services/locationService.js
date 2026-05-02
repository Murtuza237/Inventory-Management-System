const Location = require('../models/Location');
const logger = require('../utils/logger');

const getAllLocations = async () => {
  return Location.find({ isActive: true }).sort({ name: 1 });
};

const getLocationById = async (id) => {
  const location = await Location.findById(id);
  if (!location) {
    const err = new Error('Location not found');
    err.statusCode = 404;
    throw err;
  }
  return location;
};

const createLocation = async (data) => {
  const location = await Location.create(data);
  logger.info(`Location created: ${location.name}`);
  return location;
};

const updateLocation = async (id, data) => {
  const location = await Location.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!location) {
    const err = new Error('Location not found');
    err.statusCode = 404;
    throw err;
  }
  return location;
};

const deleteLocation = async (id) => {
  const location = await Location.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!location) {
    const err = new Error('Location not found');
    err.statusCode = 404;
    throw err;
  }
  logger.info(`Location soft-deleted: ${id}`);
  return location;
};

module.exports = { getAllLocations, getLocationById, createLocation, updateLocation, deleteLocation };
