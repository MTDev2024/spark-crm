-- ============================================================================
-- Schéma de base : prospects, actions, interactions, données prospect.
--
-- Principes :
--  * Chaque ligne appartient à un utilisateur (colonne user_id, remplie
--    automatiquement avec l'utilisateur connecté).
--  * La sécurité par ligne (RLS) garantit qu'un utilisateur ne voit et ne
--    modifie QUE ses propres lignes. Elle est activée sur chaque table.
--  * « Exposer automatiquement les nouvelles tables » étant désactivé sur le
--    projet, les droits d'accès sont accordés explicitement en bas de fichier,
--    uniquement au rôle des utilisateurs connectés (authenticated).
--  * Les valeurs inconnues sont NULL : aucune valeur par défaut inventée.
--  * Les colonnes limitées à quelques valeurs ont une contrainte CHECK, qui
--    reprend exactement les types de src/types/domain.ts.
-- ============================================================================

-- ------------------------------- prospects ---------------------------------
create table public.prospects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company      text not null check (length(trim(company)) > 0),
  contact_name text,
  contact_role text,
  activity     text,
  category     text,
  address      text,
  city         text,
  phone        text,
  email        text,
  created_at   timestamptz not null default now()
);

-- -------------------------------- actions ----------------------------------
create table public.actions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  type        text not null check (type in
                ('call', 'visit', 'email', 'message', 'follow_up', 'meeting', 'qualify', 'other')),
  objective   text not null check (length(trim(objective)) > 0),
  reason      text,
  due_at      date,                       -- NULL = sans échéance
  priority    text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  done_at     date,                       -- NULL = encore à faire
  created_at  timestamptz not null default now()
);

-- ------------------------------ interactions -------------------------------
create table public.interactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  prospect_id      uuid not null references public.prospects (id) on delete cascade,
  occurred_at      date not null,
  channel          text not null check (channel in ('phone', 'visit', 'email', 'message', 'meeting')),
  objective        text,
  outcome          text,
  notes            text,
  -- Si l'action liée est supprimée, l'interaction est conservée (historique).
  next_action_id   uuid references public.actions (id) on delete set null,
  -- Règle produit : une interaction débouche sur une action OU sur « aucune »
  -- choisi explicitement. Les deux à la fois n'ont pas de sens.
  no_next_action   boolean not null default false,
  created_at       timestamptz not null default now(),
  check (not (no_next_action and next_action_id is not null))
);

-- ------------------------------- data_points -------------------------------
create table public.data_points (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  prospect_id  uuid not null references public.prospects (id) on delete cascade,
  key          text not null check (length(trim(key)) > 0),   -- libellé libre
  value        text,                                          -- NULL = inconnu
  kind         text not null check (kind in ('fact', 'signal', 'hypothesis')),
  status       text not null check (status in
                 ('confirmed', 'to_verify', 'missing', 'searched_not_found', 'not_applicable')),
  source       text,
  collected_at date,
  verified_at  date,
  confidence   numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  created_at   timestamptz not null default now(),
  -- Ne pas inventer : confirmé / à vérifier exigent une valeur.
  check (status not in ('confirmed', 'to_verify') or value is not null)
);

-- -------------------------------- index ------------------------------------
create index prospects_user_idx     on public.prospects (user_id, created_at desc);
create index actions_user_due_idx   on public.actions (user_id, due_at) where done_at is null;
create index actions_prospect_idx   on public.actions (prospect_id);
create index interactions_prospect_idx on public.interactions (prospect_id, occurred_at desc);
create index data_points_prospect_idx  on public.data_points (prospect_id);

-- ---------------------- sécurité par ligne (RLS) ---------------------------
alter table public.prospects    enable row level security;
alter table public.actions      enable row level security;
alter table public.interactions enable row level security;
alter table public.data_points  enable row level security;

-- Prospects : l'utilisateur gère uniquement les siens.
create policy prospects_owner on public.prospects
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Tables enfants : en plus d'appartenir à l'utilisateur, la ligne doit
-- référencer un prospect qui lui appartient aussi (impossible de rattacher
-- une action au prospect d'un autre compte).
create policy actions_owner on public.actions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.prospects p
      where p.id = prospect_id and p.user_id = (select auth.uid())
    )
  );

create policy interactions_owner on public.interactions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.prospects p
      where p.id = prospect_id and p.user_id = (select auth.uid())
    )
    and (
      next_action_id is null
      or exists (
        select 1 from public.actions a
        where a.id = next_action_id and a.user_id = (select auth.uid())
      )
    )
  );

create policy data_points_owner on public.data_points
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.prospects p
      where p.id = prospect_id and p.user_id = (select auth.uid())
    )
  );

-- ------------------------------- droits ------------------------------------
-- Aucun accès pour les visiteurs non connectés (anon). Accès complet, filtré
-- par les politiques ci-dessus, pour les utilisateurs connectés.
revoke all on public.prospects, public.actions, public.interactions, public.data_points from anon;

grant select, insert, update, delete
  on public.prospects, public.actions, public.interactions, public.data_points
  to authenticated;
