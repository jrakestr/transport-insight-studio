# Database Schema Documentation

## Overview
This document provides comprehensive documentation of the database schema for the Transit Tracker application. The database manages transit industry articles, agencies, service providers, opportunities, reports, playbooks, and user authentication.

---

## Tables

### 1. `articles`
**Purpose**: Stores published articles about transit industry news, developments, and innovations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key, unique identifier for the article |
| title | text | No | - | Article headline or title |
| slug | text | No | - | URL-friendly version of the title for routing |
| description | text | Yes | - | Short summary or excerpt of the article |
| content | text | Yes | - | Full article content in HTML format |
| image_url | text | Yes | - | URL to the article's featured image |
| author_name | text | Yes | - | Name of the article author |
| author_role | text | Yes | - | Position or role of the author (e.g., "Senior Reporter") |
| source_name | text | Yes | - | Original source publication name |
| source_url | text | Yes | - | URL to the original article source |
| category | text | Yes | - | Article category (e.g., "Technology", "Policy") |
| published_at | timestamp with time zone | No | now() | Date and time when the article was published |
| created_at | timestamp with time zone | No | now() | Timestamp of record creation |
| updated_at | timestamp with time zone | No | now() | Timestamp of last update |

**Security (RLS Policies)**:
- Public read access (anyone can view published articles)
- Admin-only write access (insert, update, delete)

**Relationships**:
- One-to-many with `article_agencies` (articles can mention multiple agencies)
- One-to-many with `article_providers` (articles can mention multiple providers)
- One-to-many with `article_categories` (articles can have multiple categories)
- One-to-many with `article_verticals` (articles can cover multiple verticals)
- One-to-many with `opportunities` (articles can generate opportunities)

---

### 2. `pending_articles`
**Purpose**: Holds articles discovered through automated scraping that await admin review and approval before publication.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Article title as discovered |
| slug | text | No | - | URL slug (auto-generated) |
| description | text | Yes | - | Article summary or excerpt |
| content | text | Yes | - | Full article content |
| image_url | text | Yes | - | Featured image URL |
| author_name | text | Yes | - | Author name extracted from source |
| author_role | text | Yes | - | Author's role or position |
| source_name | text | Yes | - | Source publication name |
| source_url | text | No | - | Original article URL (required for traceability) |
| discovery_method | text | Yes | - | How the article was discovered (e.g., "RSS feed", "web scraping") |
| discovered_at | timestamp with time zone | No | now() | When the article was discovered |
| published_at | timestamp with time zone | Yes | - | Original publication date from source |
| review_status | text | No | 'pending' | Status: 'pending', 'approved', 'rejected' |
| reviewed_at | timestamp with time zone | Yes | - | When the review was completed |
| reviewed_by | uuid | Yes | - | User ID of the reviewer |
| reviewer_notes | text | Yes | - | Notes from the reviewer about approval/rejection |
| ai_analysis | jsonb | Yes | - | AI-generated analysis of article content |
| ai_confidence_score | numeric | Yes | - | Confidence score (0-1) for AI extraction accuracy |
| extracted_agencies | jsonb | Yes | - | AI-extracted transit agencies mentioned |
| extracted_providers | jsonb | Yes | - | AI-extracted service providers mentioned |
| extracted_opportunities | jsonb | Yes | - | AI-identified business opportunities |
| extracted_category | text | Yes | - | AI-suggested article category |
| extracted_verticals | text[] | Yes | - | AI-identified industry verticals |
| published_article_id | uuid | Yes | - | Foreign key to `articles` if approved and published |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Admin-only access (read, write, update, delete)

**Relationships**:
- Optional one-to-one with `articles` (if approved and published)

---

### 3. `article_agencies`
**Purpose**: Junction table linking articles to transit agencies they mention.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| article_id | uuid | No | - | Foreign key to `articles` |
| agency_id | uuid | No | - | Foreign key to `transit_agencies` |
| mention_type | text | Yes | - | Type of mention (e.g., "partnership", "contract", "news") |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, delete)

---

### 4. `article_providers`
**Purpose**: Junction table linking articles to service providers they mention.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| article_id | uuid | No | - | Foreign key to `articles` |
| provider_id | uuid | No | - | Foreign key to `service_providers` |
| mention_type | text | Yes | - | Type of mention (e.g., "awarded contract", "new service") |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, delete)

---

### 5. `article_categories`
**Purpose**: Stores multiple categories that can be assigned to articles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| article_id | uuid | No | - | Foreign key to `articles` |
| category | text | No | - | Category name (e.g., "Electric Vehicles", "Accessibility") |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |

**Security (RLS Policies)**:
- Public read access
- Admin-only write access (insert, delete)

---

### 6. `article_verticals`
**Purpose**: Stores industry verticals/segments that articles cover.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| article_id | uuid | No | - | Foreign key to `articles` |
| vertical | text | No | - | Industry vertical (e.g., "Bus Transit", "Rail", "Microtransit") |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, delete)

---

### 7. `article_processing_status`
**Purpose**: Tracks the processing status of articles through various automated workflows.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| article_id | uuid | No | - | Foreign key to `articles` (unique constraint) |
| status | text | No | - | Processing status (e.g., "pending", "processing", "completed", "failed") |
| error_message | text | Yes | - | Error details if processing failed |
| created_at | timestamp with time zone | Yes | now() | Record creation timestamp |
| last_processed_at | timestamp with time zone | Yes | - | Last processing attempt timestamp |
| updated_at | timestamp with time zone | Yes | now() | Last update timestamp |

**Security (RLS Policies)**:
- Admin-only access (read, write, update)

---

### 8. `transit_agencies`
**Purpose**: Stores information about public transit agencies across the United States.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| agency_name | text | No | - | Official agency name |
| doing_business_as | text | Yes | - | Common/marketing name if different from official name |
| doing_business_as_old | text | Yes | - | Previous DBA name for historical tracking |
| ntd_id | text | Yes | - | National Transit Database ID (unique federal identifier) |
| legacy_ntd_id | text | Yes | - | Previous NTD ID if changed |
| fta_recipient_id | text | Yes | - | Federal Transit Administration recipient ID |
| ueid | text | Yes | - | Unique Entity Identifier |
| reporter_acronym | text | Yes | - | Agency acronym used in reporting |
| reporter_type | text | Yes | - | Type of reporter (e.g., "Full Reporter", "Reduced Reporter") |
| reporting_module | text | Yes | - | NTD reporting module used |
| organization_type | text | Yes | - | Type of organization (e.g., "Public", "Private", "Non-profit") |
| reported_by_name | text | Yes | - | Name of parent agency if sub-reported |
| reported_by_ntd_id | text | Yes | - | NTD ID of parent agency |
| state_parent_ntd_id | text | Yes | - | State-level parent agency NTD ID |
| subrecipient_type | text | Yes | - | Type of FTA subrecipient |
| division_department | text | Yes | - | Department or division within larger organization |
| address_line_1 | text | Yes | - | Street address line 1 |
| address_line_2 | text | Yes | - | Street address line 2 |
| city | text | Yes | - | City name |
| state | text | Yes | - | Two-letter state code |
| zip_code | text | Yes | - | ZIP code (5 digits) |
| zip_code_ext | text | Yes | - | ZIP+4 extension |
| region | text | Yes | - | FTA region number |
| primary_uza_uace_code | text | Yes | - | Primary urbanized area code |
| uza_name | text | Yes | - | Urbanized area name |
| population | integer | Yes | - | UZA population |
| sq_miles | numeric | Yes | - | UZA square miles |
| density | numeric | Yes | - | Population density (people per sq mile) |
| service_area_pop | integer | Yes | - | Population in service area |
| service_area_sq_miles | numeric | Yes | - | Service area size in square miles |
| tam_tier | text | Yes | - | Transit Asset Management tier (I, II, or III) |
| total_voms | integer | Yes | - | Total Vehicles Operated in Maximum Service |
| voms_do | integer | Yes | - | VOMS for Directly Operated service |
| voms_pt | integer | Yes | - | VOMS for Purchased Transportation |
| personal_vehicles | integer | Yes | - | Count of personal vehicles used |
| volunteer_drivers | integer | Yes | - | Count of volunteer drivers |
| url | text | Yes | - | Agency website URL |
| fy_end_date | date | Yes | - | Fiscal year end date |
| original_due_date | date | Yes | - | Original NTD report due date |
| notes | text | Yes | - | Additional notes or comments |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Public read access (anyone can view agencies)
- Admin-only write access (insert, update, delete)

**Relationships**:
- One-to-many with `article_agencies` (agency mentions in articles)
- One-to-many with `opportunities` (opportunities associated with agency)
- One-to-many with `service_providers` (providers contracted by agency)
- One-to-many with `transportation_providers` (contracted service arrangements)

---

### 9. `service_providers`
**Purpose**: Stores information about companies and organizations that provide transit services, including detailed contract and performance metrics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Provider company/organization name |
| provider_type | text | Yes | - | Type of provider (e.g., "Contractor", "Operator") |
| location | text | Yes | - | Primary business location |
| city | text | Yes | - | City of operation |
| state | text | Yes | - | State of operation |
| website | text | Yes | - | Company website URL |
| notes | text | Yes | - | Additional notes or comments |
| agency_id | uuid | Yes | - | Foreign key to `transit_agencies` (if directly linked) |
| ntd_id | text | Yes | - | National Transit Database ID |
| ntd_id_contract | text | Yes | - | Contract-specific NTD ID |
| agency | text | Yes | - | Agency name (denormalized) |
| agency_name | text | Yes | - | Agency name for contract |
| organization_type | text | Yes | - | Organization type (public/private/non-profit) |
| reporter_type | text | Yes | - | NTD reporter type |
| reporter_type_contract | text | Yes | - | Contract-specific reporter type |
| reporting_module | text | Yes | - | NTD reporting module |
| uace_code | text | Yes | - | Urbanized area code |
| uza_name | text | Yes | - | Urbanized area name |
| primary_uza_population | integer | Yes | - | UZA population |
| mode | text | Yes | - | Transit mode code |
| mode_name | text | Yes | - | Transit mode name (e.g., "Bus", "Rail") |
| mode_contract | text | Yes | - | Contract-specific mode |
| type_of_service | text | Yes | - | Service type (e.g., "Fixed Route", "Demand Response") |
| tos | text | Yes | - | Type of service code |
| contractee_ntd_id | text | Yes | - | NTD ID of contracting agency |
| contractee_agency_id | uuid | Yes | - | Foreign key to contracting agency |
| transportation_provider | text | Yes | - | Provider name in contract |
| reporter_contractual_position | text | Yes | - | Buyer or seller position |
| type_of_contract | text | Yes | - | Contract type classification |
| primary_feature | text | Yes | - | Primary contract feature |
| buyer_supplies_vehicles_to_seller | text | Yes | - | Whether buyer provides vehicles |
| buyer_provides_maintenance_facility_to_seller | text | Yes | - | Whether buyer provides maintenance facility |
| other_public_assets_provided | text | Yes | - | Other assets provided (Y/N) |
| other_public_assets_provided_desc | text | Yes | - | Description of other assets |
| service_captured | text | Yes | - | Service capture status |
| other_party | text | Yes | - | Other party in contract |
| fares_retained_by | text | Yes | - | Who retains fare revenues |
| report_year | integer | Yes | - | Reporting year |
| months_seller_operated_in_fy | integer | Yes | - | Number of months operated in fiscal year |
| voms_under_contract | integer | Yes | - | Vehicles operated under contract |
| agency_voms | integer | Yes | - | Total agency VOMS |
| mode_voms | integer | Yes | - | VOMS for this mode |
| unlinked_passenger_trips | integer | Yes | - | Total passenger boardings |
| unlinked_passenger_trips_1 | integer | Yes | - | Alternative passenger trips metric |
| vehicle_revenue_hours | numeric | Yes | - | Revenue hours operated |
| vehicle_revenue_hours_1 | numeric | Yes | - | Alternative revenue hours metric |
| vehicle_revenue_miles | numeric | Yes | - | Revenue miles operated |
| vehicle_revenue_miles_1 | numeric | Yes | - | Alternative revenue miles metric |
| passenger_miles | numeric | Yes | - | Total passenger miles traveled |
| passenger_miles_questionable | text | Yes | - | Flag if passenger miles data is questionable |
| fare_revenues_earned | numeric | Yes | - | Fare revenues earned ($) |
| fare_revenues_earned_1 | numeric | Yes | - | Alternative fare revenues metric |
| total_operating_expenses | numeric | Yes | - | Total operating expenses ($) |
| total_operating_expenses_1 | numeric | Yes | - | Alternative operating expenses metric |
| total_modal_expenses | numeric | Yes | - | Expenses for this mode ($) |
| pt_fare_revenues_passenger_fees | numeric | Yes | - | Passenger fees for purchased transportation |
| passenger_out_of_pocket_expenses | numeric | Yes | - | Out-of-pocket expenses paid by passengers |
| direct_payment_agency_subsidy | numeric | Yes | - | Direct subsidy payment from agency |
| contract_capital_leasing_expenses | numeric | Yes | - | Capital leasing expenses |
| other_operating_expenses_incurred_by_the_buyer | numeric | Yes | - | Other buyer operating expenses |
| other_reconciling_item_expenses_incurred_by_the_buyer | numeric | Yes | - | Reconciling expenses by buyer |
| cost_per_hour | numeric | Yes | - | Operating cost per revenue hour |
| cost_per_hour_questionable | text | Yes | - | Flag if cost per hour is questionable |
| cost_per_passenger | numeric | Yes | - | Operating cost per passenger |
| cost_per_passenger_1 | numeric | Yes | - | Alternative cost per passenger |
| cost_per_passenger_mile | numeric | Yes | - | Operating cost per passenger mile |
| cost_per_passenger_mile_1 | numeric | Yes | - | Alternative cost per passenger mile |
| passengers_per_hour | numeric | Yes | - | Passengers per revenue hour |
| passengers_per_hour_1 | numeric | Yes | - | Alternative passengers per hour |
| fare_revenues_per_unlinked | numeric | Yes | - | Fare revenue per unlinked trip |
| fare_revenues_per_unlinked_1 | numeric | Yes | - | Alternative fare revenue per trip |
| fare_revenues_per_total | numeric | Yes | - | Fare revenue ratio to total |
| fare_revenues_per_total_1 | numeric | Yes | - | Alternative fare revenue ratio |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, update, delete)

**Relationships**:
- Many-to-one with `transit_agencies` (via agency_id)
- One-to-many with `article_providers` (provider mentions in articles)
- One-to-many with `opportunities` (opportunities for provider)

---

### 10. `transportation_providers`
**Purpose**: Stores detailed information about contracted transportation service relationships between agencies and providers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| agency_id | uuid | No | - | Foreign key to `transit_agencies` (contracting agency) |
| provider_id | uuid | Yes | - | Foreign key to `service_providers` |
| provider_name | text | Yes | - | Name of service provider |
| agency_name | text | Yes | - | Name of contracting agency |
| ntd_id | text | Yes | - | NTD ID of contracting agency |
| contractee_ntd_id | text | Yes | - | NTD ID of contracted operator |
| contractee_agency_id | uuid | Yes | - | Foreign key to contracted agency if applicable |
| contractee_operator_name | text | Yes | - | Name of contracted operator |
| reporter_type | text | Yes | - | NTD reporter type |
| reporting_module | text | Yes | - | NTD reporting module |
| mode | text | Yes | - | Transit mode for this contract |
| tos | text | Yes | - | Type of service code |
| reporter_contractual_position | text | Yes | - | Whether reporter is buyer or seller |
| type_of_contract | text | Yes | - | Contract type classification |
| primary_feature | text | Yes | - | Primary feature of contract |
| buyer_supplies_vehicles_to_seller | boolean | Yes | - | True if buyer provides vehicles |
| buyer_provides_maintenance_facility_to_seller | boolean | Yes | - | True if buyer provides maintenance facility |
| other_public_assets_provided | text | Yes | - | Description of other assets provided |
| other_public_assets_provided_desc | text | Yes | - | Detailed description of assets |
| service_captured | text | Yes | - | Whether service is captured in NTD |
| other_party | text | Yes | - | Other contracting party |
| fares_retained_by | text | Yes | - | Who retains fare revenues (buyer/seller) |
| months_seller_operated_in_fy | bigint | Yes | - | Months operated in fiscal year |
| voms_under_contract | bigint | Yes | - | Vehicles operated under contract |
| unlinked_passenger_trips | bigint | Yes | - | Total passenger boardings |
| vehicle_revenue_hours | numeric | Yes | - | Revenue hours operated |
| vehicle_revenue_miles | numeric | Yes | - | Revenue miles operated |
| passenger_miles | numeric | Yes | - | Total passenger miles |
| fare_revenues_earned | numeric | Yes | - | Fare revenues earned ($) |
| total_operating_expenses | numeric | Yes | - | Total operating expenses ($) |
| total_modal_expenses | numeric | Yes | - | Expenses for this mode ($) |
| pt_fare_revenues_passenger_fees | numeric | Yes | - | Passenger fees collected |
| passenger_out_of_pocket_expenses | numeric | Yes | - | Out-of-pocket passenger expenses |
| direct_payment_agency_subsidy | numeric | Yes | - | Direct subsidy from agency |
| contract_capital_leasing_expenses | numeric | Yes | - | Capital leasing expenses |
| other_operating_expenses_incurred_by_the_buyer | numeric | Yes | - | Other buyer expenses |
| other_reconciling_item_expenses_incurred_by_the_buyer | numeric | Yes | - | Reconciling expenses |
| cost_per_hour | numeric | Yes | - | Cost per revenue hour |
| cost_per_passenger | numeric | Yes | - | Cost per passenger |
| cost_per_passenger_mile | numeric | Yes | - | Cost per passenger mile |
| passengers_per_hour | numeric | Yes | - | Passengers per revenue hour |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, update, delete)

**Relationships**:
- Many-to-one with `transit_agencies` (via agency_id)
- Many-to-one with `service_providers` (via provider_id)

---

### 11. `opportunities`
**Purpose**: Tracks identified business opportunities for service providers, including RFPs, contract opportunities, and partnership possibilities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Opportunity title or name |
| notes | text | Yes | - | Detailed notes or description |
| document_url | text | Yes | - | URL to RFP or opportunity document |
| document_file_path | text | Yes | - | Path to uploaded document in storage |
| article_id | uuid | Yes | - | Foreign key to `articles` if sourced from article |
| agency_id | uuid | Yes | - | Foreign key to `transit_agencies` (issuing agency) |
| provider_id | uuid | Yes | - | Foreign key to `service_providers` (relevant provider) |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, update, delete)

**Relationships**:
- Many-to-one with `articles` (optional)
- Many-to-one with `transit_agencies` (optional)
- Many-to-one with `service_providers` (optional)

---

### 12. `reports`
**Purpose**: Stores industry reports, whitepapers, and analytical content.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Report title |
| slug | text | No | - | URL-friendly slug |
| description | text | Yes | - | Report summary or abstract |
| content | text | Yes | - | Full report content in HTML format |
| image_url | text | Yes | - | Featured image or cover image URL |
| read_time | text | Yes | - | Estimated reading time (e.g., "15 min") |
| published_at | timestamp with time zone | No | now() | Publication date and time |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, update, delete)

---

### 13. `playbooks`
**Purpose**: Stores instructional guides, best practices, and how-to content for transit industry professionals.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | - | Playbook title |
| slug | text | No | - | URL-friendly slug |
| description | text | Yes | - | Playbook summary |
| content | text | Yes | - | Full playbook content in HTML format |
| icon | text | Yes | - | Icon identifier for UI display |
| category | text | Yes | - | Playbook category |
| order_index | integer | Yes | 0 | Display order for sorting |
| created_at | timestamp with time zone | No | now() | Record creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**Security (RLS Policies)**:
- Authenticated users can read
- Admin-only write access (insert, update, delete)

---

### 14. `discovery_runs`
**Purpose**: Tracks automated article discovery workflow runs and their outcomes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| started_at | timestamp with time zone | No | now() | When the discovery run started |
| completed_at | timestamp with time zone | Yes | - | When the discovery run completed |
| status | text | No | 'running' | Status: 'running', 'completed', 'failed' |
| error_message | text | Yes | - | Error details if run failed |
| articles_discovered | integer | Yes | 0 | Number of articles found |
| articles_processed | integer | Yes | 0 | Number of articles processed |
| articles_added | integer | Yes | 0 | Number of articles added to pending |
| run_metadata | jsonb | Yes | - | Additional metadata about the run |

**Security (RLS Policies)**:
- Admin-only read access

**Note**: This table has no INSERT, UPDATE, or DELETE policies - data is managed by edge functions.

---

### 15. `user_roles`
**Purpose**: Manages user role assignments for authorization and access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Foreign key to auth.users (user who has this role) |
| role | app_role | No | - | Role enum: 'admin' or 'user' |
| created_at | timestamp with time zone | No | now() | When role was assigned |

**Security (RLS Policies)**:
- Users can view their own roles
- Admins can view all roles
- Admin-only write access (insert, delete)

**Note**: Uses security definer function `has_role()` for checking permissions without RLS recursion.

**Constraints**:
- Unique constraint on (user_id, role) - users can't have duplicate roles

---

## Database Functions

### `has_role(_user_id uuid, _role app_role)`
**Purpose**: Security definer function to check if a user has a specific role without triggering RLS recursion.

**Returns**: boolean

**Usage**: Used in RLS policies to check admin access
```sql
CREATE POLICY "Admins can insert articles"
ON public.articles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

---

### `update_updated_at_column()`
**Purpose**: Trigger function to automatically update the `updated_at` timestamp on row modifications.

**Returns**: trigger

**Usage**: Attached to tables that have `updated_at` columns

---

## Enums

### `app_role`
**Values**: 'admin', 'user'

**Purpose**: Defines available user roles for authorization

---

## Storage Buckets

### `article-images`
**Public**: Yes
**Purpose**: Stores article featured images and media

### `opportunity-documents`
**Public**: No
**Purpose**: Stores RFP documents and opportunity files (authenticated access only)

### `data-files`
**Public**: Yes
**Purpose**: Stores CSV files and data imports

---

## Security Model

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Allow public read access for published content (articles, agencies, article categories)
- Require authentication for sensitive data (providers, opportunities, reports, playbooks)
- Restrict all write operations to admin users only
- Use the security definer function `has_role()` to prevent RLS recursion

### Authentication
- Uses Supabase Auth for user authentication
- Admin privileges managed through `user_roles` table
- No hardcoded credentials or client-side role checks

---

## Common Patterns

### Timestamps
Most tables include:
- `created_at`: Set to `now()` on creation
- `updated_at`: Set to `now()` on creation and updated via trigger

### Slugs
Content tables use URL-friendly slugs:
- Must be unique
- Used for routing (e.g., `/articles/{slug}`)
- Should match title but be URL-safe

### Foreign Keys
- Agency relationships use `agency_id` → `transit_agencies.id`
- Provider relationships use `provider_id` → `service_providers.id`
- Article relationships use `article_id` → `articles.id`
- User relationships reference `auth.users.id` (Supabase managed)

### JSONB Fields
Used for flexible, semi-structured data:
- `ai_analysis`: AI-generated insights
- `extracted_agencies`: Array of identified agencies
- `extracted_providers`: Array of identified providers
- `extracted_opportunities`: Array of identified opportunities
- `run_metadata`: Flexible metadata for discovery runs

---

## Data Flow

1. **Article Discovery**: 
   - Articles discovered → `pending_articles`
   - AI extracts entities → stored in JSONB fields
   - Admin reviews → published to `articles`
   - Junction tables created → `article_agencies`, `article_providers`, etc.

2. **Opportunity Tracking**:
   - Opportunities identified in articles
   - Created in `opportunities` table
   - Linked to relevant agencies and providers

3. **Provider Analytics**:
   - Data imported to `service_providers` and `transportation_providers`
   - Metrics calculated from NTD data
   - Performance tracked over time

---

## Maintenance Notes

### Data Import
- Transit agency data imported from NTD database
- Provider data imported from NTD contract data
- CSV files stored in `data-files` bucket

### Automated Workflows
- Article discovery runs tracked in `discovery_runs`
- Entity extraction via edge functions
- Status tracking in `article_processing_status`

### Backup Considerations
- All tables use UUID primary keys for distributed systems compatibility
- Timestamps enable incremental backups
- JSONB fields allow schema flexibility without migrations
