-- Fix update_business_stats RPC to match tags case-insensitively.
-- The review form saves tags with mixed case (e.g. "Friendly", "On Time")
-- but seed reviews use lowercase. Using unnest + lower() covers both.

CREATE OR REPLACE FUNCTION public.update_business_stats(p_business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calc_total_reviews INTEGER;
  calc_average_rating DECIMAL(3,2);
  rating_dist JSONB;
  percentiles JSONB;
  business_category TEXT;

  punctuality_score DECIMAL := 50.0;
  friendliness_score DECIMAL := 50.0;
  trustworthiness_score DECIMAL := 50.0;
  cost_effectiveness_score DECIMAL := 50.0;

  category_avg_rating DECIMAL;
  category_business_count INTEGER;
  category_percentile_rank DECIMAL := 50.0;

  category_punctuality_percentile DECIMAL := 50.0;
  category_friendliness_percentile DECIMAL := 50.0;
  category_trustworthiness_percentile DECIMAL := 50.0;
  category_cost_effectiveness_percentile DECIMAL := 50.0;

  punctuality_percentile DECIMAL;
  friendliness_percentile DECIMAL;
  trustworthiness_percentile DECIMAL;
  cost_effectiveness_percentile DECIMAL;
BEGIN
  SELECT primary_subcategory_slug INTO business_category
  FROM businesses WHERE id = p_business_id;

  SELECT
    COUNT(*)::INTEGER,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
  INTO calc_total_reviews, calc_average_rating
  FROM reviews WHERE business_id = p_business_id;

  SELECT jsonb_build_object(
    '1', COUNT(*) FILTER (WHERE rating = 1),
    '2', COUNT(*) FILTER (WHERE rating = 2),
    '3', COUNT(*) FILTER (WHERE rating = 3),
    '4', COUNT(*) FILTER (WHERE rating = 4),
    '5', COUNT(*) FILTER (WHERE rating = 5)
  ) INTO rating_dist
  FROM reviews WHERE business_id = p_business_id;

  rating_dist := COALESCE(rating_dist, jsonb_build_object('1',0,'2',0,'3',0,'4',0,'5',0));

  IF calc_total_reviews = 0 THEN
    calc_average_rating := 0;
    percentiles := jsonb_build_object(
      'punctuality', 0, 'friendliness', 0, 'trustworthiness', 0, 'cost-effectiveness', 0
    );
  ELSE
    -- Punctuality: case-insensitive match on 'on time' / 'on-time'
    SELECT CASE WHEN COUNT(*) = 0 THEN 50.0 ELSE GREATEST(0, LEAST(100,
      ROUND((COUNT(*) FILTER (WHERE lower(tag) IN ('on time','on-time'))::DECIMAL / COUNT(*)::DECIMAL) * 100, 0)
    )) END
    INTO punctuality_score
    FROM reviews, unnest(tags) AS tag
    WHERE business_id = p_business_id;

    -- Friendliness: case-insensitive match on 'friendly'
    SELECT CASE WHEN COUNT(*) = 0 THEN 50.0 ELSE GREATEST(0, LEAST(100,
      ROUND((COUNT(*) FILTER (WHERE lower(tag) = 'friendly')::DECIMAL / COUNT(*)::DECIMAL) * 100, 0)
    )) END
    INTO friendliness_score
    FROM reviews, unnest(tags) AS tag
    WHERE business_id = p_business_id;

    -- Trustworthiness: case-insensitive match on 'trustworthy'
    SELECT CASE WHEN COUNT(*) = 0 THEN 50.0 ELSE GREATEST(0, LEAST(100,
      ROUND((COUNT(*) FILTER (WHERE lower(tag) = 'trustworthy')::DECIMAL / COUNT(*)::DECIMAL) * 100, 0)
    )) END
    INTO trustworthiness_score
    FROM reviews, unnest(tags) AS tag
    WHERE business_id = p_business_id;

    -- Cost effectiveness: case-insensitive match on 'good value' / 'good-value'
    SELECT CASE WHEN COUNT(*) = 0 THEN 50.0 ELSE GREATEST(0, LEAST(100,
      ROUND((COUNT(*) FILTER (WHERE lower(tag) IN ('good value','good-value'))::DECIMAL / COUNT(*)::DECIMAL) * 100, 0)
    )) END
    INTO cost_effectiveness_score
    FROM reviews, unnest(tags) AS tag
    WHERE business_id = p_business_id;

    -- Category comparison
    IF business_category IS NOT NULL AND calc_total_reviews > 0 THEN
      SELECT
        COALESCE(ROUND(AVG(bs.average_rating)::numeric, 2), 0),
        COUNT(DISTINCT b.id)::INTEGER
      INTO category_avg_rating, category_business_count
      FROM businesses b
      LEFT JOIN business_stats bs ON b.id = bs.business_id
      WHERE b.primary_subcategory_slug = business_category
        AND b.status = 'active'
        AND bs.total_reviews > 0;

      SELECT CASE
        WHEN category_business_count <= 1 THEN 50.0
        ELSE GREATEST(0, LEAST(100, ROUND(
          ((SELECT COUNT(*)::DECIMAL FROM businesses b2
            LEFT JOIN business_stats bs2 ON b2.id = bs2.business_id
            WHERE b2.primary_subcategory_slug = business_category
              AND b2.status = 'active'
              AND b2.id != p_business_id
              AND bs2.total_reviews > 0
              AND bs2.average_rating < calc_average_rating
          ) / GREATEST(category_business_count - 1, 1)::DECIMAL) * 100, 0
        )))
      END INTO category_percentile_rank;

      category_percentile_rank := COALESCE(category_percentile_rank, 50.0);
    ELSE
      category_percentile_rank := 50.0;
    END IF;

    IF business_category IS NOT NULL AND category_business_count > 1 THEN
      WITH cat AS (
        SELECT b.id,
          (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE
            (COUNT(*) FILTER (WHERE lower(tag) IN ('on time','on-time'))::DECIMAL / COUNT(*)::DECIMAL) * 100
          END FROM reviews r2, unnest(r2.tags) AS tag WHERE r2.business_id = b.id) AS score
        FROM businesses b
        LEFT JOIN business_stats bs ON b.id = bs.business_id
        WHERE b.primary_subcategory_slug = business_category AND b.status = 'active'
          AND b.id != p_business_id AND bs.total_reviews > 0
      )
      SELECT GREATEST(0, LEAST(100, ROUND(
        (SELECT COUNT(*)::DECIMAL FROM cat WHERE score < punctuality_score)
        / GREATEST(category_business_count - 1, 1)::DECIMAL * 100, 0
      ))) INTO category_punctuality_percentile;

      WITH cat AS (
        SELECT b.id,
          (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE
            (COUNT(*) FILTER (WHERE lower(tag) = 'friendly')::DECIMAL / COUNT(*)::DECIMAL) * 100
          END FROM reviews r2, unnest(r2.tags) AS tag WHERE r2.business_id = b.id) AS score
        FROM businesses b
        LEFT JOIN business_stats bs ON b.id = bs.business_id
        WHERE b.primary_subcategory_slug = business_category AND b.status = 'active'
          AND b.id != p_business_id AND bs.total_reviews > 0
      )
      SELECT GREATEST(0, LEAST(100, ROUND(
        (SELECT COUNT(*)::DECIMAL FROM cat WHERE score < friendliness_score)
        / GREATEST(category_business_count - 1, 1)::DECIMAL * 100, 0
      ))) INTO category_friendliness_percentile;

      WITH cat AS (
        SELECT b.id,
          (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE
            (COUNT(*) FILTER (WHERE lower(tag) = 'trustworthy')::DECIMAL / COUNT(*)::DECIMAL) * 100
          END FROM reviews r2, unnest(r2.tags) AS tag WHERE r2.business_id = b.id) AS score
        FROM businesses b
        LEFT JOIN business_stats bs ON b.id = bs.business_id
        WHERE b.primary_subcategory_slug = business_category AND b.status = 'active'
          AND b.id != p_business_id AND bs.total_reviews > 0
      )
      SELECT GREATEST(0, LEAST(100, ROUND(
        (SELECT COUNT(*)::DECIMAL FROM cat WHERE score < trustworthiness_score)
        / GREATEST(category_business_count - 1, 1)::DECIMAL * 100, 0
      ))) INTO category_trustworthiness_percentile;

      WITH cat AS (
        SELECT b.id,
          (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE
            (COUNT(*) FILTER (WHERE lower(tag) IN ('good value','good-value'))::DECIMAL / COUNT(*)::DECIMAL) * 100
          END FROM reviews r2, unnest(r2.tags) AS tag WHERE r2.business_id = b.id) AS score
        FROM businesses b
        LEFT JOIN business_stats bs ON b.id = bs.business_id
        WHERE b.primary_subcategory_slug = business_category AND b.status = 'active'
          AND b.id != p_business_id AND bs.total_reviews > 0
      )
      SELECT GREATEST(0, LEAST(100, ROUND(
        (SELECT COUNT(*)::DECIMAL FROM cat WHERE score < cost_effectiveness_score)
        / GREATEST(category_business_count - 1, 1)::DECIMAL * 100, 0
      ))) INTO category_cost_effectiveness_percentile;

      category_punctuality_percentile        := COALESCE(category_punctuality_percentile, 50.0);
      category_friendliness_percentile       := COALESCE(category_friendliness_percentile, 50.0);
      category_trustworthiness_percentile    := COALESCE(category_trustworthiness_percentile, 50.0);
      category_cost_effectiveness_percentile := COALESCE(category_cost_effectiveness_percentile, 50.0);
    END IF;

    punctuality_percentile        := GREATEST(0, LEAST(100, ROUND(punctuality_score * 0.6        + category_punctuality_percentile * 0.4, 0)));
    friendliness_percentile       := GREATEST(0, LEAST(100, ROUND(friendliness_score * 0.6       + category_friendliness_percentile * 0.4, 0)));
    trustworthiness_percentile    := GREATEST(0, LEAST(100, ROUND(trustworthiness_score * 0.6    + category_trustworthiness_percentile * 0.4, 0)));
    cost_effectiveness_percentile := GREATEST(0, LEAST(100, ROUND(cost_effectiveness_score * 0.6 + category_cost_effectiveness_percentile * 0.4, 0)));

    percentiles := jsonb_build_object(
      'punctuality',        punctuality_percentile,
      'friendliness',       friendliness_percentile,
      'trustworthiness',    trustworthiness_percentile,
      'cost-effectiveness', cost_effectiveness_percentile
    );
  END IF;

  INSERT INTO business_stats (business_id, total_reviews, average_rating, rating_distribution, percentiles, updated_at)
  VALUES (p_business_id, calc_total_reviews, calc_average_rating, rating_dist, percentiles, NOW())
  ON CONFLICT (business_id) DO UPDATE SET
    total_reviews       = EXCLUDED.total_reviews,
    average_rating      = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    percentiles         = EXCLUDED.percentiles,
    updated_at          = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_business_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_business_stats(UUID) TO service_role;
NOTIFY pgrst, 'reload schema';
