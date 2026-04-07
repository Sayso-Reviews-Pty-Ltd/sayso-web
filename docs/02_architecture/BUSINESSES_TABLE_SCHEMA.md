# Businesses Table Schema

Based on the codebase analysis, here is the expected schema for the `businesses` table in Supabase/PostgreSQL:

## Main Table: `businesses`

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  image_url TEXT,
  uploaded_image TEXT,
  verified BOOLEAN DEFAULT false,
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')) DEFAULT '$$',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  badge TEXT, -- e.g., 'Trending', 'Hot', 'New', 'Popular'
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE, -- URL-friendly identifier
  search_vector tsvector, -- For full-text search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_location ON businesses(location);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_verified ON businesses(verified);
CREATE INDEX idx_businesses_badge ON businesses(badge);
CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX idx_businesses_search_vector ON businesses USING GIN(search_vector);

-- Full-text search index (if using search_vector)
CREATE TRIGGER businesses_search_vector_update BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description, category, location);
```

## Related Table: `business_stats`

```sql
CREATE TABLE business_stats (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,
  percentiles JSONB DEFAULT '{"service": 0, "price": 0, "ambience": 0}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick stats lookups
CREATE INDEX idx_business_stats_rating ON business_stats(average_rating DESC);
CREATE INDEX idx_business_stats_reviews ON business_stats(total_reviews DESC);
```

## TypeScript Interface (from `src/app/lib/types/database.ts`)

```typescript
export interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  verified: boolean;
  price_range: "$" | "$$" | "$$$" | "$$$$";
  created_at: string;
  updated_at: string;
  owner_id?: string;
}

export interface BusinessStats {
  business_id: string;
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  percentiles: {
    service: number;
    price: number;
    ambience: number;
  };
}
```

## Additional Fields Used in Code (may need to be added)

Based on the API route and components, these additional fields are also used:

- `image` - Legacy field (may alias to `image_url`)
- `badge` - String for badges like "Trending", "Hot", "New"
- `status` - String for business status ('active', 'inactive', 'pending')
- `slug` - URL-friendly identifier for business pages

## Notes

1. **Status field**: The API filters by `status = 'active'`, so make sure businesses have this field set.
2. **Business Stats**: Stats are stored in a separate `business_stats` table and joined via `business_id`.
3. **Full-text Search**: If using `search_vector`, ensure you have the appropriate PostgreSQL extensions enabled.
4. **UUID vs String**: The code uses string IDs (including OSM-format IDs like `osm-node-123`), so ensure your ID column supports text/varchar or use UUID with proper conversion.
