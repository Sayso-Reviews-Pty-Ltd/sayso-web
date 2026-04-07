# Atoms

Smallest reusable UI primitives in the design system — no domain logic, no data fetching.

## Subdirectories

| Directory            | Component           | Description                                                     |
| -------------------- | ------------------- | --------------------------------------------------------------- |
| `Avatar/`            | `Avatar`            | Circular avatar with image and initials fallback                |
| `Badge/`             | `Badge`             | Inline status/label chip with semantic colour variants          |
| `Button/`            | `Button`            | Primary interactive button wrapping the shadcn Button           |
| `ExpandableSection/` | `ExpandableSection` | Collapsible section with icon and label                         |
| `Icon/`              | `Icon`              | Thin wrapper to render a named icon at a consistent size/colour |
| `IconButton/`        | `IconButton`        | Square icon-only button with variant styling                    |
| `Input/`             | `Input`             | Text input with label, error, helper text, and icon slots       |
| `PasswordInput/`     | `PasswordInput`     | Input pre-wired with show/hide password toggle                  |
| `SettingsCard/`      | `SettingsCard`      | Card container used in settings screens with icon header        |
| `Skeleton/`          | `Skeleton`          | Loading placeholder in text, circular, or rectangular shapes    |
| `Spinner/`           | `Spinner`           | Animated SVG spinner for inline loading states                  |
| `StatCard/`          | `StatCard`          | Centred icon + value + label tile for profile stats             |
| `Tabs/`              | `Tabs`              | Tab bar built on Radix UI Tabs                                  |
| `Text/`              | `Text`              | Polymorphic typography component with variant and colour props  |
| `Toggle/`            | `Toggle`            | Boolean on/off switch backed by the shadcn Switch primitive     |

## Patterns

- All atoms are `"use client"` components
- Styling via Tailwind CSS utility classes; design tokens (sage, coral, charcoal) used throughout
- Size and variant maps are defined as plain `Record` objects at the top of each file
- Atoms wrap shadcn/ui or Radix UI primitives where available; they never fetch data
