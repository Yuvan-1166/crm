import * as availabilityService from './availability.service.js';

/**
 * @desc   Get availability windows for a contact
 * @route  GET /contacts/:contactId/availability
 * @access Employee
 */
export const getAvailability = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const availability = await availabilityService.getContactAvailability(contactId);
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get today's availability for a contact
 * @route  GET /contacts/:contactId/availability/today
 * @access Employee
 */
export const getTodayAvailability = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const windows = await availabilityService.getTodayAvailability(contactId);
    res.json({ today: windows });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Add a new availability window
 * @route  POST /contacts/:contactId/availability
 * @access Employee
 */
export const createAvailabilityWindow = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { day_of_week, start_time, end_time, timezone } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ 
        message: 'day_of_week, start_time, and end_time are required' 
      });
    }

    const availabilityId = await availabilityService.addAvailabilityWindow(contactId, {
      day_of_week,
      start_time,
      end_time,
      timezone: timezone || 'UTC',
    });

    res.status(201).json({
      message: 'Availability window created',
      availability_id: availabilityId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update an availability window
 * @route  PUT /contacts/:contactId/availability/:availabilityId
 * @access Employee
 */
export const updateAvailabilityWindow = async (req, res, next) => {
  try {
    const { availabilityId } = req.params;
    const updates = req.body;

    await availabilityService.updateAvailabilityWindow(availabilityId, updates);

    res.json({ message: 'Availability window updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete an availability window
 * @route  DELETE /contacts/:contactId/availability/:availabilityId
 * @access Employee
 */
export const deleteAvailabilityWindow = async (req, res, next) => {
  try {
    const { availabilityId } = req.params;
    await availabilityService.removeAvailabilityWindow(availabilityId);
    res.json({ message: 'Availability window deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Set complete weekly schedule (replaces all existing)
 * @route  POST /contacts/:contactId/availability/weekly
 * @access Employee
 */
export const setWeeklySchedule = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ 
        message: 'schedule must be an array of availability windows' 
      });
    }

    await availabilityService.setWeeklySchedule(contactId, schedule);

    res.json({ message: 'Weekly schedule updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Set default business hours (Mon-Fri 9-5)
 * @route  POST /contacts/:contactId/availability/default
 * @access Employee
 */
export const setDefaultHours = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { timezone } = req.body;

    await availabilityService.setDefaultBusinessHours(contactId, timezone || 'UTC');

    res.json({ message: 'Default business hours set' });
  } catch (error) {
    next(error);
  }
};
