-- PostgreSQL Seed Data Script
-- This script runs after 01-init.sql to populate initial data
-- Add your seed data here for development

-- Example: Insert test users (uncomment and modify as needed)
-- INSERT INTO "user" (id, name, email, email_verified, is_admin, plan, created_at, updated_at)
-- VALUES
--   ('test-user-1', 'Test User', 'test@example.com', true, false, 'free', NOW(), NOW()),
--   ('admin-user-1', 'Admin User', 'admin@example.com', true, true, 'pro', NOW(), NOW())
-- ON CONFLICT (email) DO NOTHING;

-- Log that seeding is complete
DO $$
BEGIN
    RAISE NOTICE 'Database seeding complete (seed data is optional)';
END $$;
