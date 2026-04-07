# ReviewItem

Review card with business thumbnail, star rating, text, tags, and edit/delete actions.

## Files

| File             | Purpose          |
| ---------------- | ---------------- |
| `ReviewItem.tsx` | Main export      |
| `index.ts`       | Barrel re-export |

## Props

| Prop               | Type             | Default  | Description                       |
| ------------------ | ---------------- | -------- | --------------------------------- |
| `businessName`     | `string`         | required | Name of reviewed business         |
| `businessImageUrl` | `string \| null` | —        | Business thumbnail                |
| `businessCategory` | `string \| null` | —        | Category for placeholder fallback |
| `rating`           | `number`         | required | Star rating (1–5)                 |
| `reviewText`       | `string \| null` | —        | Review body                       |
| `reviewTitle`      | `string \| null` | —        | Review heading                    |
| `helpfulCount`     | `number`         | —        | Number of helpful votes           |
| `tags`             | `string[]`       | —        | Review tags                       |
| `isFeatured`       | `boolean`        | —        | Shows featured indicator          |
| `createdAt`        | `string`         | required | ISO date string                   |
| `businessId`       | `string`         | —        | Links thumbnail to business page  |
| `onViewClick`      | `() => void`     | —        | View business handler             |
| `onEdit`           | `() => void`     | —        | Edit review handler               |
| `onDelete`         | `() => void`     | —        | Delete review handler             |
| `className`        | `string`         | —        | Additional Tailwind classes       |

## Used By

User profile reviews tab, `organisms/ReviewsList`.
