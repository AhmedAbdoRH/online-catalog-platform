-- Migration to update user authentication to use phone numbers
-- This migration adds phone number metadata to existing users and updates the auth system

-- Update existing users to store their phone number in metadata
-- Extract phone number from email format (phone@catalog.app)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object(
        'phone', substring(email from '^(.+)@catalog\.app$'),
        'login_method', 'phone'
    )
WHERE email LIKE '%@catalog.app';

-- Create a function to handle phone number authentication
CREATE OR REPLACE FUNCTION auth.get_user_by_phone(phone_number TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        (u.raw_user_meta_data->>'phone') as phone,
        u.created_at
    FROM auth.users u
    WHERE u.raw_user_meta_data->>'phone' = phone_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically set phone metadata for new users
CREATE OR REPLACE FUNCTION auth.set_phone_metadata()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email LIKE '%@catalog.app' THEN
        NEW.raw_user_meta_data = NEW.raw_user_meta_data || 
            jsonb_build_object(
                'phone', substring(NEW.email from '^(.+)@catalog\.app$'),
                'login_method', 'phone'
            );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.set_phone_metadata();

-- Create a view for easier phone-based user queries
CREATE OR REPLACE VIEW auth.users_with_phone AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'phone' as phone,
    u.raw_user_meta_data->>'login_method' as login_method,
    u.raw_user_meta_data
FROM auth.users u
WHERE u.raw_user_meta_data->>'login_method' = 'phone';
