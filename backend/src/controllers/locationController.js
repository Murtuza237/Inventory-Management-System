const locationService = require('../services/locationService');

const getAllLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getAllLocations();
    res.status(200).json({ success: true, count: locations.length, locations });
  } catch (error) {
    next(error);
  }
};

const getLocation = async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    res.status(200).json({ success: true, location });
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const location = await locationService.createLocation(req.body);
    res.status(201).json({ success: true, location });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const location = await locationService.updateLocation(req.params.id, req.body);
    res.status(200).json({ success: true, location });
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    await locationService.deleteLocation(req.params.id);
    res.status(200).json({ success: true, message: 'Location deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllLocations, getLocation, createLocation, updateLocation, deleteLocation };
