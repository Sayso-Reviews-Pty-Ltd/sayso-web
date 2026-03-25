CREATE OR REPLACE FUNCTION public.update_challenge_progress(p_user_id uuid, p_review_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_challenge RECORD;
  v_progress_row public.user_challenge_progress%ROWTYPE;
  v_review_category text;
  v_new_progress integer;
  v_distinct_count integer;
  v_photo_count integer;
BEGIN
  SELECT b.primary_category_slug
  INTO v_review_category
  FROM public.reviews r
  LEFT JOIN public.businesses b ON b.id = r.business_id
  WHERE r.id = p_review_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR v_challenge IN
    SELECT *
    FROM public.challenges
    WHERE is_active = true
      AND ends_at > NOW()
  LOOP
    SELECT *
    INTO v_progress_row
    FROM public.user_challenge_progress
    WHERE user_id = p_user_id
      AND challenge_id = v_challenge.id;

    IF NOT FOUND THEN
      INSERT INTO public.user_challenge_progress (user_id, challenge_id, progress, completed, updated_at)
      VALUES (p_user_id, v_challenge.id, 0, false, NOW())
      ON CONFLICT (user_id, challenge_id) DO NOTHING;

      SELECT *
      INTO v_progress_row
      FROM public.user_challenge_progress
      WHERE user_id = p_user_id
        AND challenge_id = v_challenge.id;
    END IF;

    IF COALESCE(v_progress_row.completed, false) THEN
      CONTINUE;
    END IF;

    v_new_progress := COALESCE(v_progress_row.progress, 0);

    CASE v_challenge.rule_type
      WHEN 'review_count' THEN
        IF v_challenge.category_key IS NULL OR v_review_category = v_challenge.category_key THEN
          v_new_progress := COALESCE(v_progress_row.progress, 0) + 1;
        END IF;

      WHEN 'photo_count' THEN
        SELECT COUNT(*)::integer
        INTO v_photo_count
        FROM public.review_images
        WHERE review_id = p_review_id;

        IF COALESCE(v_photo_count, 0) > 0 THEN
          v_new_progress := COALESCE(v_progress_row.progress, 0) + v_photo_count;
        END IF;

      WHEN 'category_count' THEN
        SELECT COUNT(DISTINCT b.primary_category_slug)::integer
        INTO v_distinct_count
        FROM public.reviews r
        INNER JOIN public.businesses b ON b.id = r.business_id
        WHERE r.user_id = p_user_id
          AND r.created_at >= v_challenge.starts_at
          AND b.primary_category_slug IS NOT NULL;

        v_new_progress := COALESCE(v_distinct_count, 0);

      WHEN 'helpful_votes' THEN
        CONTINUE;

      ELSE
        CONTINUE;
    END CASE;

    IF v_new_progress = COALESCE(v_progress_row.progress, 0) THEN
      CONTINUE;
    END IF;

    UPDATE public.user_challenge_progress
    SET progress = v_new_progress,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND challenge_id = v_challenge.id;

    IF v_new_progress >= v_challenge.target THEN
      UPDATE public.user_challenge_progress
      SET completed = true,
          completed_at = COALESCE(completed_at, NOW()),
          updated_at = NOW()
      WHERE user_id = p_user_id
        AND challenge_id = v_challenge.id;

      INSERT INTO public.notifications (user_id, type, title, message, entity_id, link)
      VALUES (
        p_user_id,
        'challenge_complete',
        'Challenge complete!',
        'You completed "' || v_challenge.title || '"!',
        v_challenge.id::text,
        '/challenges'
      );
    END IF;
  END LOOP;
END;
$function$;
