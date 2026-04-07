-- One-off: remove a Playwright E2E seeded business (review-rating-badge-flows.spec.ts).
-- Slug format: seed-business-<timestamp>-<random>, e.g. seed-business-1774950235104-tfm6dl
--
-- Run in Supabase SQL Editor. Preview first, then delete.

-- 1) Preview matching row(s)
SELECT id, name, slug, created_at
FROM public.businesses
WHERE slug = 'seed-business-1774950235104-tfm6dl'
   OR slug LIKE '%1774950235104-tfm6dl%';

-- 2) Delete (CASCADE removes reviews, review_images rows, business_stats, business_images, etc.
--    per current FKs). Orphan files may remain in Storage bucket `review_images` — use script
--    scripts/delete-e2e-business-by-slug.ts if you need storage cleanup too.
--
-- DELETE FROM public.businesses
-- WHERE slug = 'seed-business-1774950235104-tfm6dl';
