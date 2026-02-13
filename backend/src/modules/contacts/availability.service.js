import * as availabilityRepo from './availability.repo.js';

/**
 * Get availability for a contact
 */
export const getContactAvailability = async (contactId) => {
  const windows = await availabilityRepo.getAvailabilityByContact(contactId);
  
  // Group by day of week for easier consumption
  const grouped = windows.reduce((acc, window) => {
    if (!acc[window.day_of_week]) {
      acc[window.day_of_week] = [];
    }
    acc[window.day_of_week].push({
      availability_id: window.availability_id,
      start_time: window.start_time,
      end_time: window.end_time,
      timezone: window.timezone,
    });
    return acc;
  }, {});

  return {
    contact_id: contactId,
    timezone: windows[0]?.timezone || 'UTC',
    weekly_schedule: grouped,
    raw_windows: windows,
  };
};

/**
 * Get availability for today
 */
export const getTodayAvailability = async (contactId) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  
  const windows = await availabilityRepo.getAvailabilityByDay(contactId, today);
  return windows;
};

/**
 * Create a new availability window
 */
export const addAvailabilityWindow = async (contactId, windowData) => {
  // Validate time format
  if (!isValidTime(windowData.start_time) || !isValidTime(windowData.end_time)) {
    throw new Error('Invalid time format. Use HH:MM:SS');
  }

  // Validate that end_time is after start_time
  if (windowData.start_time >= windowData.end_time) {
    throw new Error('End time must be after start time');
  }

  const availabilityId = await availabilityRepo.createAvailability({
    contact_id: contactId,
    ...windowData,
  });

  return availabilityId;
};

/**
 * Update an availability window
 */
export const updateAvailabilityWindow = async (availabilityId, updates) => {
  // Validate if time updates are provided
  if (updates.start_time && !isValidTime(updates.start_time)) {
    throw new Error('Invalid start time format');
  }
  if (updates.end_time && !isValidTime(updates.end_time)) {
    throw new Error('Invalid end time format');
  }

  await availabilityRepo.updateAvailability(availabilityId, updates);
  return true;
};

/**
 * Delete an availability window
 */
export const removeAvailabilityWindow = async (availabilityId) => {
  await availabilityRepo.deleteAvailability(availabilityId);
  return true;
};

/**
 * Set complete weekly schedule (replaces existing)
 */
export const setWeeklySchedule = async (contactId, schedule) => {
  // Delete existing availability
  await availabilityRepo.deleteAllAvailability(contactId);

  // Create new windows
  if (schedule && schedule.length > 0) {
    await availabilityRepo.bulkCreateAvailability(contactId, schedule);
  }

  return true;
};

/**
 * Set default business hours for a contact (Mon-Fri 9-5)
 */
export const setDefaultBusinessHours = async (contactId, timezone = 'UTC') => {
  const defaultSchedule = [
    { day_of_week: 'monday', start_time: '09:00:00', end_time: '17:00:00', timezone },
    { day_of_week: 'tuesday', start_time: '09:00:00', end_time: '17:00:00', timezone },
    { day_of_week: 'wednesday', start_time: '09:00:00', end_time: '17:00:00', timezone },
    { day_of_week: 'thursday', start_time: '09:00:00', end_time: '17:00:00', timezone },
    { day_of_week: 'friday', start_time: '09:00:00', end_time: '17:00:00', timezone },
  ];

  await setWeeklySchedule(contactId, defaultSchedule);
  return true;
};

/**
 * Helper: Validate time format (HH:MM:SS or HH:MM)
 */
const isValidTime = (time) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  return timeRegex.test(time);
};
