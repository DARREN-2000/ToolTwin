-- add_more_tools.sql
INSERT INTO public.tools (name, description, parameters, target_entity, is_destructive, user_id)
VALUES 
-- Database / Migration Tools
('migrate_database', 'Migrates a database to a new region or cluster', '{"type": "object", "properties": {"cluster_id": {"type": "string"}, "target_region": {"type": "string"}}, "required": ["cluster_id", "target_region"]}', 'database_cluster', false, 'mock-123'),
('rollback_database', 'Rolls back a database to a specific point-in-time recovery snapshot', '{"type": "object", "properties": {"cluster_id": {"type": "string"}, "timestamp": {"type": "string"}}, "required": ["cluster_id", "timestamp"]}', 'database_cluster', true, 'mock-123'),
('drop_database_table', 'Drops a table from the production database', '{"type": "object", "properties": {"table_name": {"type": "string"}, "cascade": {"type": "boolean"}}, "required": ["table_name"]}', 'database_table', true, 'mock-123'),

-- User / Identity Tools
('ban_user', 'Instantly bans a user and revokes all active session tokens', '{"type": "object", "properties": {"user_id": {"type": "string"}, "reason": {"type": "string"}}, "required": ["user_id"]}', 'user_account', true, 'mock-123'),
('reset_password', 'Forces a password reset for a user and emails them a link', '{"type": "object", "properties": {"user_id": {"type": "string"}}, "required": ["user_id"]}', 'user_account', false, 'mock-123'),

-- Infrastructure Tools
('purge_cdn_cache', 'Purges the Cloudflare/Cloudfront CDN cache for a specific route', '{"type": "object", "properties": {"route_pattern": {"type": "string"}}, "required": ["route_pattern"]}', 'cdn_route', false, 'mock-123'),
('restart_kubernetes_pods', 'Restarts all pods within a specific Kubernetes deployment', '{"type": "object", "properties": {"deployment_name": {"type": "string"}, "namespace": {"type": "string"}}, "required": ["deployment_name", "namespace"]}', 'k8s_deployment', false, 'mock-123'),
('scale_kubernetes_cluster', 'Scales the node count of a Kubernetes cluster up or down', '{"type": "object", "properties": {"cluster_name": {"type": "string"}, "node_count": {"type": "number"}}, "required": ["cluster_name", "node_count"]}', 'k8s_cluster', false, 'mock-123')
ON CONFLICT DO NOTHING;

-- Add some dependency edges for the new tools
INSERT INTO public.dependency_edges (source_entity, source_field, target_entity, target_field, relationship_type, user_id)
VALUES
('database_cluster', 'cluster_id', 'read_replica', 'primary_cluster_id', 'has_many', 'mock-123'),
('database_cluster', 'cluster_id', 'api_gateway', 'db_target', 'queried_by', 'mock-123'),
('user_account', 'user_id', 'active_sessions', 'user_id', 'has_many', 'mock-123'),
('k8s_deployment', 'deployment_name', 'ingress_route', 'target_service', 'exposed_by', 'mock-123')
ON CONFLICT DO NOTHING;