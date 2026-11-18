-- Somente no cluster descartável. O emissor de JWT e a API Auth não fazem
-- parte deste ensaio. As políticas e os papéis são exercitados pelo PostgreSQL.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (
  id uuid primary key,
  email text unique
);
create table auth.sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create function auth.jwt() returns jsonb
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb
$$;
create function auth.uid() returns uuid
language sql stable as $$
  select (auth.jwt()->>'sub')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
