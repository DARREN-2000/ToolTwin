-- Fix foreign key constraint for demo accounts (mock-123)
-- We need to change user_id from uuid to text to support the 'mock-123' demo bypass

-- First drop the policies that depend on the user_id column
DROP POLICY IF EXISTS "Users can manage their own tools" ON public.tools;
DROP POLICY IF EXISTS "Users can manage their own dependency_edges" ON public.dependency_edges;
DROP POLICY IF EXISTS "Users can manage their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can manage their own api keys" ON public.api_keys;

-- Now alter the column
ALTER TABLE public.tools DROP CONSTRAINT IF EXISTS tools_user_id_fkey;
ALTER TABLE public.tools ALTER COLUMN user_id TYPE text;

ALTER TABLE public.dependency_edges DROP CONSTRAINT IF EXISTS dependency_edges_user_id_fkey;
ALTER TABLE public.dependency_edges ALTER COLUMN user_id TYPE text;

ALTER TABLE public.policies DROP CONSTRAINT IF EXISTS policies_user_id_fkey;
ALTER TABLE public.policies ALTER COLUMN user_id TYPE text;

ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
ALTER TABLE public.api_keys ALTER COLUMN user_id TYPE text;

-- Seed default tools for the mock demo account so visitors immediately have something to play with
INSERT INTO public.tools (name, description, parameters, target_entity, is_destructive, user_id)
VALUES 
('delete_customer', 'Deletes a customer record from the database', '{"type": "object", "properties": {"customer_id": {"type": "string"}}, "required": ["customer_id"]}', 'customer', true, 'mock-123'),
('refund_payment', 'Refunds a specific payment transaction', '{"type": "object", "properties": {"transaction_id": {"type": "string"}, "amount": {"type": "number"}}, "required": ["transaction_id"]}', 'payment', false, 'mock-123')
ON CONFLICT (name) DO NOTHING;

-- Update RLS to explicitly allow public access to the 'mock-123' demo sandbox
DROP POLICY IF EXISTS "Users can manage their own tools" ON public.tools;
CREATE POLICY "Users can manage their own tools" ON public.tools FOR ALL USING (
  auth.uid()::text = user_id OR user_id = 'mock-123'
);

DROP POLICY IF EXISTS "Users can manage their own dependency_edges" ON public.dependency_edges;
CREATE POLICY "Users can manage their own dependency_edges" ON public.dependency_edges FOR ALL USING (
  auth.uid()::text = user_id OR user_id = 'mock-123'
);

DROP POLICY IF EXISTS "Users can manage their own policies" ON public.policies;
CREATE POLICY "Users can manage their own policies" ON public.policies FOR ALL USING (
  auth.uid()::text = user_id OR user_id = 'mock-123'
);
