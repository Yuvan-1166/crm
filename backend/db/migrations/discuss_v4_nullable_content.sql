-- Allow attachment-only messages (no text body required)
ALTER TABLE discuss_messages MODIFY COLUMN content TEXT NULL;
