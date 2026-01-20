-- PostgreSQL Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time
-- Files are executed in alphabetical order

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the main database schema (if not using drizzle migrations)
-- The actual schema is managed by Drizzle ORM migrations
-- This file is for any database-level setup that should happen before migrations

-- Log that initialization is complete
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL initialization complete for automaker database';
END $$;
