-- Add reply_body column to autopilot_log to store AI-generated replies
ALTER TABLE autopilot_log
  ADD COLUMN reply_body MEDIUMTEXT NULL AFTER reply_sent;
