-- For You BOTM-style diversification wrapper.
-- Strategy: subcategory-rounds first, then enforce parent-category caps in
-- the front of the list, then backfill overflow to preserve row count.

create or replace function public.recommend_for_you_unified_category_rr(
  p_interest_ids text[] default array[]::text[],
  p_sub_interest_ids text[] default array[]::text[],
  p_dealbreaker_ids text[] default array[]::text[],
  p_price_ranges text[] default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_limit integer default 40,
  p_seed text default null
)
returns table (
  id uuid,
  name text,
  description text,
  category text,
  interest_id text,
  sub_interest_id text,
  location text,
  address text,
  phone text,
  email text,
  website text,
  image_url text,
  verified boolean,
  price_range text,
  badge text,
  slug text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz,
  updated_at timestamptz,
  total_reviews integer,
  average_rating numeric,
  percentiles jsonb,
  uploaded_images text[],
  personalization_score double precision,
  diversity_rank integer,
  source text
)
language sql
stable
security definer
set search_path = public
as $$
with base as (
  select *
  from public.recommend_for_you_unified(
    p_interest_ids,
    p_sub_interest_ids,
    p_dealbreaker_ids,
    p_price_ranges,
    p_latitude,
    p_longitude,
    greatest(p_limit * 5, p_limit + 40, 60),
    p_seed
  )
),
scored as (
  select
    b.*,
    coalesce(nullif(lower(trim(b.sub_interest_id)), ''), nullif(lower(trim(b.category)), ''), 'miscellaneous') as subcategory_key,
    coalesce(nullif(lower(trim(b.interest_id)), ''), 'miscellaneous') as category_key,
    coalesce(b.personalization_score, 0) as score,
    coalesce(b.diversity_rank, 2147483647) as base_rank
  from base b
),
sub_ranked as (
  select
    s.*,
    row_number() over (
      partition by s.subcategory_key
      order by s.score desc, s.base_rank, s.id
    ) as sub_rank
  from scored s
),
ordered as (
  select
    sr.*,
    row_number() over (
      order by sr.sub_rank, sr.score desc, sr.base_rank, sr.id
    ) as selection_rank
  from sub_ranked sr
),
capped as (
  select
    o.*,
    row_number() over (
      partition by o.category_key
      order by o.selection_rank
    ) as category_pick_rank
  from ordered o
),
merged as (
  select c.*, false as is_overflow
  from capped c
  where c.category_pick_rank <= 3

  union all

  select c.*, true as is_overflow
  from capped c
  where c.category_pick_rank > 3
),
ranked as (
  select
    m.*,
    row_number() over (
      order by m.is_overflow asc, m.selection_rank
    ) as final_rank
  from merged m
)
select
  r.id,
  r.name,
  r.description,
  r.category,
  r.interest_id,
  r.sub_interest_id,
  r.location,
  r.address,
  r.phone,
  r.email,
  r.website,
  r.image_url,
  r.verified,
  r.price_range,
  r.badge,
  r.slug,
  r.latitude,
  r.longitude,
  r.created_at,
  r.updated_at,
  r.total_reviews,
  r.average_rating,
  r.percentiles,
  r.uploaded_images,
  r.personalization_score,
  r.final_rank::integer as diversity_rank,
  r.source
from ranked r
order by r.final_rank
limit greatest(p_limit, 1);
$$;

comment on function public.recommend_for_you_unified_category_rr(
  text[], text[], text[], text[], double precision, double precision, integer, text
) is
'BOTM-style For You diversification: subcategory rounds first, then parent-category cap (3) for primary slots, then overflow backfill to retain full result size.';

grant execute on function public.recommend_for_you_unified_category_rr(
  text[], text[], text[], text[], double precision, double precision, integer, text
) to authenticated;

grant execute on function public.recommend_for_you_unified_category_rr(
  text[], text[], text[], text[], double precision, double precision, integer, text
) to anon;
