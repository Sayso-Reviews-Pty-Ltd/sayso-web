# Messaging

In-app direct messaging UI — conversation list, message thread, and composer.

## Files

| File                          | Description                              |
| ----------------------------- | ---------------------------------------- |
| `MessagingWorkspace.tsx`      | Two-pane messaging workspace layout      |
| `ConversationListPane.tsx`    | Left pane with conversation list         |
| `MessageThread.tsx`           | Right pane with message bubbles          |
| `MessageComposer.tsx`         | Text input and send button               |
| `MessageBubbleAvatar.tsx`     | Avatar for message bubbles               |
| `messagingWorkspace.utils.ts` | Formatting and grouping utilities        |
| `hooks/`                      | SWR hooks for conversations and messages |

## Used By

`/dm` page, `/(business-portal)/my-businesses/messages`.
