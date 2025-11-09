-- Rename existing columns to match NTD 2024 schema
ALTER TABLE transit_agencies RENAME COLUMN name TO agency_name;
ALTER TABLE transit_agencies RENAME COLUMN fleet_size TO total_voms;
ALTER TABLE transit_agencies RENAME COLUMN website TO url;
ALTER TABLE transit_agencies RENAME COLUMN formal_name TO doing_business_as;

-- Add address fields (split from location)
ALTER TABLE transit_agencies ADD COLUMN address_line_1 TEXT;
ALTER TABLE transit_agencies ADD COLUMN address_line_2 TEXT;
ALTER TABLE transit_agencies ADD COLUMN zip_code TEXT;
ALTER TABLE transit_agencies ADD COLUMN zip_code_ext TEXT;

-- Migrate location data to city (we'll keep location temporarily for manual cleanup)
ALTER TABLE transit_agencies RENAME COLUMN location TO city;

-- Add new NTD identity fields
ALTER TABLE transit_agencies ADD COLUMN state_parent_ntd_id TEXT;
ALTER TABLE transit_agencies ADD COLUMN legacy_ntd_id TEXT;
ALTER TABLE transit_agencies ADD COLUMN division_department TEXT;
ALTER TABLE transit_agencies ADD COLUMN reporter_acronym TEXT;
ALTER TABLE transit_agencies ADD COLUMN doing_business_as_old TEXT;
ALTER TABLE transit_agencies ADD COLUMN reporter_type TEXT;
ALTER TABLE transit_agencies ADD COLUMN reporting_module TEXT;
ALTER TABLE transit_agencies ADD COLUMN organization_type TEXT;
ALTER TABLE transit_agencies ADD COLUMN reported_by_ntd_id TEXT;
ALTER TABLE transit_agencies ADD COLUMN reported_by_name TEXT;
ALTER TABLE transit_agencies ADD COLUMN subrecipient_type TEXT;
ALTER TABLE transit_agencies ADD COLUMN fy_end_date DATE;
ALTER TABLE transit_agencies ADD COLUMN original_due_date DATE;

-- Add location/demographic fields
ALTER TABLE transit_agencies ADD COLUMN state TEXT;
ALTER TABLE transit_agencies ADD COLUMN region TEXT;
ALTER TABLE transit_agencies ADD COLUMN service_area_sq_miles NUMERIC;
ALTER TABLE transit_agencies ADD COLUMN service_area_pop INTEGER;
ALTER TABLE transit_agencies ADD COLUMN primary_uza_uace_code TEXT;
ALTER TABLE transit_agencies ADD COLUMN uza_name TEXT;
ALTER TABLE transit_agencies ADD COLUMN population INTEGER;
ALTER TABLE transit_agencies ADD COLUMN density NUMERIC;
ALTER TABLE transit_agencies ADD COLUMN sq_miles NUMERIC;

-- Add vehicle/operational fields
ALTER TABLE transit_agencies ADD COLUMN voms_do INTEGER;
ALTER TABLE transit_agencies ADD COLUMN voms_pt INTEGER;
ALTER TABLE transit_agencies ADD COLUMN volunteer_drivers INTEGER;
ALTER TABLE transit_agencies ADD COLUMN personal_vehicles INTEGER;
ALTER TABLE transit_agencies ADD COLUMN tam_tier TEXT;

-- Add FTA fields
ALTER TABLE transit_agencies ADD COLUMN fta_recipient_id TEXT;
ALTER TABLE transit_agencies ADD COLUMN ueid TEXT;