-- Compatibility shim for legacy queries still used by web clients.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS uploaded_images text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS primary_category_label text;

ALTER TABLE public.business_images
  ADD COLUMN IF NOT EXISTS alt_text text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS id uuid;

UPDATE public.profiles
SET id = user_id
WHERE id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_id_unique ON public.profiles(id);

CREATE OR REPLACE FUNCTION public.sync_profiles_legacy_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.id := NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profiles_legacy_id ON public.profiles;
CREATE TRIGGER trg_sync_profiles_legacy_id
BEFORE INSERT OR UPDATE OF user_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profiles_legacy_id();

CREATE OR REPLACE FUNCTION public.sync_businesses_legacy_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.category := COALESCE(NEW.primary_subcategory_slug, NEW.category_raw, NEW.primary_category_slug, NEW.category);
  NEW.primary_category_label := COALESCE(NEW.primary_subcategory_label, NEW.category_raw, NEW.primary_category_slug, NEW.primary_category_label);
  IF NEW.uploaded_images IS NULL THEN
    NEW.uploaded_images := '{}';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_businesses_legacy_columns ON public.businesses;
CREATE TRIGGER trg_sync_businesses_legacy_columns
BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.sync_businesses_legacy_columns();

CREATE OR REPLACE FUNCTION public.refresh_business_uploaded_images(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.businesses b
  SET uploaded_images = COALESCE(src.urls, '{}')
  FROM (
    SELECT bi.business_id,
      ARRAY_AGG(bi.url ORDER BY bi.is_primary DESC, COALESCE(bi.sort_order, 0), bi.created_at DESC) AS urls
    FROM public.business_images bi
    WHERE bi.business_id = p_business_id
    GROUP BY bi.business_id
  ) src
  WHERE b.id = src.business_id;

  UPDATE public.businesses
  SET uploaded_images = '{}'
  WHERE id = p_business_id
    AND NOT EXISTS (
      SELECT 1 FROM public.business_images bi WHERE bi.business_id = p_business_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_business_uploaded_images_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_business_id uuid;
BEGIN
  v_business_id := COALESCE(NEW.business_id, OLD.business_id);
  IF v_business_id IS NOT NULL THEN
    PERFORM public.refresh_business_uploaded_images(v_business_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_business_uploaded_images ON public.business_images;
CREATE TRIGGER trg_sync_business_uploaded_images
AFTER INSERT OR UPDATE OR DELETE ON public.business_images
FOR EACH ROW
EXECUTE FUNCTION public.sync_business_uploaded_images_trigger();

UPDATE public.businesses
SET category = COALESCE(primary_subcategory_slug, category_raw, primary_category_slug, category),
    primary_category_label = COALESCE(primary_subcategory_label, category_raw, primary_category_slug, primary_category_label),
    uploaded_images = COALESCE(uploaded_images, '{}');

DO $$
DECLARE
  business_row RECORD;
BEGIN
  FOR business_row IN SELECT id FROM public.businesses LOOP
    PERFORM public.refresh_business_uploaded_images(business_row.id);
  END LOOP;
END;
$$;
