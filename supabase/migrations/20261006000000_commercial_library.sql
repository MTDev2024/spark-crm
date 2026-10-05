-- ============================================================================
-- Base commerciale : sources, méthodes (et leurs étapes), offres,
-- réalisations, arguments, objections, règles commerciales.
--
-- Mêmes principes que la migration précédente :
--  * chaque ligne appartient à un utilisateur (user_id rempli automatiquement) ;
--  * sécurité par ligne (RLS) sur chaque table ;
--  * droits accordés explicitement, au seul rôle « authenticated » ;
--  * inconnu = NULL, listes = tableaux vides par défaut (jamais de valeur inventée).
--
-- Règle de connaissance : une méthode ne peut être « validée » que si elle a
-- une source identifiée. La contrainte est portée par la base elle-même.
-- ============================================================================

-- --------------------------------- sources ---------------------------------
create table public.sources (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (length(trim(title)) > 0),
  author       text,
  organization text,
  type         text not null default 'other'
                 check (type in ('book', 'article', 'course', 'video', 'document', 'other')),
  url          text,
  published_at date,
  content      text,                                 -- contenu ou extraits fournis
  status       text not null default 'raw' check (status in
                 ('raw', 'analyzed', 'principles_extracted', 'validated',
                  'validated_for_use', 'to_review', 'rejected')),
  principles   text[] not null default '{}',         -- principes extraits
  context      text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- -------------------------------- méthodes ---------------------------------
create table public.sales_methods (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name                     text not null check (length(trim(name)) > 0),
  description              text,
  objective                text,
  -- restrict : on ne peut pas supprimer une source encore utilisée par une méthode.
  source_id                uuid references public.sources (id) on delete restrict,
  author                   text,
  version                  text not null default '1',
  status                   text not null default 'draft' check (status in ('draft', 'validated', 'archived')),
  applicable_contexts      text[] not null default '{}',
  non_applicable_contexts  text[] not null default '{}',
  rules                    text[] not null default '{}',
  examples                 text[] not null default '{}',
  limitations              text[] not null default '{}',
  created_at               timestamptz not null default now(),
  -- Une méthode validée doit avoir une source identifiable.
  check (status <> 'validated' or source_id is not null)
);

create table public.sales_method_steps (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  method_id         uuid not null references public.sales_methods (id) on delete cascade,
  position          integer not null check (position >= 0),
  name              text not null check (length(trim(name)) > 0),
  objective         text,
  instructions      text,
  question_patterns text[] not null default '{}',
  signals           text[] not null default '{}',
  created_at        timestamptz not null default now()
);

-- ---------------------------------- offres ---------------------------------
create table public.offers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (length(trim(name)) > 0),
  price        text,                                  -- texte libre : prix tel que présenté
  scope        text,
  deliverables text[] not null default '{}',
  benefits     text[] not null default '{}',
  limits       text[] not null default '{}',
  lead_time    text,
  use_cases    text[] not null default '{}',
  created_at   timestamptz not null default now()
);

-- ------------------------------- réalisations ------------------------------
create table public.realizations (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  activity  text not null check (length(trim(activity)) > 0),
  problem   text,
  solution  text,
  features  text[] not null default '{}',
  results   text,
  url       text,
  context   text,
  relevance text,
  created_at timestamptz not null default now()
);

-- -------------------------------- arguments --------------------------------
create table public.sales_arguments (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  problem   text not null check (length(trim(problem)) > 0),
  benefit   text,
  context   text,
  objection text,
  answer    text,
  created_at timestamptz not null default now()
);

-- -------------------------------- objections -------------------------------
create table public.objections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  wording    text not null check (length(trim(wording)) > 0),
  context    text,
  answer     text,
  questions  text[] not null default '{}',
  method_id  uuid references public.sales_methods (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------ règles commerciales ------------------------
create table public.commercial_rules (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  statement  text not null check (length(trim(statement)) > 0),
  rationale  text,
  source_id  uuid references public.sources (id) on delete set null,
  created_at timestamptz not null default now()
);

-- --------------------------------- index -----------------------------------
create index sources_user_idx           on public.sources (user_id);
create index sales_methods_user_idx     on public.sales_methods (user_id);
create index sales_methods_source_idx   on public.sales_methods (source_id);
create index sales_method_steps_idx     on public.sales_method_steps (method_id, position);
create index offers_user_idx            on public.offers (user_id);
create index realizations_user_idx      on public.realizations (user_id);
create index sales_arguments_user_idx   on public.sales_arguments (user_id);
create index objections_user_idx        on public.objections (user_id);
create index commercial_rules_user_idx  on public.commercial_rules (user_id);

-- ---------------------- sécurité par ligne (RLS) ---------------------------
alter table public.sources            enable row level security;
alter table public.sales_methods      enable row level security;
alter table public.sales_method_steps enable row level security;
alter table public.offers             enable row level security;
alter table public.realizations       enable row level security;
alter table public.sales_arguments    enable row level security;
alter table public.objections         enable row level security;
alter table public.commercial_rules   enable row level security;

-- Tables sans lien vers une autre table : appartenance à l'utilisateur.
create policy sources_owner on public.sources
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy offers_owner on public.offers
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy realizations_owner on public.realizations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy sales_arguments_owner on public.sales_arguments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Tables qui référencent une autre table : la ligne référencée doit aussi
-- appartenir à l'utilisateur (impossible de se lier aux données d'un autre compte).
create policy sales_methods_owner on public.sales_methods
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      source_id is null
      or exists (
        select 1 from public.sources s
        where s.id = source_id and s.user_id = (select auth.uid())
      )
    )
  );

create policy sales_method_steps_owner on public.sales_method_steps
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.sales_methods m
      where m.id = method_id and m.user_id = (select auth.uid())
    )
  );

create policy objections_owner on public.objections
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      method_id is null
      or exists (
        select 1 from public.sales_methods m
        where m.id = method_id and m.user_id = (select auth.uid())
      )
    )
  );

create policy commercial_rules_owner on public.commercial_rules
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      source_id is null
      or exists (
        select 1 from public.sources s
        where s.id = source_id and s.user_id = (select auth.uid())
      )
    )
  );

-- --------------------------------- droits ----------------------------------
revoke all on
  public.sources, public.sales_methods, public.sales_method_steps, public.offers,
  public.realizations, public.sales_arguments, public.objections, public.commercial_rules
  from anon;

grant select, insert, update, delete on
  public.sources, public.sales_methods, public.sales_method_steps, public.offers,
  public.realizations, public.sales_arguments, public.objections, public.commercial_rules
  to authenticated;
