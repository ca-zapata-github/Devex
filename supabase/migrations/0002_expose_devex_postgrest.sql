-- 0002_expose_devex_postgrest — fix PGRST106 "Invalid schema: devex"
--
-- Dashboard/API config can list devex while the authenticator role still serves
-- an older pgrst.db_schemas value. This syncs runtime to exposed schemas.
--
-- See: https://supabase.com/docs/guides/troubleshooting/pgrst106-the-schema-must-be-one-of-the-following-error-when-querying-an-exposed-schema
--
-- Safe for shared AgileRadar project: preserves public, flowboard, graphql_public.

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, flowboard, devex';

NOTIFY pgrst, 'reload schema';
