-- Create municipalities table
CREATE TABLE public.municipalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role enum
CREATE TYPE public.user_role AS ENUM ('citizen', 'administrator', 'municipality_head', 'co_municipality');

-- Update profiles table to support new roles and municipality connection
ALTER TABLE public.profiles 
ADD COLUMN municipality_id UUID REFERENCES public.municipalities(id) ON DELETE SET NULL,
ADD COLUMN phone TEXT,
ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
ALTER COLUMN role SET DEFAULT 'citizen';

-- Update reports table to work as issues system
ALTER TABLE public.reports 
ADD COLUMN municipality_id UUID REFERENCES public.municipalities(id) ON DELETE SET NULL,
ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN priority TEXT DEFAULT 'medium',
ADD COLUMN lat NUMERIC,
ADD COLUMN lng NUMERIC,
ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE;

-- Create audit logs table for tracking actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Administrators can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  )
);

-- RLS policies for reports (issues)
DROP POLICY IF EXISTS "Public read reports" ON public.reports;

-- Citizens can view all reports but create only their own
CREATE POLICY "Citizens can view all reports" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Citizens can create own reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Municipality staff can update reports in their municipality
CREATE POLICY "Municipality staff can update reports" 
ON public.reports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('municipality_head', 'co_municipality')
    AND municipality_id = reports.municipality_id
  )
);

-- Administrators can update any report
CREATE POLICY "Administrators can update any report" 
ON public.reports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  )
);

-- Administrators can delete reports
CREATE POLICY "Administrators can delete reports" 
ON public.reports 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  )
);

-- RLS policies for municipalities
CREATE POLICY "Everyone can view municipalities" 
ON public.municipalities 
FOR SELECT 
USING (true);

CREATE POLICY "Administrators can manage municipalities" 
ON public.municipalities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  )
);

-- RLS policies for audit logs
CREATE POLICY "Administrators can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  )
);

-- Update triggers for timestamps
CREATE TRIGGER update_municipalities_updated_at
BEFORE UPDATE ON public.municipalities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample municipalities
INSERT INTO public.municipalities (name, address, contact_email) VALUES
('Central Municipality', '123 Main St, City Center', 'central@municipality.gov'),
('North District', '456 North Ave, North District', 'north@municipality.gov'),
('South District', '789 South Rd, South District', 'south@municipality.gov');

-- Update handle_new_user function to use new role type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'citizen'::public.user_role
  );
  RETURN new;
END;
$$;