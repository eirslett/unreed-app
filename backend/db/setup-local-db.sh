#!/bin/sh
echo "Ensuring MySQL database and user exists"
mysql -u root -e "CREATE USER IF NOT EXISTS 'unreed'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'unreed'; CREATE DATABASE IF NOT EXISTS unreed; GRANT ALL PRIVILEGES ON unreed.* TO 'unreed'@'localhost'; FLUSH PRIVILEGES;"
echo "Running flyway"
flyway \
  -validateMigrationNaming=true \
  -user=unreed -password=unreed \
  -url=jdbc:mysql://localhost:3306/unreed \
  -locations=filesystem:./backend/db/migrations \
  migrate
