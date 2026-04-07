# Hooks — Messaging

SWR hooks and shared types for the in-app messaging (conversations) feature.

## Contents

| File                         | Key Exports                                                                                             | Description                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                   | `MessagingRole`, `ConversationListItem`, `ConversationMessage`, `MessagesPage`, `ConversationsResponse` | Shared TypeScript types for the messaging domain                                                                    |
| `useConversations.ts`        | `useConversations`                                                                                      | SWR hook to fetch the conversation list for a given role (`user` or `business`) with Supabase Realtime invalidation |
| `useConversationMessages.ts` | `useConversationMessages`                                                                               | `useSWRInfinite` hook for paginated message history; subscribes to Realtime for live updates                        |
| `index.ts`                   | re-exports all of the above                                                                             | Barrel export                                                                                                       |

## Patterns

- `MessagingRole` determines whether the request is scoped to a regular user or a business owner
- Both hooks subscribe to Supabase Realtime channels on mount and unsubscribe on unmount
- `useConversationMessages` uses `swr/infinite` for cursor-based pagination; pages are reversed in memory for chronological display

## Used By

Messaging UI pages and the business-owner inbox view under `(business-portal)/my-businesses/messages/`.
