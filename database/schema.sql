-- =====================================================
-- RHENNIE TASTY SHACK
-- MASTER DATABASE SCHEMA
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at columns
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- =====================================================
-- CREATED BY
-- Rhennie Tasty Shack Operations Studio
-- =====================================================