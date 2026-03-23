-- ============================================================
-- XP & Levels System
-- Tables: user_xp, xp_events
-- Function: award_xp(p_user_id, p_source, p_metadata)
-- Triggers: reviews, user_badges, review_helpful_votes
-- ============================================================

-- ── Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp      INT         NOT NULL DEFAULT 0,
  current_level INT         NOT NULL DEFAULT 1,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.xp_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source      TEXT        NOT NULL,
  xp_amount   INT         NOT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS xp_events_user_id_idx ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS xp_events_created_at_idx ON public.xp_events(created_at DESC);

-- ── RLS ───────────────────────────────────────────────────

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- user_xp: anyone can read (public profiles), only service role writes
CREATE POLICY "user_xp_select_public"  ON public.user_xp FOR SELECT USING (true);
CREATE POLICY "user_xp_insert_service" ON public.user_xp FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "user_xp_update_service" ON public.user_xp FOR UPDATE TO service_role USING (true);

-- xp_events: user can read own events, service role writes
CREATE POLICY "xp_events_select_own"    ON public.xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "xp_events_insert_service" ON public.xp_events FOR INSERT TO service_role WITH CHECK (true);

-- ── Level curve helper ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.xp_required_for_level(p_level INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT FLOOR(100 * POWER(p_level::FLOAT, 1.5))::INT;
$$;

-- ── award_xp function ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_source  TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp_amount     INT;
  v_current_total INT := 0;
  v_current_level INT := 1;
  v_new_total     INT;
  v_new_level     INT;
  v_accumulated   INT;
  v_level         INT;
BEGIN
  -- XP table
  v_xp_amount := CASE p_source
    WHEN 'first_review'           THEN 100
    WHEN 'review_submitted'       THEN 20
    WHEN 'review_with_photo'      THEN 10
    WHEN 'photo_added'            THEN 5
    WHEN 'helpful_vote_received'  THEN 15
    WHEN 'streak_day'             THEN 5
    WHEN 'streak_milestone'       THEN 50
    WHEN 'badge_earned'           THEN 30
    WHEN 'challenge_complete'     THEN COALESCE((p_metadata->>'reward_xp')::INT, 25)
    ELSE NULL
  END;

  IF v_xp_amount IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unknown_source');
  END IF;

  -- Get current state, creating row if absent
  INSERT INTO public.user_xp(user_id, total_xp, current_level)
    VALUES (p_user_id, 0, 1)
    ON CONFLICT (user_id) DO NOTHING;

  SELECT total_xp, current_level
    INTO v_current_total, v_current_level
    FROM public.user_xp
   WHERE user_id = p_user_id;

  v_new_total := v_current_total + v_xp_amount;

  -- Compute new level from accumulated XP
  v_level       := 1;
  v_accumulated := 0;
  LOOP
    EXIT WHEN v_accumulated + public.xp_required_for_level(v_level) > v_new_total;
    v_accumulated := v_accumulated + public.xp_required_for_level(v_level);
    v_level       := v_level + 1;
  END LOOP;
  v_new_level := v_level;

  -- Persist
  UPDATE public.user_xp
     SET total_xp      = v_new_total,
         current_level = v_new_level,
         updated_at    = NOW()
   WHERE user_id = p_user_id;

  INSERT INTO public.xp_events(user_id, source, xp_amount, metadata)
    VALUES (p_user_id, p_source, v_xp_amount, p_metadata);

  -- Level-up notification
  IF v_new_level > v_current_level THEN
    INSERT INTO public.notifications(user_id, type, title, message, metadata)
      VALUES (
        p_user_id,
        'level_up',
        'Level up!',
        'You reached Level ' || v_new_level || '!',
        jsonb_build_object('new_level', v_new_level, 'previous_level', v_current_level)
      );
  END IF;

  RETURN jsonb_build_object(
    'ok',         true,
    'xp_awarded', v_xp_amount,
    'new_total',  v_new_total,
    'new_level',  v_new_level,
    'leveled_up', v_new_level > v_current_level
  );
END;
$$;

-- ── Triggers ──────────────────────────────────────────────

-- After review insert: award review XP (+ first_review bonus + photo bonus)
CREATE OR REPLACE FUNCTION public._xp_on_review_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_review_count INT;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  -- Count reviews before this one to detect first review
  SELECT COUNT(*) INTO v_review_count
    FROM public.reviews
   WHERE user_id = NEW.user_id AND id != NEW.id;

  IF v_review_count = 0 THEN
    PERFORM public.award_xp(NEW.user_id, 'first_review', jsonb_build_object('review_id', NEW.id));
  END IF;

  PERFORM public.award_xp(NEW.user_id, 'review_submitted', jsonb_build_object('review_id', NEW.id));

  -- Bonus if review has photos (photos column is JSONB array or similar)
  IF (NEW.photos IS NOT NULL AND jsonb_array_length(COALESCE(NEW.photos, '[]'::jsonb)) > 0) THEN
    PERFORM public.award_xp(NEW.user_id, 'review_with_photo', jsonb_build_object('review_id', NEW.id));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS xp_on_review_insert ON public.reviews;
CREATE TRIGGER xp_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public._xp_on_review_insert();

-- After badge awarded: award badge XP
CREATE OR REPLACE FUNCTION public._xp_on_badge_awarded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  PERFORM public.award_xp(
    NEW.user_id,
    'badge_earned',
    jsonb_build_object('badge_id', NEW.badge_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS xp_on_badge_awarded ON public.user_badges;
CREATE TRIGGER xp_on_badge_awarded
  AFTER INSERT ON public.user_badges
  FOR EACH ROW EXECUTE FUNCTION public._xp_on_badge_awarded();

-- After helpful vote: award XP to the review author
CREATE OR REPLACE FUNCTION public._xp_on_helpful_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT user_id INTO v_author_id FROM public.reviews WHERE id = NEW.review_id;
  IF v_author_id IS NULL THEN RETURN NEW; END IF;
  IF v_author_id = NEW.user_id THEN RETURN NEW; END IF; -- no self-voting XP
  PERFORM public.award_xp(
    v_author_id,
    'helpful_vote_received',
    jsonb_build_object('review_id', NEW.review_id, 'voter_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS xp_on_helpful_vote ON public.review_helpful_votes;
CREATE TRIGGER xp_on_helpful_vote
  AFTER INSERT ON public.review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public._xp_on_helpful_vote();

-- ── Realtime ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_xp;
