-- Delete old simple seeds to prevent clutter
DELETE FROM public.tools WHERE user_id = 'mock-123';
DELETE FROM public.policies WHERE user_id = 'mock-123';
DELETE FROM public.dependency_edges WHERE user_id = 'mock-123';

-- 1. SEED RICH TOOLS
INSERT INTO public.tools (name, description, parameters, target_entity, is_destructive, user_id)
VALUES 
-- CRM / Database Tools
('delete_customer', 'Deletes a customer account and all primary records', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customer', true, 'mock-123'),
('anonymize_customer', 'Strips PII from a customer record for GDPR compliance', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customer', false, 'mock-123'),
('merge_accounts', 'Merges two CRM accounts into one', '{"type": "object", "properties": {"source_id": {"type": "string"}, "target_id": {"type": "string"}}, "required": ["source_id", "target_id"]}', 'customer', true, 'mock-123'),

-- DevOps / AWS Tools
('terminate_ec2_instance', 'Immediately terminates an AWS EC2 instance', '{"type": "object", "properties": {"instance_id": {"type": "string"}}, "required": ["instance_id"]}', 'ec2_instance', true, 'mock-123'),
('revoke_iam_key', 'Revokes an active IAM access key', '{"type": "object", "properties": {"access_key_id": {"type": "string"}}, "required": ["access_key_id"]}', 'iam_key', true, 'mock-123'),
('scale_database', 'Modifies RDS/DynamoDB capacity provisioning', '{"type": "object", "properties": {"cluster_id": {"type": "string"}, "capacity_units": {"type": "number"}}, "required": ["cluster_id", "capacity_units"]}', 'database_cluster', false, 'mock-123'),

-- Billing / Stripe Tools
('cancel_subscription', 'Cancels an active Stripe subscription', '{"type": "object", "properties": {"subscription_id": {"type": "string"}, "immediately": {"type": "boolean"}}, "required": ["subscription_id"]}', 'stripe_subscription', true, 'mock-123'),
('issue_refund', 'Issues a full or partial refund for a transaction', '{"type": "object", "properties": {"charge_id": {"type": "string"}, "amount": {"type": "number"}}, "required": ["charge_id"]}', 'payment_transaction', false, 'mock-123')
ON CONFLICT DO NOTHING;

-- 2. SEED COMPLEX DEPENDENCY GRAPH EDGES
-- This is what makes the Simulation Engine generate an impressive blast radius graph!
INSERT INTO public.dependency_edges (source_entity, source_field, target_entity, target_field, relationship_type, user_id)
VALUES
-- If you delete a customer, it affects orders, support tickets, and stripe subscriptions
('customer', 'id', 'orders', 'customer_id', 'has_many', 'mock-123'),
('customer', 'id', 'support_tickets', 'customer_id', 'has_many', 'mock-123'),
('customer', 'stripe_id', 'stripe_subscription', 'customer_id', 'has_one', 'mock-123'),

-- If you delete an order, it affects payment transactions and fulfillment shipments
('orders', 'id', 'payment_transaction', 'order_id', 'has_one', 'mock-123'),
('orders', 'id', 'fulfillment_shipment', 'order_id', 'has_one', 'mock-123'),

-- If you terminate an EC2 instance, it orphans load balancer targets and EBS volumes
('ec2_instance', 'instance_id', 'ebs_volume', 'attachment_id', 'attached_to', 'mock-123'),
('ec2_instance', 'instance_id', 'load_balancer_target', 'target_id', 'registered_to', 'mock-123'),

-- If you revoke an IAM key, it breaks automated microservices
('iam_key', 'access_key', 'payment_processing_microservice', 'aws_key', 'used_by', 'mock-123'),
('iam_key', 'access_key', 'daily_backup_cron', 'aws_key', 'used_by', 'mock-123')
ON CONFLICT DO NOTHING;

-- 3. SEED RICH POLICIES
INSERT INTO public.policies (name, description, rule_type, rule_config, severity, is_active, user_id)
VALUES 
('GDPR Right to be Forgotten', 'Require anonymization instead of hard deletion to preserve analytical integrity', 'block_destructive', '{}', 'CRITICAL', true, 'mock-123'),
('Production Infrastructure Lock', 'Prevent termination of infrastructure resources during business hours', 'time_window_lock', '{"allowed_hours": ["00:00", "04:00"]}', 'CRITICAL', true, 'mock-123'),
('Financial Safety Net', 'Require secondary manual review for any action that orphans payment records', 'require_approval', '{}', 'HIGH', true, 'mock-123'),
('Orphaned Volume Prevention', 'Alert when compute termination leaves storage volumes unattached', 'alert_only', '{}', 'MEDIUM', true, 'mock-123')
ON CONFLICT DO NOTHING;
