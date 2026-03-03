-- =====================================================
-- DISCUSS v3 — Attachment columns
-- Run after: discuss_v2_optimizations.sql
-- Runner safely ignores "column already exists" errors
-- =====================================================

ALTER TABLE discuss_messages
  ADD COLUMN attachment_url    VARCHAR(500)  NULL AFTER content,
  ADD COLUMN attachment_type   VARCHAR(80)   NULL AFTER attachment_url,
  ADD COLUMN attachment_name   VARCHAR(255)  NULL AFTER attachment_type,
  ADD COLUMN attachment_size   INT UNSIGNED  NULL AFTER attachment_name;
