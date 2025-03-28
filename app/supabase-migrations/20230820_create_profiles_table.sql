-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up access policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles" 
ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create entries for existing users (if any)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING; 