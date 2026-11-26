-- B6: restore the approved authenticated-only RPC privilege model.
-- Scope: revoke EXECUTE from anon on aabb_api functions only.
DO $aabb_guard$
DECLARE total integer; anon_total integer; auth_total integer;
BEGIN
  SELECT count(*),
         count(*) FILTER (WHERE has_function_privilege('anon',p.oid,'EXECUTE')),
         count(*) FILTER (WHERE has_function_privilege('authenticated',p.oid,'EXECUTE'))
    INTO total, anon_total, auth_total
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='aabb_api';
  IF total <> 13 OR auth_total <> 13 THEN
    RAISE EXCEPTION 'B6 privilege precondition failed: functions %, anon %, authenticated %',total,anon_total,auth_total;
  END IF;
END
$aabb_guard$;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA aabb_api FROM anon;

DO $aabb_check$
DECLARE anon_total integer; auth_total integer;
BEGIN
  SELECT count(*) FILTER (WHERE has_function_privilege('anon',p.oid,'EXECUTE')),
         count(*) FILTER (WHERE has_function_privilege('authenticated',p.oid,'EXECUTE'))
    INTO anon_total,auth_total
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='aabb_api';
  IF anon_total <> 0 OR auth_total <> 13 THEN
    RAISE EXCEPTION 'B6 privilege postcondition failed: anon %, authenticated %',anon_total,auth_total;
  END IF;
END
$aabb_check$;
