CREATE TABLE reed_log (
  entry_id VARCHAR(255) PRIMARY KEY,
  google_profile_id VARCHAR(255) NOT NULL,
  entry_timestamp VARCHAR(255) NOT NULL,
  reed_id VARCHAR(255) NOT NULL,
  entry_type VARCHAR(255) NOT NULL,
  data JSON NOT NULL,
  INDEX(google_profile_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
