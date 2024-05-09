ALTER TABLE reed_log ADD COLUMN entry_timestamp_datetime DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
UPDATE reed_log SET entry_timestamp_datetime = FROM_UNIXTIME(entry_timestamp);
ALTER TABLE reed_log DROP COLUMN entry_timestamp;
ALTER TABLE reed_log RENAME COLUMN entry_timestamp_datetime TO entry_timestamp;
ALTER TABLE reed_log ADD COLUMN commit_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE reed_log ADD INDEX commit_time(commit_time);
ALTER TABLE reed_log ADD INDEX reed_id(reed_id);
