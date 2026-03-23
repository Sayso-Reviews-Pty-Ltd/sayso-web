-- ============================================================
-- Streak System
-- Tables: user_streaks
-- Function: update_streak_on_review(p_user_id)
-- Trigger: AFTER INSERT on reviews
-- Cron: daily 00:05 — consume shields / reset broken streaks
-- ============================================================

-- ── Table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak   INT         NOT NULL DEFAULT 0,
  longest_streak   INT         NOT NULL DEFAULT 0,
  last_review_date DATE,
  shield_active    BOOL        NOT NULL DEFAULT false,
  shield_used_at   TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ───────────────────────────────────────────────────

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_streaks_select_own"    ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_streaks_insert_service" ON public.user_streaks FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "user_streaks_update_service" ON public.user_streaks FOR UPDATE TO service_role USING (true);

-- ── update_streak_on_review ───────────────────────────────

CREATE OR REPLACE FUNCTION public.update_streak_on_review(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row             public.user_streaks%ROWTYPE;
  v_today           DATE := CURRENT_DATE;
  v_yesterday       DATE := CURRENT_DATE - INTERVAL '1 day';
  v_two_days_ago    DATE := CURRENT_DATE - INTERVAL '2 days';
  v_new_streak      INT;
  v_milestone_days  INT[] := ARRAY[3, 7, 14, 30, 60, 100];
  v_milestone       INT;
  v_prev_streak     INT;
BEGIN
  SELECT * INTO v_row FROM public.user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- First review ever
    INSERT INTO public.user_streaks(user_id, current_streak, longest_streak, last_review_date, updated_at)
      VALUES (p_user_id, 1, 1, v_today, NOW());
    PERFORM public.award_xp(p_user_id, 'streak_day', jsonb_build_object('streak', 1));
    RETURN;
  END IF;

  -- Already reviewed today — no change
  IF v_row.last_review_date = v_today THEN RETURN; END IF;

  v_prev_streak := v_row.current_streak;

  IF v_row.last_review_date = v_yesterday THEN
    -- Continuing streak
    v_new_streak := v_row.current_streak + 1;

  ELSIF v_row.shield_active AND v_row.last_review_date = v_two_days_ago THEN
    -- Shield saves the streak (grace day)
    v_new_streak := v_row.current_streak + 1;
    UPDATE public.user_streaks
       SET shield_active  = false,
           shield_used_at = NOW()
     WHERE user_id = p_user_id;

  ELSE
    -- Streak broken — restart
    v_new_streak := 1;
  END IF;

  UPDATE public.user_streaks
     SET current_streak   = v_new_streak,
         longest_streak   = GREATEST(v_new_streak, v_row.longest_streak),
         last_review_date = v_today,
         updated_at       = NOW()
   WHERE user_id = p_user_id;

  -- Award streak XP
  PERFORM public.award_xp(p_user_id, 'streak_day', jsonb_build_object('streak', v_new_streak));

  -- Award milestone XP + shield at 7-day milestones
  FOREACH v_milestone IN ARRAY v_milestone_days LOOP
    IF v_new_streak = v_milestone AND v_prev_streak < v_milestone THEN
      PERFORM public.award_xp(p_user_id, 'streak_milestone', jsonb_build_object('milestone', v_milestone));

      -- Award shield at 7-day streak completion
      IF v_milestone % 7 = 0 THEN
        UPDATE public.user_streaks
           SET shield_active = true
         WHERE user_id = p_user_id AND shield_active = false;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- ── Trigger ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public._streak_on_review_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  PERFORM public.update_streak_on_review(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS streak_on_review_insert ON public.reviews;
CREATE TRIGGER streak_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public._streak_on_review_insert();

-- ── Daily cron: shield consumption / streak reset ────────
-- Registered via pg_cron in a separate migration (20260323_streak_shield_cron.sql)
-- The actual HTTP call goes to /api/cron/streaks

-- ── Realtime ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;
