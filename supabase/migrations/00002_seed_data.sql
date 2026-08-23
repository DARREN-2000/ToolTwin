-- Seed Data for ToolTwin MVP

-- 1. Create a test admin user and operator (simulating Auth users for FK constraints)
-- In a real Supabase environment, these exist in auth.users.
-- For local testing/seeding without Auth running, we can just insert them into public.profiles
-- if we drop the strict auth.users FK constraint or mock it.
-- Assuming we're just seeding the functional tables:

-- Tools Catalog
INSERT INTO public.tools (id, name, description, parameters, target_entity, is_destructive, dependencies) VALUES
(gen_random_uuid(), 'delete_customer', 'Deletes a customer and all their associated data', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customers', true, '[{"entity_type": "orders", "relationship": "one_to_many"}]'),
(gen_random_uuid(), 'anonymize_customer', 'Anonymizes customer PII but preserves transactional history', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customers', false, '[]');

-- Dependency Edges
INSERT INTO public.dependency_edges (id, source_entity, source_field, target_entity, target_field, relationship_type) VALUES
(gen_random_uuid(), 'customers', 'id', 'orders', 'customer_id', 'one_to_many_cascade'),
(gen_random_uuid(), 'orders', 'id', 'payments', 'order_id', 'one_to_many_cascade'),
(gen_random_uuid(), 'customers', 'id', 'support_tickets', 'customer_id', 'one_to_many_cascade'),
(gen_random_uuid(), 'customers', 'id', 'analytics_aggregates', 'dimension_value', 'aggregate_corrupt');

-- Policies
INSERT INTO public.policies (id, name, description, rule_type, rule_config, severity) VALUES
(gen_random_uuid(), 'Data Retention Policy', 'Preserve customer records for 7 years after last activity or if historical orders exist', 'retention', '{"entity": "customers", "condition": "last_active > now() - interval ''7 years'' OR has_orders = true", "action": "BLOCK"}', 'CRITICAL'),
(gen_random_uuid(), 'Financial Integrity Policy', 'Block actions that corrupt payment records', 'integrity', '{"entity": "payments", "condition": "is_deleted = true", "action": "BLOCK"}', 'CRITICAL'),
(gen_random_uuid(), 'GDPR Compliance Policy', 'Recommend anonymization when blocking deletion', 'compliance', '{"entity": "customers", "action": "RECOMMEND_ALTERNATIVE", "alternative": "anonymize_customer"}', 'MEDIUM');

-- Acme Commerce Seed Data
INSERT INTO acme.customers (id, name, email, phone, status, last_active, created_at) VALUES
('CUS-10482', 'Jane Morrison', 'jane.m@example.com', '555-0192', 'active', '2019-03-15T10:00:00Z', '2017-01-10T08:00:00Z'),
('CUS-99213', 'John Doe', 'john.doe@example.com', '555-0193', 'active', '2023-11-20T10:00:00Z', '2022-05-14T08:00:00Z');

-- Orders for Jane
INSERT INTO acme.orders (id, customer_id, total, status, created_at) VALUES
('ORD-0501', 'CUS-10482', 1200.50, 'completed', '2017-02-15T10:00:00Z'),
('ORD-0502', 'CUS-10482', 850.00, 'completed', '2017-06-20T10:00:00Z'),
('ORD-0503', 'CUS-10482', 2100.75, 'completed', '2018-01-10T10:00:00Z');

-- Payments for Jane's Orders
INSERT INTO acme.payments (id, order_id, amount, method, created_at) VALUES
('PAY-0501', 'ORD-0501', 1200.50, 'credit_card', '2017-02-15T10:05:00Z'),
('PAY-0502', 'ORD-0502', 850.00, 'credit_card', '2017-06-20T10:05:00Z'),
('PAY-0503', 'ORD-0503', 2100.75, 'bank_transfer', '2018-01-10T10:10:00Z');

-- Support Tickets
INSERT INTO acme.support_tickets (id, customer_id, status, priority, created_at) VALUES
('TKT-0012', 'CUS-10482', 'resolved', 'high', '2017-02-16T10:00:00Z'),
('TKT-0047', 'CUS-10482', 'resolved', 'medium', '2018-01-11T10:00:00Z');

-- Analytics
INSERT INTO acme.analytics_aggregates (id, metric_name, dimension, dimension_value, value, updated_at) VALUES
('AGG-001', 'customer_ltv', 'customer_id', 'CUS-10482', 4151.25, now()),
('AGG-002', 'revenue_by_customer', 'customer_id', 'CUS-10482', 4151.25, now());
