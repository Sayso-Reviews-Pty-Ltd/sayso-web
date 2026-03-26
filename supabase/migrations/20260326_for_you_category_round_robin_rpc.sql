-- Category round-robin wrapper for unified For You feed.
-- Ensures adjacent businesses are not from the same category whenever alternatives exist.

create or replace function public.recommend_for_you_unified_category_rr(
  p_interest_ids      text[]            default array[]::text[],
  p_sub_interest_ids  text[]            default array[]::text[],
  p_dealbreaker_ids   text[]            default array[]::text[],
  p_price_ranges      text[]            default null,
  p_latitude          double precision  default null,
  p_longitude         double precision  default null,
  p_limit             integer           default 40,
  p_seed              text              default null
)
returns table (
  id                    uuid,
  name                  text,
  description           text,
  category              text,
  interest_id           text,
  sub_interest_id       text,
  location              text,
  address               text,
  phone                 text,
  email                 text,
  website               text,
  image_url             text,
  verified              boolean,
  price_range           text,
  badge                 text,
  slug                  text,
  latitude              double precision,
  longitude             double precision,
  created_at            timestamptz,
  updated_at            timestamptz,
  total_reviews         integer,
  average_rating        numeric,
  percentiles           jsonb,
  uploaded_images       text[],
  personalization_score double precision,
  diversity_rank        integer,
  source                text
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
seeded as (
  select
    b.*,
    coalesce(nullif(lower(trim(b.interest_id)), ''), 'miscellaneous') as category_key,
    row_number() over (
      order by
        coalesce(b.diversity_rank, 2147483647),
        coalesce(b.personalization_score, 0) desc,
        b.id
    ) as base_pos
  from base b
),
category_ranked as (
  select
    s.*,
    min(s.base_pos) over (partition by s.category_key) as category_first_pos,
    row_number() over (partition by s.category_key order by s.base_pos) as category_pos
  from seeded s
),
round_robin as (
  select
    c.*,
    row_number() over (
      order by
        c.category_pos,
        c.category_first_pos,
        c.base_pos
    ) as rr_rank
  from category_ranked c
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
  r.rr_rank::integer as diversity_rank,
  r.source
from round_robin r
order by r.rr_rank
limit greatest(p_limit, 1);
$$;

comment on function public.recommend_for_you_unified_category_rr(
  text[],
  text[],
  text[],
  text[],
  double precision,
  double precision,
  integer,
  text
) is
'Wrapper around recommend_for_you_unified that applies category round-robin ordering (by interest_id) so adjacent items are diversified by category while preserving within-category score order.';

grant execute on function public.recommend_for_you_unified_category_rr(
  text[],
  text[],
  text[],
  text[],
  double precision,
  double precision,
  integer,
  text
)
to authenticated;

grant execute on function public.recommend_for_you_unified_category_rr(
  text[],
  text[],
  text[],
  text[],
  double precision,
  double precision,
  integer,
  text
)
to anon;
-- Category round-robin wrapper for unified For You feed.
-- Ensures adjacent businesses are not from the same category whenever alternatives exist.

create or replace function public.recommend_for_you_unified_category_rr(
  p_interest_ids      text[]            default array[]::text[],
  p_sub_interest_ids  text[]            default array[]::text[],
  p_dealbreaker_ids   text[]            default array[]::text[],
  p_price_ranges      text[]            default null,
  p_latitude          double precision  default null,
  p_longitude         double precision  default null,
  p_limit             integer           default 40,
  p_seed              text              default null
)
returns table (
  id                    uuid,
  name                  text,
  description           text,
  category              text,
  interest_id           text,
  sub_interest_id       text,
  location              text,
  address               text,
  phone                 text,
  email                 text,
  website               text,
  image_url             text,
  verified              boolean,
  price_range           text,
  badge                 text,
  slug                  text,
  latitude              double precision,
  longitude             double precision,
  created_at            timestamptz,
  updated_at            timestamptz,
  total_reviews         integer,
  average_rating        numeric,
  percentiles           jsonb,
  uploaded_images       text[],
  personalization_score double precision,
  diversity_rank        integer,
  source                text
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
    greatest(p_limit, 1),
    p_seed
  )
),
seeded as (
  select
    b.*,
    coalesce(nullif(lower(trim(b.interest_id)), ''), 'miscellaneous') as category_key,
    row_number() over (
      order by
        coalesce(b.diversity_rank, 2147483647),
        coalesce(b.personalization_score, 0) desc,
        b.id
    ) as base_pos
  from base b
),
category_ranked as (
  select
    s.*,
    min(s.base_pos) over (partition by s.category_key) as category_first_pos,
    row_number() over (partition by s.category_key order by s.base_pos) as category_pos
  from seeded s
),
round_robin as (
  select
    c.*,
    row_number() over (
      order by
        c.category_pos,
        c.category_first_pos,
        c.base_pos
    ) as rr_rank
  from category_ranked c
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
  r.rr_rank::integer as diversity_rank,
  r.source
from round_robin r
order by r.rr_rank
limit greatest(p_limit, 1);
$$;

comment on function public.recommend_for_you_unified_category_rr(
  text[],
  text[],
  text[],
  text[],
  double precision,
  double precision,
  integer,
  text
) is
'Wrapper around recommend_for_you_unified that applies category round-robin ordering (by interest_id) so adjacent items are diversified by category while preserving within-category score order.';

grant execute on function public.recommend_for_you_unified_category_rr(
  text[],
  text[],
  text[],
  text[],
  double precision,
  double precision,
  integer,
  text
)
to authenticated;

grant execute on function public.recommend_for_you_unified_category_rr(
  text[],
  text[],
  text[],
  text[],
  double precision,
  double precision,
  integer,
  text
)
to anon;
