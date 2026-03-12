-- Run this in your Supabase SQL Editor

-- Create enum for inventory types
CREATE TYPE inventory_type AS ENUM ('seeds', 'fertilizers', 'vet_chemicals', 'pesticides');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type inventory_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory is viewable by authenticated users." ON public.inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory is insertable by authenticated users." ON public.inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Inventory is updatable by authenticated users." ON public.inventory FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory is deletable by authenticated users." ON public.inventory FOR DELETE USING (auth.role() = 'authenticated');

-- Create recipients table
CREATE TABLE public.recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rsbsa_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  barangay TEXT NOT NULL,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for recipients
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipients are viewable by authenticated users." ON public.recipients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Recipients are insertable by authenticated users." ON public.recipients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Recipients are updatable by authenticated users." ON public.recipients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Recipients are deletable by authenticated users." ON public.recipients FOR DELETE USING (auth.role() = 'authenticated');

-- Create distributions table
CREATE TABLE public.distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.recipients(id) ON DELETE CASCADE NOT NULL,
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
  quantity NUMERIC NOT NULL,
  date_distributed DATE NOT NULL DEFAULT CURRENT_DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for distributions
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Distributions are viewable by authenticated users." ON public.distributions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Distributions are insertable by authenticated users." ON public.distributions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Distributions are updatable by authenticated users." ON public.distributions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Distributions are deletable by authenticated users." ON public.distributions FOR DELETE USING (auth.role() = 'authenticated');

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'user'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update inventory quantity on distribution insert
CREATE OR REPLACE FUNCTION public.update_inventory_quantity()
RETURNS trigger AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.inventory_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_distribution_created
  AFTER INSERT ON public.distributions
  FOR EACH ROW EXECUTE PROCEDURE public.update_inventory_quantity();
