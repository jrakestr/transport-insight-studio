# Transit Agency Management System - Architecture

## Overview

This system manages transit agencies, transportation providers, and their contract relationships with performance metrics. It supports bidirectional navigation between agencies and providers while maintaining a single source of truth for contract data.

## Database Schema

### Core Tables

#### `transit_agencies`
**Purpose:** Directory of transit agencies with operational details

**Key Fields:**
- `id` (UUID, PK)
- `agency_name` (text, required)
- `ntd_id` (text) - National Transit Database ID (used for lookups)
- `city`, `state` - Location information
- `total_voms` - Total vehicle fleet size
- `url`, `notes` - Additional information

**Relationships:**
- One-to-many with `agency_contractors`

#### `transportation_providers`
**Purpose:** Directory of transportation service provider companies

**Key Fields:**
- `id` (UUID, PK)
- `name` (text, required, unique) - Provider company name
- `provider_type` (text) - Category of provider
- `location` (text) - Primary service area
- `website` (text)
- `notes` (text)

**Relationships:**
- One-to-many with `agency_contractors`

**Important:** This table contains ONLY provider entity information, not contract metrics.

#### `agency_contractors`
**Purpose:** Contract records linking agencies to providers with performance metrics

**Key Fields:**
- `id` (UUID, PK)
- `agency_id` (UUID, FK to transit_agencies, required)
- `provider_id` (UUID, FK to transportation_providers, optional)
- `provider_name` (text) - Provider name from CSV data
- `ntd_id` (text) - Agency NTD ID (redundant for query optimization)
- `mode` (text) - Service mode (e.g., bus, rail)
- `type_of_contract` (text) - Contract type
- **68 performance metric columns** including:
  - Fleet metrics: `voms_under_contract`, `mode_voms`
  - Service metrics: `unlinked_passenger_trips`, `passenger_miles`, `vehicle_revenue_hours`
  - Financial metrics: `fare_revenues_earned`, `total_operating_expenses`, `cost_per_passenger`
  - Efficiency metrics: `passengers_per_hour`, `cost_per_hour`

**Relationships:**
- Many-to-one with `transit_agencies` (via `agency_id`)
- Many-to-one with `transportation_providers` (via `provider_id`)

**Important:** Each row represents a unique agency-provider-mode contract. Metrics are stored ONCE and accessed bidirectionally.

## Data Flow

### CSV Import Process

```
CSV File (68 columns)
    ↓
1. Parse CSV & validate structure
    ↓
2. For each row:
   a. Look up agency_id from transit_agencies using ntd_id
   b. Find or create provider in transportation_providers using provider_name
   c. Build contract record with all metrics
    ↓
3. Batch insert into agency_contractors
    ↓
4. Display import statistics
```

**File:** `src/pages/admin/MetricsImport.tsx`

**Key Functions:**
- `parseCSVLine()` - Parse CSV handling quoted fields
- `buildContractRecord()` - Map CSV columns to database schema
- `lookupAgencyId()` - Find agency by ntd_id
- `getOrCreateProvider()` - Find or create provider record
- `handleFileImport()` - Main import orchestration

### Agency View Data Flow

```
Agency Detail Page
    ↓
useAgencyContractors(agencyId)
    ↓
Query: SELECT * FROM agency_contractors WHERE agency_id = ?
    ↓
Display contracts grouped by provider_name
with performance metrics for each contract
```

**Files:**
- `src/hooks/useAgencyContractors.tsx`
- `src/pages/AgencyDetail.tsx`

### Provider View Data Flow

```
Provider Detail Page
    ↓
useProviderContracts(providerName)
    ↓
Query: SELECT * FROM agency_contractors
       JOIN transit_agencies ON agency_id
       WHERE provider_name = ?
    ↓
Display contracts grouped by agency
with performance metrics for each contract
```

**Files:**
- `src/hooks/useAgencyContractors.tsx`
- `src/pages/ProviderDetail.tsx`

## Key Design Decisions

### 1. Separation of Provider Entity and Contract Data

**Problem:** CSV contains both provider information and contract metrics mixed together.

**Solution:** 
- `transportation_providers` = Clean provider directory (entity information only)
- `agency_contractors` = Contract records with metrics
- Foreign key relationship links them

**Benefits:**
- No metric duplication
- Provider information can be updated independently
- Clear separation of concerns

### 2. Bidirectional Navigation

**Problem:** Users need to view data from both agency and provider perspectives.

**Solution:**
- Agency → Contracts → Providers (via `agency_id` FK)
- Provider → Contracts → Agencies (via `provider_name` lookup + join)

**Benefits:**
- Single source of truth for metrics
- No data duplication
- Consistent data across both views

### 3. Using provider_name as Lookup Key

**Problem:** Historical data may not have provider_id set.

**Solution:** `useProviderContracts()` uses `provider_name` instead of `provider_id` for queries.

**Benefits:**
- Works with both old and new data
- Graceful handling of missing provider_id
- Can be migrated to provider_id later if needed

### 4. Batch Processing for Imports

**Problem:** Large CSV files could cause memory issues or timeout.

**Solution:** Process CSV in batches of 100 rows with progress tracking.

**Benefits:**
- Prevents memory exhaustion
- Shows import progress
- Allows partial success (some batches succeed even if others fail)

## Component Architecture

### Admin Components
- `MetricsImport` - CSV import interface
- `AgenciesAdmin` - Agency list management
- `ProvidersAdmin` - Provider list management

### Public Components
- `AgencyDetail` - Agency profile with contract list
- `ProviderDetail` - Provider profile with contract list
- `Agencies` - Agency directory
- `Providers` - Provider directory

### Custom Hooks
- `useAgencyContractors` - Fetch contracts for agency
- `useProviderContracts` - Fetch contracts for provider (with agency join)
- `useAgencies` - Fetch agency list
- `useProviders` - Fetch provider list

## Error Handling

### Import Process
1. **File validation** - Check CSV file type
2. **Structure validation** - Verify headers and data rows exist
3. **Row-level validation** - Check required fields (ntd_id)
4. **Lookup failures** - Skip rows with invalid agency references
5. **Batch failures** - Continue processing even if one batch fails
6. **Detailed logging** - Track processed, inserted, skipped counts

### Query Hooks
- Use React Query for automatic error handling
- Log errors to console for debugging
- Throw errors to trigger error boundaries
- Return null for invalid parameters

## Performance Considerations

1. **Indexed columns** for fast lookups:
   - `agency_contractors.agency_id`
   - `agency_contractors.provider_id`
   - `transit_agencies.ntd_id`
   - `transportation_providers.name`

2. **Batch operations** for imports (100 rows per batch)

3. **React Query caching** for repeated data fetches

4. **Selective column selection** in joins (only needed fields)

## Future Enhancements

1. **Provider migration** - Backfill provider_id for old records
2. **Advanced filtering** - Filter contracts by mode, date, metrics
3. **Comparison views** - Compare performance across contracts
4. **Analytics dashboard** - Aggregate statistics and trends
5. **Export functionality** - Export filtered contract data
6. **Bulk updates** - Update multiple contracts at once

## Maintenance Notes

### Adding New Metrics
1. Add column to `agency_contractors` table via migration
2. Update `buildContractRecord()` in MetricsImport.tsx
3. Update `AgencyContractorRecord` interface in useAgencyContractors.tsx
4. Add metric display in AgencyDetail.tsx and ProviderDetail.tsx

### Modifying Provider Structure
1. Update `transportation_providers` schema
2. Update provider forms and validation
3. Consider impact on CSV import logic
4. Update provider list and detail views

### Schema Changes
- Always use migrations (supabase--migration tool)
- Update TypeScript types in hooks
- Test with existing data
- Document breaking changes
