# Header

Global application header with desktop nav, mobile menu, search, and role-based actions.

## Files

| File                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `Header.tsx`               | Main export — orchestrates all header pieces        |
| `GlobalHeader.tsx`         | Wrapper that injects the header into the page       |
| `DesktopNav.tsx`           | Desktop navigation links                            |
| `DesktopNav.types.ts`      | Desktop nav prop types                              |
| `HeaderSearch.tsx`         | Inline search input in the header                   |
| `HeaderSkeleton.tsx`       | Loading skeleton                                    |
| `LockedTooltip.tsx`        | Tooltip for features requiring sign-in              |
| `MobileMenu.tsx`           | Mobile slide-in menu panel                          |
| `MobileMenuToggleIcon.tsx` | Animated hamburger/close toggle icon                |
| `headerActionsConfig.ts`   | Role-based action button configuration              |
| `useHeaderState.ts`        | Header scroll, open/close, and search state         |
| `hooks/`                   | Additional header-specific hooks                    |
| `parts/`                   | Sub-components (logo area, action buttons, etc.)    |
| `roles/`                   | Role-specific header variants (user/business/admin) |

## Used By

Root layout — appears on every page.
