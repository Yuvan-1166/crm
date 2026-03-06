-- =====================================================
-- DISCUSS CALL LOGS — Persistent call history for team chat audio calls
-- Stores every call start/end event so chat logs survive page refresh.
-- =====================================================

CREATE TABLE IF NOT EXISTS discuss_call_logs (
  call_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  channel_id    INT NOT NULL,
  caller_emp_id INT NOT NULL,
  caller_name   VARCHAR(120) DEFAULT NULL,
  channel_name  VARCHAR(120) DEFAULT NULL,
  status        ENUM('started', 'completed', 'missed', 'rejected') DEFAULT 'started',
  started_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at      TIMESTAMP NULL,
  duration      INT DEFAULT 0 COMMENT 'Call duration in seconds',
  company_id    INT NOT NULL,

  INDEX idx_channel_calls (channel_id, started_at DESC),
  INDEX idx_company_calls (company_id, started_at DESC),
  INDEX idx_caller (caller_emp_id)
);
