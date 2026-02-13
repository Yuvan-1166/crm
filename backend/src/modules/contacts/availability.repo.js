import { db } from "../../config/db.js";

/**
 * Get all availability windows for a contact
 */
export const getAvailabilityByContact = async (contactId) => {
  const [rows] = await db.query(
    `SELECT * FROM contact_availability 
     WHERE contact_id = ? AND is_active = TRUE 
     ORDER BY 
       FIELD(day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
       start_time ASC`,
    [contactId]
  );
  return rows;
};

/**
 * Get availability for a specific day
 */
export const getAvailabilityByDay = async (contactId, dayOfWeek) => {
  const [rows] = await db.query(
    `SELECT * FROM contact_availability 
     WHERE contact_id = ? AND day_of_week = ? AND is_active = TRUE 
     ORDER BY start_time ASC`,
    [contactId, dayOfWeek]
  );
  return rows;
};

/**
 * Create a new availability window
 */
export const createAvailability = async (availabilityData) => {
  const {
    contact_id,
    day_of_week,
    start_time,
    end_time,
    timezone = 'UTC'
  } = availabilityData;

  const [result] = await db.query(
    `INSERT INTO contact_availability 
     (contact_id, day_of_week, start_time, end_time, timezone) 
     VALUES (?, ?, ?, ?, ?)`,
    [contact_id, day_of_week, start_time, end_time, timezone]
  );

  return result.insertId;
};

/**
 * Update an availability window
 */
export const updateAvailability = async (availabilityId, updates) => {
  const allowedFields = ['day_of_week', 'start_time', 'end_time', 'timezone', 'is_active'];
  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(availabilityId);

  await db.query(
    `UPDATE contact_availability SET ${fields.join(', ')} WHERE availability_id = ?`,
    values
  );

  return true;
};

/**
 * Delete an availability window
 */
export const deleteAvailability = async (availabilityId) => {
  await db.query(
    `DELETE FROM contact_availability WHERE availability_id = ?`,
    [availabilityId]
  );
  return true;
};

/**
 * Bulk create availability windows (e.g., set weekly schedule)
 */
export const bulkCreateAvailability = async (contactId, availabilityWindows) => {
  if (!availabilityWindows || availabilityWindows.length === 0) {
    return [];
  }

  const values = availabilityWindows.map(window => [
    contactId,
    window.day_of_week,
    window.start_time,
    window.end_time,
    window.timezone || 'UTC'
  ]);

  const [result] = await db.query(
    `INSERT INTO contact_availability 
     (contact_id, day_of_week, start_time, end_time, timezone) 
     VALUES ?`,
    [values]
  );

  return result;
};

/**
 * Delete all availability windows for a contact
 */
export const deleteAllAvailability = async (contactId) => {
  await db.query(
    `DELETE FROM contact_availability WHERE contact_id = ?`,
    [contactId]
  );
  return true;
};
