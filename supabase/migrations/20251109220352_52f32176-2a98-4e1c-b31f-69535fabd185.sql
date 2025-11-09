-- Add indexes for agency name matching performance
CREATE INDEX IF NOT EXISTS idx_transit_agencies_agency_name ON transit_agencies(agency_name);
CREATE INDEX IF NOT EXISTS idx_transit_agencies_doing_business_as ON transit_agencies(doing_business_as);
CREATE INDEX IF NOT EXISTS idx_transit_agencies_ntd_id ON transit_agencies(ntd_id);
CREATE INDEX IF NOT EXISTS idx_transit_agencies_city_state ON transit_agencies(city, state);