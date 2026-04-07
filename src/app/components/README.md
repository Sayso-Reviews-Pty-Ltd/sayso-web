# components

All reusable UI components for the Sayso app, organised by complexity.

## Structure

| Directory    | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `atoms/`     | Smallest UI primitives (Button, Input, Avatar, Text, etc.)                             |
| `molecules/` | Mid-level components composed from atoms (ReviewItem, UserCard, SearchBar, etc.)       |
| `organisms/` | Large section-level components (SettingsMenu, ReviewsList, NotificationsSection, etc.) |
| `ui/`        | shadcn/ui generated primitives (dialog, sheet, carousel, etc.)                         |
| `shared/`    | Shared skeletons and cross-cutting layout helpers                                      |
| `maps/`      | Map components (BusinessesMap)                                                         |

Feature components (BusinessCard, EventCard, Reviews, SearchInput, Header, etc.) live at the top level of this directory, each in their own subdirectory.
