# Recommendation System Implementation

## Overview

The recommendation system uses user selections from onboarding (interests, subcategories, and deal-breakers) to personalize content throughout the site. The system automatically fetches user preferences when authenticated and uses them to recommend relevant businesses.

## How It Works

### 1. Data Collection During Onboarding

During onboarding, users select:

- **Interests**: Main categories (e.g., "Food & Drink", "Beauty & Wellness")
- **Subcategories**: Specific sub-interests (e.g., "Restaurants", "Gyms")
- **Deal-breakers**: Preferences to exclude (e.g., "Value for Money")

This data is stored in:

- `user_interests` table
- `user_subcategories` table
- `user_dealbreakers` table

### 2. Automatic Preference Fetching

The `/api/businesses` endpoint automatically:

- Detects if a user is authenticated
- Fetches their interests, subcategories, and deal-breakers from the database
- Uses these preferences to personalize results

**Key Implementation**: The `getUserPreferences()` helper function in `src/app/api/businesses/route.ts` handles this automatically.

### 3. Recommendation Algorithm

The system uses a sophisticated SQL function `recommend_personalized_businesses` that scores businesses based on:

1. **Interest Alignment** (40% weight)
   - Exact subcategory match: 1.0
   - Interest match: 0.6
   - No match: 0.2

2. **Quality Score** (30% weight)
   - Average rating: 50%
   - Review count (logarithmic): 30%

3. **Freshness Score** (15% weight)
   - Newer businesses get higher scores
   - Decays over 45 days

4. **Distance Score** (10% weight)
   - Closer businesses score higher
   - Uses Haversine formula for distance calculation

5. **Randomness** (5% weight)
   - Prevents feed stagnation
   - Adds variety to recommendations

### 4. Diversity Enforcement

The system ensures variety by:

- Limiting to 4 businesses per subcategory
- Ranking within each subcategory
- Mixing different types of businesses

### 5. Where Recommendations Are Used

#### Home Page (`/home`)

- **"For You" section**: Uses `useForYouBusinesses()` hook
- **All businesses**: Uses `feedStrategy: "mixed"` for personalized results

#### For You Page (`/for-you`)

- Entire page uses personalized recommendations
- Automatically filters by user interests and subcategories
- Respects deal-breakers

#### Explore Page (`/explore`)

- Can use personalized recommendations when `feedStrategy: "mixed"` is set
- Falls back to standard listing if no preferences available

## API Usage

### Automatic Personalization

When a user is authenticated, the API automatically uses their preferences:

```typescript
// No need to pass interest_ids - API fetches them automatically
const response = await fetch("/api/businesses?feed_strategy=mixed&limit=20");
```

### Manual Override

You can still override preferences by passing explicit filters:

```typescript
// Query params take precedence over user preferences
const response = await fetch("/api/businesses?interest_ids=food-drink,beauty-wellness");
```

### Feed Strategies

- **`mixed`**: Uses personalized recommendations (default for authenticated users with preferences)
- **`standard`**: Standard listing without personalization

## Hooks

### `useForYouBusinesses(limit)`

Fetches personalized businesses for the "For You" section:

- Automatically uses user preferences
- Applies deal-breakers
- Uses mixed feed strategy

### `useBusinesses(options)`

General hook for fetching businesses:

- Can use `feedStrategy: "mixed"` for personalization
- Automatically benefits from API-level personalization when authenticated

### `useUserPreferences()`

Fetches user's interests, subcategories, and deal-breakers:

- Used by hooks to pass preferences to API
- Now optional since API fetches automatically

## Database Functions

### `recommend_personalized_businesses`

Located in: `src/app/lib/migrations/005_functions/004_recommend_personalized_businesses.sql`

Parameters:

- `p_user_sub_interest_ids`: Array of subcategory IDs
- `p_user_interest_ids`: Array of interest IDs
- `p_limit`: Maximum number of results
- `p_latitude`, `p_longitude`: User location (optional)
- `p_price_ranges`: Preferred price ranges (optional)
- `p_excluded_business_ids`: Businesses to exclude (optional)
- `p_min_rating`: Minimum rating filter (optional)

Returns:

- Businesses with `personalization_score` and `diversity_rank`
- Sorted by personalization score

## Benefits

1. **Automatic**: No need to manually pass preferences - API handles it
2. **Intelligent**: Multi-factor scoring ensures quality recommendations
3. **Diverse**: Prevents repetitive results
4. **Flexible**: Can be overridden when needed
5. **Performance**: Uses optimized SQL functions and indexes

## Future Enhancements

Potential improvements:

- Machine learning-based recommendations
- Collaborative filtering (users with similar interests)
- Time-based recommendations (time of day, day of week)
- Seasonal recommendations
- A/B testing different recommendation algorithms
- User feedback loop (thumbs up/down to improve recommendations)
