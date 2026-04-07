# Database Architecture

This document describes the database architecture for KLIO, including tables, relationships, and key design decisions.

## Overview

KLIO uses **Supabase** (PostgreSQL) as its database backend with Row Level Security (RLS) enabled for data protection.

## Core Principles

1. **Security First** - All tables use RLS policies
2. **Audit Trail** - Timestamps on all records
3. **Data Integrity** - Foreign key constraints and cascading deletes
4. **Performance** - Strategic indexing on query patterns
5. **Extensibility** - JSONB fields for flexible data

## Database Schema

### User Management

#### `profiles`

User profile information linked to Supabase auth.

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',

  -- Onboarding tracking
  onboarding_step TEXT DEFAULT 'interests',
  onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Interest counts (denormalized for performance)
  interests_count INTEGER DEFAULT 0,
  subcategories_count INTEGER DEFAULT 0,
  dealbreakers_count INTEGER DEFAULT 0,

  -- Timestamps for interest updates
  last_interests_updated TIMESTAMPTZ,
  last_subcategories_updated TIMESTAMPTZ,
  last_dealbreakers_updated TIMESTAMPTZ,

  -- Gamification
  is_top_reviewer BOOLEAN DEFAULT FALSE,
  reviews_count INTEGER DEFAULT 0,
  badges_count INTEGER DEFAULT 0,

  -- User role (normal user or business owner)
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**

- One-to-one relationship with `auth.users`
- Denormalized counts for performance
- Role-based access control
- Soft audit trail with timestamps

#### `user_interests`

Stores user's selected interest categories.

```sql
CREATE TABLE user_interests (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, interest_id)
);
```

#### `user_subcategories`

Stores user's selected subcategories within interests.

```sql
CREATE TABLE user_subcategories (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subcategory_id TEXT NOT NULL,
  interest_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, subcategory_id)
);
```

#### `user_dealbreakers`

Stores user's dealbreakers (things they want to avoid).

```sql
CREATE TABLE user_dealbreakers (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealbreaker_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, dealbreaker_id)
);
```

### Business Management

#### `businesses`

Main table for business listings.

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  slug TEXT UNIQUE,

  -- Location
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Images
  image_url TEXT,
  uploaded_image TEXT,

  -- Business Details
  price_range TEXT DEFAULT '$$' CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  verified BOOLEAN DEFAULT false,
  badge TEXT,

  -- Ownership
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Data Source (for OSM integration)
  source TEXT,
  source_id TEXT,

  -- Full-text search
  search_vector tsvector,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_source_business UNIQUE (source, source_id)
);

-- Indexes
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_location ON businesses(location);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_verified ON businesses(verified);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_search_vector ON businesses USING GIN(search_vector);
CREATE INDEX idx_businesses_lat_lng ON businesses(latitude, longitude);
```

**Key Features:**

- Unique slug for URL-friendly identifiers
- Full-text search support with tsvector
- Source tracking for OSM data integration
- Geolocation support with lat/lng
- Owner relationship for business claiming

#### `business_stats`

Denormalized statistics for businesses (for performance).

```sql
CREATE TABLE business_stats (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,

  -- Review aggregates
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),

  -- Rating distribution
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,

  -- Percentile scores for different criteria
  percentiles JSONB DEFAULT '{"service": 0, "price": 0, "ambience": 0}'::jsonb,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_stats_rating ON business_stats(average_rating DESC);
CREATE INDEX idx_business_stats_reviews ON business_stats(total_reviews DESC);
```

**Key Features:**

- One-to-one with businesses
- JSONB for flexible criteria storage
- Automatically updated via triggers
- Indexed for sorting/filtering

#### `business_ownership_claims`

Tracks business ownership claim requests.

```sql
CREATE TABLE business_ownership_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Claim details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  claim_type TEXT CHECK (claim_type IN ('owner', 'manager')),

  -- Verification info
  verification_method TEXT,
  verification_data JSONB,

  -- Admin notes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reviews System

#### `reviews`

Customer reviews for businesses.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,

  -- Additional ratings
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  ambience_rating INTEGER CHECK (ambience_rating >= 1 AND ambience_rating <= 5),

  -- Metadata
  visit_date DATE,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'flagged', 'removed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate reviews
  CONSTRAINT unique_user_business_review UNIQUE (business_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
```

**Key Features:**

- One review per user per business
- Multiple rating dimensions
- Status workflow (draft → published → flagged → removed)
- Helpful count for community feedback

#### `review_images`

Images attached to reviews.

```sql
CREATE TABLE review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_review_images_review ON review_images(review_id);
```

## Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ├── user_interests (1:N)
    ├── user_subcategories (1:N)
    ├── user_dealbreakers (1:N)
    ├── businesses (1:N) [as owner]
    ├── reviews (1:N)
    └── business_ownership_claims (1:N)

businesses
    ├── business_stats (1:1)
    ├── reviews (1:N)
    └── business_ownership_claims (1:N)

reviews
    └── review_images (1:N)
```

## Security (Row Level Security)

All tables have RLS enabled with policies:

### User Data Policies

```sql
-- Users can only read/write their own data
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = user_id);
```

### Business Policies

```sql
-- Anyone can read active businesses
CREATE POLICY "Public read access"
  ON businesses FOR SELECT
  USING (status = 'active');

-- Only owners can update their businesses
CREATE POLICY "Owners update own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id);
```

### Review Policies

```sql
-- Anyone can read published reviews
CREATE POLICY "Public read published reviews"
  ON reviews FOR SELECT
  USING (status = 'published');

-- Users can create their own reviews
CREATE POLICY "Users create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Triggers & Functions

### Auto-update timestamps

```sql
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Update search vector

```sql
CREATE FUNCTION businesses_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Update business stats

```sql
CREATE FUNCTION update_business_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate stats when reviews change
  -- (Implementation in migrations/005_functions/)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Performance Considerations

### Indexing Strategy

1. **Primary Keys** - UUID with btree (default)
2. **Foreign Keys** - Indexed for join performance
3. **Sort Columns** - DESC indexes for pagination
4. **Search** - GIN index for full-text search
5. **Location** - Spatial index for geoqueries

### Denormalization

- Review counts in `business_stats`
- Interest counts in `profiles`
- Rating averages calculated once, not per query

### Query Optimization

- Use `EXPLAIN ANALYZE` to verify index usage
- Batch operations where possible
- Limit result sets with pagination
- Use covering indexes when available

## Migration Strategy

Migrations are organized in `src/app/lib/migrations/`:

1. Core setup (profiles, auth)
2. Business tables
3. Review system
4. Storage configuration
5. Helper functions

See [Migration README](../../src/app/lib/migrations/README.md) for details.

## Backup & Recovery

- **Automatic Backups**: Supabase handles automated backups
- **Point-in-Time Recovery**: Available on paid plans
- **Manual Exports**: Use `pg_dump` for manual backups

## Future Considerations

- [ ] Partitioning for reviews table as it grows
- [ ] Read replicas for scaling read operations
- [ ] Caching layer (Redis) for frequently accessed data
- [ ] Archive old data to reduce table sizes
- [ ] Consider time-series DB for analytics data
