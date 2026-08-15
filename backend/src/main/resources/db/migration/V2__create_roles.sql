CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'ADMINISTRATOR', 'Administrator');
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'BUSINESS_CLIENT', 'Business Client');
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'DRIVER', 'Driver');
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'CUSTOMER', 'Customer');
