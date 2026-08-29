-- Add user ownership for multi-tenancy
ALTER TABLE public.tools ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.dependency_edges ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.policies ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create API Keys table for agent integrations
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

-- Update RLS for multi-tenant generic platform

-- Drop old global RLS policies
DROP POLICY IF EXISTS "All authenticated users can read tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can manage tools" ON public.tools;
DROP POLICY IF EXISTS "All authenticated users can read dependency_edges" ON public.dependency_edges;
DROP POLICY IF EXISTS "Admins can manage dependency_edges" ON public.dependency_edges;
DROP POLICY IF EXISTS "All authenticated users can read policies" ON public.policies;
DROP POLICY IF EXISTS "Admins can manage policies" ON public.policies;

-- New Tenant-Isolated Policies
CREATE POLICY "Users can manage their own tools" ON public.tools FOR ALL USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');
CREATE POLICY "Users can manage their own dependency_edges" ON public.dependency_edges FOR ALL USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');
CREATE POLICY "Users can manage their own policies" ON public.policies FOR ALL USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own api keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- Optional: External Database Connection configs (for generic proxying)
CREATE TABLE public.data_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  connection_string_encrypted text NOT NULL,
  driver text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.data_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own data connections" ON public.data_connections FOR ALL USING (auth.uid() = user_id);
