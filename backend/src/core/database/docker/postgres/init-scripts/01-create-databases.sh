#!/bin/bash
set -e

# Function to create a database if it doesn't exist
create_db_if_not_exists() {
  local db_name=$1
  echo "Creating database '$db_name' if it doesn't exist..."
  
  # Check if database exists
  if psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
    echo "Database '$db_name' already exists."
  else
    echo "Creating database '$db_name'..."
    psql -U "$POSTGRES_USER" -c "CREATE DATABASE $db_name;"
    echo "Database '$db_name' created successfully."
  fi
}

# Create test database
create_db_if_not_exists "ctem_webapp_test"

# Add extensions to all databases
for db in "ctem_webapp_dev" "ctem_webapp_test"; do
  echo "Configuring database '$db'..."
  psql -U "$POSTGRES_USER" -d "$db" -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
  psql -U "$POSTGRES_USER" -d "$db" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
done

echo "Database initialization completed." 