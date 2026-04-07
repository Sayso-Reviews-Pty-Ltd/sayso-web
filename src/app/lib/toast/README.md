# lib/toast

Cross-route flash toast system using `localStorage` as a message relay between navigations.

## Contents

| File            | Key Exports                          | Description                                                                                                     |
| --------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `flashToast.ts` | `setFlashToast`, `consumeFlashToast` | Writes a toast payload to `localStorage` before a navigation; the destination page reads and clears it on mount |

## Notes

- Solves the problem of showing a success toast after a redirect (e.g. "Business created" after redirect to the business page)
- The toast is consumed exactly once — `consumeFlashToast` deletes the value after reading

## Used By

`(business-portal)/add-business/`, `(business-portal)/claim-business/`, and other flows that redirect after a mutation.
