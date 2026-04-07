# Reviews

Business/event review list components with flag modal, gallery, and replies.

## Files

| File                  | Description                                        |
| --------------------- | -------------------------------------------------- |
| `ReviewCard.tsx`      | Individual review card                             |
| `ReviewCard.types.ts` | `ReviewCardProps` interface                        |
| `reviewCard.utils.ts` | Review text truncation and formatting helpers      |
| `ReviewFlagModal.tsx` | Flag review dialog                                 |
| `ReviewGallery.tsx`   | Review photo thumbnails                            |
| `ReviewReplies.tsx`   | Threaded reply section                             |
| `ReviewsList.tsx`     | Paginated list of review cards                     |
| `hooks/`              | Review-specific SWR hooks                          |
| `parts/`              | Sub-components (actions, metadata, rating display) |

## Used By

Business detail page, event detail page.
