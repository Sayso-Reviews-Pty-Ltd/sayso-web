# ProtectedRoute

Client-side route guard that redirects unauthenticated users to `/login`.

## Files

| File                 | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `ProtectedRoute.tsx` | Wraps children; reads `AuthContext` and redirects if no session |

## Notes

Prefer server-side auth checks in `layout.tsx` where possible. Use this only for client components that can't access server-side session.

## Used By

Profile page, notifications page, saved items page.
