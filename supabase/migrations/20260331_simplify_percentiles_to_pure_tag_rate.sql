-- Simplify percentile calculation to pure tag rate
-- Score = (reviews with tag / total reviews) * 100
-- 1 review with tag → 100%, 14/20 reviews with tag → 70%, etc.
-- Removes category comparison blend which was distorting honest scores

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

  punctuality_percentile DECIMAL;
  friendliness_percentile DECIMAL;
  trustworthiness_percentile DECIMAL;
  cost_effectiveness_percentile DECIMAL;
BEGIN
  -- Aggregate review data
  SELECT
    COUNT(*)::INTEGER,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
  INTO
    calc_total_reviews,
    calc_average_rating
  FROM reviews
  WHERE business_id = p_business_id;

  SELECT jsonb_build_object(
    '1', COUNT(*) FILTER (WHERE rating = 1),
    '2', COUNT(*) FILTER (WHERE rating = 2),
    '3', COUNT(*) FILTER (WHERE rating = 3),
    '4', COUNT(*) FILTER (WHERE rating = 4),
    '5', COUNT(*) FILTER (WHERE rating = 5)
  )
  INTO rating_dist
  FROM reviews
  WHERE business_id = p_business_id;

  rating_dist := COALESCE(
    rating_dist,
    jsonb_build_object('1', 0, '2', 0, '3', 0, '4', 0, '5', 0)
  );

  IF calc_total_reviews = 0 THEN
    calc_average_rating := 0;
    percentiles := jsonb_build_object(
      'punctuality', 0,
      'friendliness', 0,
      'trustworthiness', 0,
      'cost-effectiveness', 0
    );
  ELSE
    -- ============================================
    -- PURE TAG RATE PERCENTILES
    -- Score = (reviews with tag / total reviews) * 100
    -- 1 review with tag → 100%
    -- 14 out of 20 reviews with tag → 70%
    -- ============================================

    SELECT GREATEST(0, LEAST(100,
      ROUND(
        (COUNT(*) FILTER (WHERE 'On Time' = ANY(tags))::DECIMAL / calc_total_reviews::DECIMAL) * 100,
        0
      )
    ))
    INTO punctuality_percentile
    FROM reviews
    WHERE business_id = p_business_id;

    SELECT GREATEST(0, LEAST(100,
      ROUND(
        (COUNT(*) FILTER (WHERE 'Friendly' = ANY(tags))::DECIMAL / calc_total_reviews::DECIMAL) * 100,
        0
      )
    ))
    INTO friendliness_percentile
    FROM reviews
    WHERE business_id = p_business_id;

    SELECT GREATEST(0, LEAST(100,
      ROUND(
        (COUNT(*) FILTER (WHERE 'Trustworthy' = ANY(tags))::DECIMAL / calc_total_reviews::DECIMAL) * 100,
        0
      )
    ))
    INTO trustworthiness_percentile
    FROM reviews
    WHERE business_id = p_business_id;

    SELECT GREATEST(0, LEAST(100,
      ROUND(
        (COUNT(*) FILTER (WHERE 'Good Value' = ANY(tags))::DECIMAL / calc_total_reviews::DECIMAL) * 100,
        0
      )
    ))
    INTO cost_effectiveness_percentile
    FROM reviews
    WHERE business_id = p_business_id;

    percentiles := jsonb_build_object(
      'punctuality',        COALESCE(punctuality_percentile, 0),
      'friendliness',       COALESCE(friendliness_percentile, 0),
      'trustworthiness',    COALESCE(trustworthiness_percentile, 0),
      'cost-effectiveness', COALESCE(cost_effectiveness_percentile, 0)
    );
  END IF;

  INSERT INTO business_stats (
    business_id,
    total_reviews,
    average_rating,
    rating_distribution,
    percentiles,
    updated_at
  )
  VALUES (
    p_business_id,
    calc_total_reviews,
    calc_average_rating,
    rating_dist,
    percentiles,
    NOW()
  )
  ON CONFLICT (business_id) DO UPDATE
  SET
    total_reviews      = EXCLUDED.total_reviews,
    average_rating     = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    percentiles        = EXCLUDED.percentiles,
    updated_at         = NOW();
END;
$$;

-- Allow authenticated and service roles to execute the function
GRANT EXECUTE ON FUNCTION public.update_business_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_business_stats(UUID) TO service_role;

-- Backfill all active businesses so existing data reflects the new calculation
DO $$
DECLARE
  business_record RECORD;
  processed_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Backfilling percentiles with pure tag rate calculation...';

  FOR business_record IN
    SELECT DISTINCT b.id, b.name
    FROM businesses b
    INNER JOIN reviews r ON r.business_id = b.id
    WHERE b.status = 'active'
    ORDER BY b.id
  LOOP
    BEGIN
      PERFORM update_business_stats(business_record.id);
      processed_count := processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Error processing business % (%): %', business_record.id, business_record.name, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Backfill complete: % processed, % errors', processed_count, error_count;
END $$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
