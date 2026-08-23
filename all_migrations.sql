-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Acme schema for the demo service
CREATE SCHEMA IF NOT EXISTS acme;

-- Core Tables (ToolTwin - public schema)

CREATE TYPE action_status AS ENUM (
  'PROPOSED', 'SIMULATING', 'SIMULATED', 'PENDING_REVIEW',
  'APPROVED', 'BLOCKED', 'MODIFIED', 'EXECUTING',
  'EXECUTED', 'VERIFYING', 'VERIFIED', 'DISCREPANCY'
);

CREATE TYPE risk_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE verification_status_enum AS ENUM ('PENDING', 'VERIFIED', 'DISCREPANCY');

CREATE TABLE public.action_proposals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status action_status NOT NULL DEFAULT 'PROPOSED',
  proposed_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  tool_name text NOT NULL,
  tool_params jsonb NOT NULL,
  llm_reasoning text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.world_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id uuid REFERENCES public.action_proposals(id),
  snapshot_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.simulation_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id uuid REFERENCES public.action_proposals(id),
  snapshot_id uuid REFERENCES public.world_snapshots(id),
  affected_entities jsonb NOT NULL,
  dependency_graph jsonb NOT NULL,
  risk_score integer NOT NULL,
  risk_level risk_level_enum NOT NULL,
  risk_factors jsonb,
  simulated_state jsonb,
  policy_violations jsonb NOT NULL,
  policy_passed boolean NOT NULL,
  alternatives jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.execution_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id uuid REFERENCES public.action_proposals(id),
  executed_action jsonb NOT NULL,
  response jsonb,
  pre_state jsonb,
  post_state jsonb,
  verification_status verification_status_enum DEFAULT 'PENDING',
  discrepancy_detail jsonb,
  executed_at timestamptz DEFAULT now()
);

CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  rule_type text NOT NULL,
  rule_config jsonb NOT NULL,
  severity risk_level_enum NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  parameters jsonb NOT NULL,
  target_entity text,
  is_destructive boolean DEFAULT false,
  dependencies jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.dependency_edges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_entity text NOT NULL,
  source_field text NOT NULL,
  target_entity text NOT NULL,
  target_field text NOT NULL,
  relationship_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id uuid REFERENCES public.action_proposals(id),
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TYPE user_role_enum AS ENUM ('operator', 'approver', 'auditor', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role user_role_enum DEFAULT 'operator',
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Acme Commerce Tables (acme schema)

CREATE TABLE acme.customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'active',
  last_active timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE acme.orders (
  id text PRIMARY KEY,
  customer_id text REFERENCES acme.customers(id),
  total numeric,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE acme.payments (
  id text PRIMARY KEY,
  order_id text REFERENCES acme.orders(id),
  amount numeric,
  method text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE acme.inventory (
  id text PRIMARY KEY,
  product_name text,
  quantity integer,
  reserved integer,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE acme.support_tickets (
  id text PRIMARY KEY,
  customer_id text REFERENCES acme.customers(id),
  status text,
  priority text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE acme.analytics_aggregates (
  id text PRIMARY KEY,
  metric_name text,
  dimension text,
  dimension_value text,
  value numeric,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all public tables
ALTER TABLE public.action_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependency_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role_enum AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.get_current_user_role() IN ('admin', 'auditor'));
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for Action Proposals
CREATE POLICY "Operators can create and view own proposals" ON public.action_proposals FOR ALL USING (auth.uid() = proposed_by OR public.get_current_user_role() IN ('admin', 'auditor', 'approver'));
CREATE POLICY "Approvers can update proposals" ON public.action_proposals FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'approver'));

-- RLS Policies for Other Tables
CREATE POLICY "All authenticated users can read world_snapshots" ON public.world_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can insert world_snapshots" ON public.world_snapshots FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'operator', 'approver'));

CREATE POLICY "All authenticated users can read simulation_results" ON public.simulation_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can insert simulation_results" ON public.simulation_results FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'operator', 'approver'));

CREATE POLICY "All authenticated users can read execution_results" ON public.execution_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Executors can insert execution_results" ON public.execution_results FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'operator', 'approver'));

CREATE POLICY "All authenticated users can read audit_log" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "All authenticated users can read policies" ON public.policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage policies" ON public.policies FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "All authenticated users can read tools" ON public.tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tools" ON public.tools FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "All authenticated users can read dependency_edges" ON public.dependency_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage dependency_edges" ON public.dependency_edges FOR ALL USING (public.get_current_user_role() = 'admin');

-- Database Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_action_proposals_status ON public.action_proposals(status);
CREATE INDEX IF NOT EXISTS idx_action_proposals_proposed_by ON public.action_proposals(proposed_by);
CREATE INDEX IF NOT EXISTS idx_world_snapshots_proposal_id ON public.world_snapshots(proposal_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_proposal_id ON public.simulation_results(proposal_id);
CREATE INDEX IF NOT EXISTS idx_execution_results_proposal_id ON public.execution_results(proposal_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_proposal_id ON public.audit_log(proposal_id);
CREATE INDEX IF NOT EXISTS idx_dependency_edges_source ON public.dependency_edges(source_entity, source_field);
CREATE INDEX IF NOT EXISTS idx_dependency_edges_target ON public.dependency_edges(target_entity, target_field);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON acme.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON acme.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON acme.support_tickets(customer_id);
-- Seed Data for ToolTwin MVP

-- 1. Create a test admin user and operator (simulating Auth users for FK constraints)
-- In a real Supabase environment, these exist in auth.users.
-- For local testing/seeding without Auth running, we can just insert them into public.profiles
-- if we drop the strict auth.users FK constraint or mock it.
-- Assuming we're just seeding the functional tables:

-- Tools Catalog
INSERT INTO public.tools (id, name, description, parameters, target_entity, is_destructive, dependencies) VALUES
(uuid_generate_v4(), 'delete_customer', 'Deletes a customer and all their associated data', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customers', true, '[{"entity_type": "orders", "relationship": "one_to_many"}]'),
(uuid_generate_v4(), 'anonymize_customer', 'Anonymizes customer PII but preserves transactional history', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customers', false, '[]');

-- Dependency Edges
INSERT INTO public.dependency_edges (id, source_entity, source_field, target_entity, target_field, relationship_type) VALUES
(uuid_generate_v4(), 'customers', 'id', 'orders', 'customer_id', 'one_to_many_cascade'),
(uuid_generate_v4(), 'orders', 'id', 'payments', 'order_id', 'one_to_many_cascade'),
(uuid_generate_v4(), 'customers', 'id', 'support_tickets', 'customer_id', 'one_to_many_cascade'),
(uuid_generate_v4(), 'customers', 'id', 'analytics_aggregates', 'dimension_value', 'aggregate_corrupt');

-- Policies
INSERT INTO public.policies (id, name, description, rule_type, rule_config, severity) VALUES
(uuid_generate_v4(), 'Data Retention Policy', 'Preserve customer records for 7 years after last activity or if historical orders exist', 'retention', '{"entity": "customers", "condition": "last_active > now() - interval ''7 years'' OR has_orders = true", "action": "BLOCK"}', 'CRITICAL'),
(uuid_generate_v4(), 'Financial Integrity Policy', 'Block actions that corrupt payment records', 'integrity', '{"entity": "payments", "condition": "is_deleted = true", "action": "BLOCK"}', 'CRITICAL'),
(uuid_generate_v4(), 'GDPR Compliance Policy', 'Recommend anonymization when blocking deletion', 'compliance', '{"entity": "customers", "action": "RECOMMEND_ALTERNATIVE", "alternative": "anonymize_customer"}', 'MEDIUM');

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
ALTER TABLE public.audit_log ADD COLUMN cryptographic_signature text;
