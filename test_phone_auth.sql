-- Test script to verify phone authentication setup
-- Run this script to test the phone authentication changes

-- 1. Check if the migration was applied correctly
SELECT 
    id,
    email,
    raw_user_meta_data->>'phone' as phone,
    raw_user_meta_data->>'login_method' as login_method
FROM auth.users 
WHERE raw_user_meta_data->>'login_method' = 'phone'
LIMIT 5;

-- 2. Test the phone lookup function
SELECT * FROM auth.get_user_by_phone('01100434503');

-- 3. Check if the trigger exists
SELECT 
    tgname,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Verify the view exists
SELECT 
    viewname,
    viewowner
FROM pg_views 
WHERE viewname = 'users_with_phone';

-- 5. Test phone format validation
SELECT 
    email,
    CASE 
        WHEN email LIKE '%@catalog.app' THEN 
            'Phone format: ' || substring(email from '^(.+)@catalog\.app$')
        ELSE 
            'Email format: ' || email
    END as format_check
FROM auth.users 
LIMIT 3;
