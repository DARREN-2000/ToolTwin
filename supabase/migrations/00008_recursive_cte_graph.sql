-- Create a recursive CTE function to calculate blast radius at the database level

CREATE OR REPLACE FUNCTION get_blast_radius(
  start_entity text,
  max_depth integer DEFAULT 3
)
RETURNS TABLE (
  source_entity text,
  target_entity text,
  relationship_type text,
  depth integer
) 
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE dependency_tree AS (
    -- Base case: find immediate children of the starting entity
    SELECT 
      e.source_entity, 
      e.target_entity, 
      e.relationship_type,
      1 AS depth
    FROM public.dependency_edges e
    WHERE e.source_entity = start_entity
    
    UNION ALL
    
    -- Recursive step: find children of the children
    SELECT 
      e.source_entity, 
      e.target_entity, 
      e.relationship_type,
      dt.depth + 1
    FROM public.dependency_edges e
    INNER JOIN dependency_tree dt ON e.source_entity = dt.target_entity
    WHERE dt.depth < max_depth
  )
  SELECT DISTINCT * FROM dependency_tree;
$$;
