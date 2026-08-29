-- Seed default policies for the mock demo account

INSERT INTO public.policies (name, description, rule_type, rule_config, severity, is_active, user_id)
VALUES 
('Data Retention Policy', 'Preserve customer records for 7 years after last activity', 'block_destructive', '{}', 'CRITICAL', true, 'mock-123'),
('Financial Integrity Policy', 'Block actions that corrupt payment records', 'block_destructive', '{}', 'CRITICAL', true, 'mock-123'),
('GDPR Compliance Policy', 'Recommend anonymization when blocking deletion', 'recommendation', '{}', 'MEDIUM', true, 'mock-123')
ON CONFLICT DO NOTHING;
