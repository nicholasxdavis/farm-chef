
-- Add columns for add-ons and dietary tags to menu_items table
ALTER TABLE menu_items 
ADD COLUMN addons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN dietary_tags TEXT[] DEFAULT '{}';

-- Update existing items to have empty arrays for new columns
UPDATE menu_items 
SET addons = '[]'::jsonb, dietary_tags = '{}' 
WHERE addons IS NULL OR dietary_tags IS NULL;
