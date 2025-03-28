-- First, check if the avatars bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create simpler, more permissive policies for troubleshooting
CREATE POLICY "Public read access for avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Make sure authenticated users are allowed to use the avatars bucket
CREATE POLICY "Allow authenticated users to use the bucket" 
ON storage.buckets FOR ALL 
USING (name = 'avatars' AND auth.role() = 'authenticated');

-- Create more specific policies if the above doesn't work
CREATE POLICY "Users can upload to avatars folder" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

-- Enable RLS on buckets if it's not already enabled
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on objects if it's not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 