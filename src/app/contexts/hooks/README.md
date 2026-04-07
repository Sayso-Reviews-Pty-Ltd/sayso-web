# contexts/hooks

Custom hooks extracted from context providers to keep individual files under 300 lines.

## Contents

| File                  | Key Exports        | Description                                                                                                                                            |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useAuthCallbacks.ts` | `useAuthCallbacks` | Returns memoised `login`, `register`, `logout`, `updateUser`, `refreshUser`, and `resendVerificationEmail` callbacks; extracted from `AuthContext.tsx` |

## Used By

- `AuthContext.tsx` — imports `useAuthCallbacks` and spreads its return value into the context value object

## Notes

- This hook is an implementation detail of `AuthContext` and should not be imported directly by consumers; use `useAuth()` instead.
- The hook accepts the parent's state setters as parameters to avoid duplicating state.
