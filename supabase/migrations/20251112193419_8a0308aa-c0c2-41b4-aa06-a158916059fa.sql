-- Fix integer overflow issues in transportation_providers table
-- Change integer columns to bigint to handle large values

ALTER TABLE transportation_providers 
  ALTER COLUMN unlinked_passenger_trips TYPE bigint,
  ALTER COLUMN voms_under_contract TYPE bigint,
  ALTER COLUMN months_seller_operated_in_fy TYPE bigint;

-- Clear existing data to prepare for clean re-import
DELETE FROM transportation_providers;