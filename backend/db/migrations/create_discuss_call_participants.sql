-- =====================================================
-- DISCUSS CALL PARTICIPANTS — Track individual participant join/leave
-- in LiveKit audio call rooms, updated via LiveKit webhooks.
-- =====================================================

CREATE TABLE IF NOT EXISTS discuss_call_participants (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  call_id       BIGINT NOT NULL COMMENT 'FK to discuss_call_logs.call_id',
  emp_id        INT NOT NULL COMMENT 'Employee who joined the call',
  identity      VARCHAR(100) NOT NULL COMMENT 'LiveKit participant identity (e.g. emp-42)',
  status        ENUM('joined', 'left') DEFAULT 'joined',
  joined_at     TIMESTAMP NULL,
  left_at       TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_call_participants (call_id, emp_id),
  INDEX idx_emp_calls (emp_id, joined_at DESC),
  FOREIGN KEY (call_id) REFERENCES discuss_call_logs(call_id) ON DELETE CASCADE
);
