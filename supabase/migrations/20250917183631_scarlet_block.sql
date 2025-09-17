/*
  # Create personnel table for INSPC staff management

  1. New Tables
    - `personnel`
      - `id` (uuid, primary key)
      - `nom` (text) - Last name
      - `prenoms` (text) - First names
      - `im` (text) - Registration number
      - `date_naissance` (date) - Birth date
      - `lieu` (text) - Birth place
      - `cin` (text) - National ID
      - `corps` (text) - Body/Category
      - `grade` (text) - Grade
      - `indice` (integer) - Index
      - `fonction` (text) - Function/Position
      - `date_entree_inspc` (date) - Entry date at INSPC
      - `email` (text, unique) - Email address
      - `service` (text) - Department/Service
      - `chef_service` (text) - Service manager
      - `actif` (boolean) - Active status
      - `role` (text) - User role (personnel, chef_service, rh, admin)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `personnel` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenoms text NOT NULL,
  im text UNIQUE NOT NULL,
  date_naissance date NOT NULL,
  lieu text NOT NULL,
  cin text UNIQUE NOT NULL,
  corps text NOT NULL,
  grade text NOT NULL,
  indice integer NOT NULL,
  fonction text NOT NULL,
  date_entree_inspc date NOT NULL,
  email text UNIQUE NOT NULL,
  service text NOT NULL,
  chef_service text NOT NULL,
  actif boolean DEFAULT true,
  role text DEFAULT 'personnel' CHECK (role IN ('personnel', 'chef_service', 'rh', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data and managers can read their team's data
CREATE POLICY "Users can read personnel data" ON personnel
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'email' = email OR
  role IN ('rh', 'admin') OR
  (role = 'chef_service' AND service IN (
    SELECT service FROM personnel WHERE email = auth.jwt() ->> 'email'
  ))
);

-- Policy: Only HR and admin can insert personnel
CREATE POLICY "HR and admin can insert personnel" ON personnel
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM personnel 
    WHERE email = auth.jwt() ->> 'email' 
    AND role IN ('rh', 'admin')
  )
);

-- Policy: Users can update their own basic info, HR and admin can update all
CREATE POLICY "Users can update personnel data" ON personnel
FOR UPDATE TO authenticated
USING (
  auth.jwt() ->> 'email' = email OR
  EXISTS (
    SELECT 1 FROM personnel 
    WHERE email = auth.jwt() ->> 'email' 
    AND role IN ('rh', 'admin')
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personnel_updated_at
  BEFORE UPDATE ON personnel
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();