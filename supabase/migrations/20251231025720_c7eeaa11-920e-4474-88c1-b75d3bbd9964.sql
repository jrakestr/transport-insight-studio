-- Drop the permissive policy that allows all authenticated users to view tasks
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.implementation_tasks;

-- Create a new policy that restricts view access to admins only
CREATE POLICY "Admins can view all tasks" 
ON public.implementation_tasks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));