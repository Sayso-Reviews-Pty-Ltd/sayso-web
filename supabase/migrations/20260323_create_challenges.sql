-- ============================================================
-- Weekly Challenges System
-- Tables: challenges, user_challenge_progress
-- Function: update_challenge_progress(p_user_id, p_review_id)
-- Trigger: AFTER INSERT on reviews
-- ============================================================

-- ── Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.challenges (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  description      TEXT        NOT NULL,
  rule_type        TEXT        NOT NULL,
  category_key     TEXT,
  target           INT         NOT NULL DEFAULT 1,
  reward_xp        INT         NOT NULL DEFAULT 25,
  reward_badge_id  UUID        REFERENCES public.badges(id) ON DELETE SET NULL,
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  is_active        BOOL        NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS challenges_active_idx ON public.challenges(is_active, ends_at);

CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id  UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress      INT         NOT NULL DEFAULT 0,
  completed     BOOL        NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS ucp_user_id_idx ON public.user_challenge_progress(user_id);

-- ── RLS ───────────────────────────────────────────────────

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Challenges are public to read
CREATE POLICY "challenges_select_public" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "challenges_insert_service" ON public.challenges FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "challenges_update_service" ON public.challenges FOR UPDATE TO service_role USING (true);

-- User challenge progress: own rows only
CREATE POLICY "ucp_select_own"    ON public.user_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ucp_insert_service" ON public.user_challenge_progress FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "ucp_update_service" ON public.user_challenge_progress FOR UPDATE TO service_role USING (true);

-- ── update_challenge_progress ─────────────────────────────

CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  p_user_id   UUID,
  p_review_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge        RECORD;
  v_row              public.user_challenge_progress%ROWTYPE;
  v_review           RECORD;
  v_new_progress     INT;
  v_distinct_count   INT;
BEGIN
  -- Fetch review details
  SELECT primary_category, photos FROM public.reviews WHERE id = p_review_id INTO v_review;

  FOR v_challenge IN
    SELECT * FROM public.challenges WHERE is_active = true AND ends_at > NOW()
  LOOP
    -- Get or init progress row
    SELECT * INTO v_row
      FROM public.user_challenge_progress
     WHERE user_id = p_user_id AND challenge_id = v_challenge.id;

    IF NOT FOUND THEN
      INSERT INTO public.user_challenge_progress(user_id, challenge_id, progress, completed, updated_at)
        VALUES (p_user_id, v_challenge.id, 0, false, NOW())
        ON CONFLICT DO NOTHING;
      v_row.progress  := 0;
      v_row.completed := false;
    END IF;

    IF v_row.completed THEN CONTINUE; END IF;

    v_new_progress := v_row.progress;

    CASE v_challenge.rule_type
      WHEN 'review_count' THEN
        IF v_challenge.category_key IS NULL OR v_review.primary_category = v_challenge.category_key THEN
          v_new_progress := v_row.progress + 1;
        END IF;

      WHEN 'photo_count' THEN
        IF v_review.photos IS NOT NULL AND jsonb_array_length(COALESCE(v_review.photos, '[]'::jsonb)) > 0 THEN
          v_new_progress := v_row.progress + jsonb_array_length(v_review.photos);
        END IF;

      WHEN 'category_count' THEN
        -- Count distinct categories reviewed this week
        SELECT COUNT(DISTINCT r.primary_category)
          INTO v_distinct_count
          FROM public.reviews r
         WHERE r.user_id = p_user_id
           AND r.created_at >= v_challenge.starts_at
           AND r.primary_category IS NOT NULL;
        v_new_progress := v_distinct_count;

      WHEN 'helpful_votes' THEN
        -- Progress is updated via the helpful_votes trigger separately
        CONTINUE;

      ELSE
        CONTINUE;
    END CASE;

    IF v_new_progress = v_row.progress THEN CONTINUE; END IF;

    UPDATE public.user_challenge_progress
       SET progress   = v_new_progress,
           updated_at = NOW()
     WHERE user_id = p_user_id AND challenge_id = v_challenge.id;

    -- Check completion
    IF v_new_progress >= v_challenge.target THEN
      UPDATE public.user_challenge_progress
         SET completed    = true,
             completed_at = NOW()
       WHERE user_id = p_user_id AND challenge_id = v_challenge.id;

      -- Award XP
      PERFORM public.award_xp(
        p_user_id,
        'challenge_complete',
        jsonb_build_object('challenge_id', v_challenge.id, 'reward_xp', v_challenge.reward_xp)
      );

      -- Notification
      INSERT INTO public.notifications(user_id, type, title, message, metadata)
        VALUES (
          p_user_id, 'challenge_complete',
          'Challenge complete!',
          'You completed "' || v_challenge.title || '"! +' || v_challenge.reward_xp || ' XP',
          jsonb_build_object('challenge_id', v_challenge.id)
        );
    END IF;
  END LOOP;
END;
$$;

-- ── Trigger ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public._challenge_on_review_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  PERFORM public.update_challenge_progress(NEW.user_id, NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS challenge_on_review_insert ON public.reviews;
CREATE TRIGGER challenge_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public._challenge_on_review_insert();
