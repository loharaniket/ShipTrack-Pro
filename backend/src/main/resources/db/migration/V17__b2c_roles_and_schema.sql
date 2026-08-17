-- V17__b2c_roles_and_schema.sql
-- Ensure all B2C MVP user roles exist

INSERT INTO roles (id, name, description)
VALUES (gen_random_uuid(), 'SUPPORT_AGENT', 'Customer support agent')
ON CONFLICT (name) DO NOTHING;
