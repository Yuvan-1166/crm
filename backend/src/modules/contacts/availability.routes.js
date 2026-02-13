import { Router } from "express";
import * as availabilityController from "./availability.controller.js";
import { authenticateEmployee } from "../../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true }); // mergeParams to access :contactId from parent

// Get availability for a contact
router.get("/", authenticateEmployee, availabilityController.getAvailability);

// Get today's availability
router.get("/today", authenticateEmployee, availabilityController.getTodayAvailability);

// Set complete weekly schedule
router.post("/weekly", authenticateEmployee, availabilityController.setWeeklySchedule);

// Set default business hours
router.post("/default", authenticateEmployee, availabilityController.setDefaultHours);

// Create a new availability window
router.post("/", authenticateEmployee, availabilityController.createAvailabilityWindow);

// Update an availability window
router.put("/:availabilityId", authenticateEmployee, availabilityController.updateAvailabilityWindow);

// Delete an availability window
router.delete("/:availabilityId", authenticateEmployee, availabilityController.deleteAvailabilityWindow);

export default router;
