-- Update Overview menu URL to /dashboard/overview
UPDATE menus
SET url = '/dashboard/overview', updated_at = CURRENT_TIMESTAMP
WHERE url = '/dashboard'
   OR (title = 'Overview' AND (url IS NULL OR url = '/dashboard'));
