# Database Schema Documentation

## Overview
This document provides comprehensive documentation of the database schema for the Transit Tracker application. The system manages:
- **Content Management**: Transit industry articles, reports, and educational playbooks
- **Entity Management**: Transit agencies and service providers with detailed operational data
- **Relationship Tracking**: Contract relationships between agencies and providers with performance metrics
- **Opportunity Management**: Business opportunities, RFPs, and partnership tracking
- **Workflow Automation**: Automated article discovery, entity extraction, and AI-powered analysis
- **Access Control**: User authentication and role-based authorization

---

## Table of Contents
1. [Content Management Tables](#content-management-tables)
   - [articles](#1-articles)
   - [pending_articles](#2-pending_articles)
   - [article_agencies](#3-article_agencies)
   - [article_providers](#4-article_providers)
   - [article_categories](#5-article_categories)
   - [article_verticals](#6-article_verticals)
   - [article_processing_status](#7-article_processing_status)
2. [Entity Management Tables](#entity-management-tables)
   - [transit_agencies](#8-transit_agencies)
   - [service_providers](#9-service_providers)
   - [transportation_providers](#10-transportation_providers)
3. [Business Intelligence Tables](#business-intelligence-tables)
   - [opportunities](#11-opportunities)
   - [reports](#12-reports)
   - [playbooks](#13-playbooks)
4. [System Tables](#system-tables)
   - [discovery_runs](#14-discovery_runs)
   - [user_roles](#15-user_roles)
5. [Database Functions](#database-functions)
6. [Security Model](#security-model)
7. [Data Flow Patterns](#data-flow-patterns)

---

## Content Management Tables

These tables manage the lifecycle of transit industry content from discovery through publication.

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

## Entity Management Tables

These tables manage transit agencies, service providers, and their contractual relationships. The system uses a dual-table architecture for providers to separate entity information from contract performance data.

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

## Business Intelligence Tables

These tables store curated content for business intelligence, market analysis, and educational resources.
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

---

## Detailed Data Flow Patterns

### Article Discovery and Publication Workflow

```
1. Discovery Phase
   └─> Edge Function: discover-articles
       └─> Searches external sources (RSS, APIs, web scraping)
       └─> Creates records in `pending_articles` table
       └─> Triggers Edge Function: transform-article
           └─> Extracts content using AI
           └─> Populates: title, description, content, metadata
           └─> Sets review_status = 'pending'

2. Entity Extraction Phase
   └─> Edge Function: bulk-extract-entities
       └─> Processes pending articles with AI
       └─> Extracts: agencies, providers, categories, verticals, opportunities
       └─> Stores in JSONB fields: extracted_agencies, extracted_providers, etc.
       └─> Updates ai_confidence_score based on extraction quality

3. Admin Review Phase
   └─> Admin reviews in /admin/pending-articles
   └─> Options:
       ├─> Approve → Publish to `articles` table
       │   ├─> Creates article record
       │   ├─> Creates junction records (article_agencies, article_providers, etc.)
       │   ├─> Sets published_article_id
       │   └─> Updates review_status = 'approved'
       └─> Reject → Updates review_status = 'rejected', adds reviewer_notes

4. Agentic Review (Optional)
   └─> Edge Function: agentic-review
       └─> AI evaluates article quality and accuracy
       └─> Provides recommendations for improvement
       └─> Validates entity extractions
```

### Provider and Agency Relationship Management

The system maintains a **dual-table architecture** for provider data:

**`service_providers` Table**:
- Stores provider **entity information** only (name, location, website, notes)
- Each provider appears **once** in this table
- Used for provider directory and provider detail pages
- Primary key: `id` (UUID)
- Unique constraint on `name` field

**`transportation_providers` Table**:
- Stores **contract-specific data** and **performance metrics**
- Each row represents a unique **agency-provider-mode contract**
- Contains 40+ performance metrics per contract (ridership, revenue, costs, efficiency)
- Links to both `transit_agencies` and `service_providers` via foreign keys
- Multiple contracts can exist for the same provider with different agencies/modes

**Data Flow Example**:
```
CSV Import: 2024_Metrics_With_Contracts_JOINED.csv
    ↓
1. Parse CSV row (68 columns of contract data)
    ↓
2. Lookup agency_id using ntd_id
   └─> Query: SELECT id FROM transit_agencies WHERE ntd_id = ?
    ↓
3. Find or create provider entity
   └─> Query: SELECT id FROM service_providers WHERE name = ?
   └─> If not found: INSERT INTO service_providers (name, ...) RETURNING id
    ↓
4. Insert contract record
   └─> INSERT INTO transportation_providers (
         agency_id, provider_id, mode, type_of_contract,
         unlinked_passenger_trips, vehicle_revenue_hours,
         total_operating_expenses, ... [40+ metrics]
       )
    ↓
5. Update service_providers with aggregated data (if needed)
   └─> Calculate totals across all contracts for this provider
```

**Query Patterns**:

```sql
-- Get all contracts for a specific agency
SELECT tp.*, sp.name as provider_name, sp.website
FROM transportation_providers tp
JOIN service_providers sp ON tp.provider_id = sp.id
WHERE tp.agency_id = 'agency-uuid'
ORDER BY sp.name, tp.mode;

-- Get all contracts for a specific provider
SELECT tp.*, ta.agency_name, ta.city, ta.state
FROM transportation_providers tp
JOIN transit_agencies ta ON tp.agency_id = ta.id
WHERE tp.provider_id = 'provider-uuid'
ORDER BY ta.agency_name;

-- Provider performance summary across all contracts
SELECT 
  sp.name,
  COUNT(tp.id) as contract_count,
  SUM(tp.unlinked_passenger_trips) as total_passengers,
  SUM(tp.total_operating_expenses) as total_expenses,
  AVG(tp.cost_per_passenger) as avg_cost_per_passenger
FROM service_providers sp
JOIN transportation_providers tp ON sp.id = tp.provider_id
GROUP BY sp.id, sp.name
ORDER BY total_passengers DESC;
```

### Opportunity Management Workflow

```
1. Opportunity Identification
   ├─> From Article: AI extracts opportunities during entity extraction
   │   └─> Stored in pending_articles.extracted_opportunities (JSONB)
   ├─> Manual Entry: Admin creates directly in opportunities table
   └─> From External Source: RFP notifications, industry alerts

2. Opportunity Creation
   └─> INSERT INTO opportunities (title, notes, agency_id, provider_id, article_id)
       └─> Links to source article (if applicable)
       └─> Links to relevant agency (if specified)
       └─> Links to relevant provider (if specified)

3. Document Management
   ├─> URL Reference: document_url field for external documents
   └─> File Upload: Upload to 'opportunity-documents' storage bucket
       └─> document_file_path stores bucket path
       └─> RLS policies restrict access to authenticated users

4. Opportunity Tracking
   └─> Admin dashboard displays opportunities
   └─> Grouped by agency or provider
   └─> Notes field for tracking progress
   └─> updated_at timestamp tracks last modification
```

---

## Query Optimization Patterns

### Efficient Article Queries with Relationships

```sql
-- Get article with all related entities (agencies, providers, categories)
-- Uses LEFT JOIN to include articles without relationships
SELECT 
  a.*,
  COALESCE(json_agg(DISTINCT jsonb_build_object(
    'id', ta.id,
    'name', ta.agency_name,
    'mention_type', aa.mention_type
  )) FILTER (WHERE ta.id IS NOT NULL), '[]') as agencies,
  COALESCE(json_agg(DISTINCT jsonb_build_object(
    'id', sp.id,
    'name', sp.name,
    'mention_type', ap.mention_type
  )) FILTER (WHERE sp.id IS NOT NULL), '[]') as providers,
  COALESCE(array_agg(DISTINCT ac.category) FILTER (WHERE ac.category IS NOT NULL), ARRAY[]::text[]) as categories,
  COALESCE(array_agg(DISTINCT av.vertical) FILTER (WHERE av.vertical IS NOT NULL), ARRAY[]::text[]) as verticals
FROM articles a
LEFT JOIN article_agencies aa ON a.id = aa.article_id
LEFT JOIN transit_agencies ta ON aa.agency_id = ta.id
LEFT JOIN article_providers ap ON a.id = ap.article_id
LEFT JOIN service_providers sp ON ap.provider_id = sp.id
LEFT JOIN article_categories ac ON a.id = ac.article_id
LEFT JOIN article_verticals av ON a.id = av.article_id
WHERE a.slug = 'article-slug'
GROUP BY a.id;
```

### Performance Considerations

1. **Indexing Strategy**:
   - Primary keys (UUID) automatically indexed
   - Add indexes on frequently queried foreign keys:
     ```sql
     CREATE INDEX idx_article_agencies_article_id ON article_agencies(article_id);
     CREATE INDEX idx_article_agencies_agency_id ON article_agencies(agency_id);
     CREATE INDEX idx_transportation_providers_agency_id ON transportation_providers(agency_id);
     CREATE INDEX idx_transportation_providers_provider_id ON transportation_providers(provider_id);
     ```
   - Add index on slug fields for routing:
     ```sql
     CREATE INDEX idx_articles_slug ON articles(slug);
     CREATE INDEX idx_reports_slug ON reports(slug);
     CREATE INDEX idx_playbooks_slug ON playbooks(slug);
     ```

2. **JSONB Querying**:
   ```sql
   -- Extract specific fields from JSONB
   SELECT 
     id, 
     title,
     ai_analysis->>'summary' as summary,
     jsonb_array_length(extracted_agencies) as agency_count
   FROM pending_articles
   WHERE review_status = 'pending'
   AND ai_confidence_score > 0.7;

   -- Search within JSONB arrays
   SELECT * FROM pending_articles
   WHERE extracted_agencies @> '[{"name": "Metro Transit"}]'::jsonb;
   ```

3. **Pagination Pattern**:
   ```sql
   -- Cursor-based pagination for large result sets
   SELECT * FROM articles
   WHERE created_at < '2024-01-01T00:00:00Z' -- cursor from previous page
   ORDER BY created_at DESC, id DESC
   LIMIT 20;
   ```

---

## Edge Function Integration

### Authentication and Authorization

All edge functions require JWT authentication:

```typescript
// supabase/config.toml
[functions.transform-article]
verify_jwt = true

[functions.bulk-extract-entities]
verify_jwt = true

[functions.discover-articles]
verify_jwt = true

[functions.agentic-review]
verify_jwt = true
```

Edge functions verify admin role using the security definer function:

```typescript
// In edge function
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Service role for admin operations
);

// Check if user has admin role
const { data: hasAdminRole } = await supabaseClient
  .rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });

if (!hasAdminRole) {
  return new Response('Unauthorized', { status: 403 });
}
```

### Edge Function Workflows

**transform-article**:
```typescript
Input: { source_url: string, article_id?: string }
Process:
  1. Fetch article content from source URL
  2. Use Lovable AI to extract structured data
  3. Parse and clean HTML content
  4. Extract metadata (title, author, published_at)
  5. Update or insert into pending_articles
Output: { success: boolean, article_id: string, extracted_data: object }
```

**bulk-extract-entities**:
```typescript
Input: { article_ids: string[] } or { process_all: boolean }
Process:
  1. Fetch pending articles by ID or all pending
  2. For each article:
     a. Use Lovable AI to extract entities
     b. Parse article content for agency names, provider names
     c. Match against existing entities in database
     d. Calculate confidence score
     e. Update extracted_agencies, extracted_providers, etc.
  3. Update ai_confidence_score
Output: { processed: number, succeeded: number, failed: number }
```

**discover-articles**:
```typescript
Input: { sources: string[], days_back: number }
Process:
  1. Query external sources (RSS feeds, APIs)
  2. Filter for transit-related content
  3. Check for duplicates (by source_url)
  4. Create discovery_run record
  5. For each new article:
     a. Insert into pending_articles
     b. Trigger transform-article async
  6. Update discovery_run statistics
Output: { run_id: string, discovered: number, added: number }
```

**agentic-review**:
```typescript
Input: { pending_article_id: string, messages: array }
Process:
  1. Fetch pending article content
  2. Send to Lovable AI for quality review
  3. AI evaluates:
     - Content relevance to transit industry
     - Factual accuracy
     - Entity extraction quality
     - Potential opportunities
  4. Generate recommendations
  5. Update ai_analysis JSONB field
Output: { review: object, recommendations: array, score: number }
```

---

## Security Best Practices

### Row Level Security (RLS) Implementation

**Public vs. Authenticated Access**:
```sql
-- Public read for published content
CREATE POLICY "Anyone can read published articles"
ON public.articles FOR SELECT
USING (true);

-- Authenticated read for sensitive data
CREATE POLICY "Authenticated users can read opportunities"
ON public.opportunities FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Admin-only write operations
CREATE POLICY "Admins can insert articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

**Avoiding RLS Recursion**:

The `has_role()` function uses `SECURITY DEFINER` to bypass RLS when checking roles, preventing infinite recursion:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER  -- Critical: executes with owner privileges
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Storage Bucket Security**:

```sql
-- Public bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true);

-- Private bucket for opportunity documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('opportunity-documents', 'opportunity-documents', false);

-- RLS policy for private bucket
CREATE POLICY "Authenticated users can read opportunity documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'opportunity-documents');
```

### Input Validation Best Practices

**Client-Side Validation**:
- Use zod schemas with react-hook-form
- Validate before sending to edge functions
- Provide immediate feedback to users

**Server-Side Validation (Edge Functions)**:
```typescript
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const transformArticleSchema = z.object({
  source_url: z.string().url().max(2000),
  article_id: z.string().uuid().optional(),
});

// In handler
const body = await req.json();
const validated = transformArticleSchema.parse(body); // Throws if invalid
```

**Database Constraints**:
```sql
-- Enforce data integrity at database level
ALTER TABLE articles ADD CONSTRAINT articles_slug_format 
  CHECK (slug ~ '^[a-z0-9-]+$');

ALTER TABLE pending_articles ADD CONSTRAINT valid_review_status
  CHECK (review_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE opportunities ADD CONSTRAINT require_document_reference
  CHECK (document_url IS NOT NULL OR document_file_path IS NOT NULL OR notes IS NOT NULL);
```

---

## Migration and Maintenance Patterns

### Adding New Columns

```sql
-- Safe migration pattern: add nullable column first
ALTER TABLE articles ADD COLUMN read_time TEXT;

-- Backfill data (optional)
UPDATE articles SET read_time = 
  CONCAT(CEIL(LENGTH(content) / 200.0), ' min read')
WHERE content IS NOT NULL;

-- Make non-nullable if required (after backfill)
ALTER TABLE articles ALTER COLUMN read_time SET NOT NULL;
```

### Data Cleanup Queries

```sql
-- Remove duplicate pending articles (same source URL)
WITH duplicates AS (
  SELECT id, source_url,
    ROW_NUMBER() OVER (PARTITION BY source_url ORDER BY created_at DESC) as rn
  FROM pending_articles
)
DELETE FROM pending_articles
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Clean up orphaned junction records
DELETE FROM article_agencies 
WHERE article_id NOT IN (SELECT id FROM articles);

DELETE FROM article_providers
WHERE article_id NOT IN (SELECT id FROM articles);
```

### Archiving Old Data

```sql
-- Create archive table
CREATE TABLE articles_archive (LIKE articles INCLUDING ALL);

-- Move old articles
WITH moved AS (
  DELETE FROM articles
  WHERE published_at < NOW() - INTERVAL '2 years'
  RETURNING *
)
INSERT INTO articles_archive SELECT * FROM moved;
```

---

## Monitoring and Analytics Queries

### Content Analytics

```sql
-- Most mentioned agencies
SELECT 
  ta.agency_name,
  COUNT(aa.id) as mention_count,
  COUNT(DISTINCT aa.article_id) as unique_articles
FROM transit_agencies ta
JOIN article_agencies aa ON ta.id = aa.agency_id
GROUP BY ta.id, ta.agency_name
ORDER BY mention_count DESC
LIMIT 20;

-- Article publication trends
SELECT 
  DATE_TRUNC('month', published_at) as month,
  COUNT(*) as articles_published,
  COUNT(DISTINCT author_name) as unique_authors
FROM articles
WHERE published_at > NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', published_at)
ORDER BY month DESC;

-- Provider contract summary
SELECT 
  sp.name,
  COUNT(DISTINCT tp.agency_id) as agencies_served,
  COUNT(DISTINCT tp.mode) as modes_operated,
  SUM(tp.unlinked_passenger_trips) as total_annual_ridership,
  SUM(tp.total_operating_expenses) as total_annual_expenses
FROM service_providers sp
JOIN transportation_providers tp ON sp.id = tp.provider_id
GROUP BY sp.id, sp.name
HAVING COUNT(DISTINCT tp.agency_id) > 5 -- Major providers
ORDER BY total_annual_ridership DESC;
```

### System Health Monitoring

```sql
-- Recent discovery run performance
SELECT 
  started_at,
  completed_at,
  completed_at - started_at as duration,
  articles_discovered,
  articles_added,
  ROUND(articles_added::numeric / NULLIF(articles_discovered, 0) * 100, 2) as success_rate_pct
FROM discovery_runs
WHERE started_at > NOW() - INTERVAL '30 days'
ORDER BY started_at DESC;

-- Pending article processing backlog
SELECT 
  review_status,
  COUNT(*) as count,
  AVG(ai_confidence_score) as avg_confidence,
  MIN(discovered_at) as oldest_article,
  MAX(discovered_at) as newest_article
FROM pending_articles
GROUP BY review_status;

-- Storage usage by bucket
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(size) / 1024 / 1024 as total_size_mb
FROM storage.objects
GROUP BY bucket_id;
```

---

## Troubleshooting Common Issues

### Issue: RLS Policy Blocking Operations

**Symptom**: `new row violates row-level security policy`

**Solution**: Check that the policy WITH CHECK expression evaluates to true:
```sql
-- Debug: check if user has required role
SELECT has_role(auth.uid(), 'admin'::app_role);

-- Debug: inspect current user
SELECT auth.uid(), auth.jwt()->'role';

-- Verify policy exists
SELECT * FROM pg_policies WHERE tablename = 'articles';
```

### Issue: Foreign Key Constraint Violation

**Symptom**: `insert or update on table violates foreign key constraint`

**Solution**: Verify referenced record exists:
```sql
-- Check if agency exists before linking
SELECT id FROM transit_agencies WHERE id = 'uuid-here';

-- Use INSERT ... ON CONFLICT for upserts
INSERT INTO service_providers (name, location)
VALUES ('Provider Name', 'City, ST')
ON CONFLICT (name) DO UPDATE SET location = EXCLUDED.location
RETURNING id;
```

### Issue: Slow Query Performance

**Symptom**: Queries taking multiple seconds to execute

**Solution**: Add appropriate indexes and use EXPLAIN ANALYZE:
```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT a.*, COUNT(aa.id) as agency_count
FROM articles a
LEFT JOIN article_agencies aa ON a.id = aa.article_id
GROUP BY a.id;

-- Add index if table scan detected
CREATE INDEX idx_article_agencies_article_id ON article_agencies(article_id);
```

### Issue: JSONB Query Not Finding Records

**Symptom**: Queries with JSONB operators return no results

**Solution**: Check JSONB structure and use correct operators:
```sql
-- Wrong: looking for object in array
SELECT * FROM pending_articles 
WHERE extracted_agencies = '{"name": "Metro"}'::jsonb;

-- Correct: check if array contains object
SELECT * FROM pending_articles 
WHERE extracted_agencies @> '[{"name": "Metro"}]'::jsonb;

-- Debug: inspect actual JSONB structure
SELECT id, jsonb_pretty(extracted_agencies) 
FROM pending_articles 
LIMIT 1;
```

---

## Future Schema Enhancements

Potential additions for future development:

1. **User Activity Tracking**:
   - `user_activity_log` table for audit trail
   - Track article views, searches, downloads

2. **Advanced Analytics**:
   - Materialized views for performance metrics
   - Time-series tables for trend analysis

3. **Collaboration Features**:
   - `article_comments` table for internal discussion
   - `opportunity_assignments` for workflow management

4. **Enhanced Search**:
   - Full-text search indexes on content fields
   - Search history and saved searches per user

5. **Notification System**:
   - `notifications` table for alerts
   - `user_notification_preferences` for customization

6. **API Rate Limiting**:
   - `api_usage_log` for tracking external API calls
   - Rate limit enforcement tables
