-- Fix action_proposals, execution_results, and audit_log to support the 'mock-123' demo user

-- action_proposals
ALTER TABLE public.action_proposals DROP CONSTRAINT IF EXISTS action_proposals_proposed_by_fkey;
ALTER TABLE public.action_proposals DROP CONSTRAINT IF EXISTS action_proposals_reviewed_by_fkey;

DROP POLICY IF EXISTS "Operators can create and view own proposals" ON public.action_proposals;
DROP POLICY IF EXISTS "Approvers can update proposals" ON public.action_proposals;

ALTER TABLE public.action_proposals ALTER COLUMN proposed_by TYPE text;
ALTER TABLE public.action_proposals ALTER COLUMN reviewed_by TYPE text;

CREATE POLICY "Operators can create and view own proposals" ON public.action_proposals FOR ALL USING (
  auth.uid()::text = proposed_by OR proposed_by = 'mock-123' OR proposed_by IS NULL OR public.get_current_user_role() IN ('admin', 'auditor', 'approver')
);

-- audit_log
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE public.audit_log ALTER COLUMN actor_id TYPE text;

DROP POLICY IF EXISTS "Auditors can read audit log" ON public.audit_log;
CREATE POLICY "Anyone can read audit log in demo" ON public.audit_log FOR SELECT USING (
  actor_id = 'mock-123' OR actor_id IS NULL OR public.get_current_user_role() IN ('admin', 'auditor')
);
