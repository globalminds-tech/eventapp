-- Migration 006: Add overall_space_sqft to event_layout and venue_total_area_sqft to event_details_table

ALTER TABLE event_layout 
ADD COLUMN IF NOT EXISTS overall_space_sqft NUMERIC(12, 2);

ALTER TABLE event_details_table 
ADD COLUMN IF NOT EXISTS venue_total_area_sqft NUMERIC(12, 2);
