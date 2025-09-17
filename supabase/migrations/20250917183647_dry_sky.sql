/*
  # Create movements table for staff movement requests

  1. New Tables
    - `movements`
      - `id` (uuid, primary key)
      - `personnel_id` (uuid, foreign key) - Reference to personnel
      - `type` (text) - Type of movement
      - `date_debut` (date) - Start date
      - `date_fin` (date) - End date
      - `motif` (text) - Reason/Motive
      - `justification` (text) - Additional justification
      - `piece_jointe` (text array) - Attachments URLs
      - `statut` (text) - Status of the request
      - `demande_par` (uuid) - Requested by (personnel ID)
      - `date_demande` (timestamp) - Request date
      - `validation_hierarchie` (jsonb) - Hierarchical validation info
      - `validation_rh` (jsonb) - HR validation info
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `movements` table
    - Add policies for CRUD operations based on user roles
*/

CREATE TABLE IF NOT EXISTS movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id uuid NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'conge', 'mission', 'permission_absence', 'autorisation_absence',
    'convalescence', 'hospitalise', 'formation', 'repos_maladie'
  )),
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  motif text NOT NULL,
  justification text DEFAULT '',
  piece_jointe text[] DEFAULT '{}',
  statut text DEFAULT 'brouillon' CHECK (statut IN (
    'brouillon', 'soumise', 'en_cours', 'approuvee', 'rejetee'
  )),
  demande_par uuid NOT NULL REFERENCES personnel(id),
  date_demande timestamptz DEFAULT now(),
  validation_hierarchie jsonb DEFAULT '{"statut": "en_attente"}',
  validation_rh jsonb DEFAULT '{"statut": "en_attente"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_date_range CHECK (date_fin >= date_debut)
);

ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own movements and managers can read their team's movements
CREATE POLICY "Users can read movements" ON movements
FOR SELECT TO authenticated
USING (
  personnel_id IN (
    SELECT id FROM personnel WHERE email = auth.jwt() ->> 'email'
  ) OR
  EXISTS (
    SELECT 1 FROM personnel p1, personnel p2
    WHERE p1.email = auth.jwt() ->> 'email'
    AND p2.id = personnel_id
    AND (
      p1.role IN ('rh', 'admin') OR
      (p1.role = 'chef_service' AND p1.service = p2.service)
    )
  )
);

-- Policy: Users can insert their own movement requests
CREATE POLICY "Users can create movements" ON movements
FOR INSERT TO authenticated
WITH CHECK (
  personnel_id IN (
    SELECT id FROM personnel WHERE email = auth.jwt() ->> 'email'
  ) AND
  demande_par IN (
    SELECT id FROM personnel WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Users can update their own draft movements, managers can update validations
CREATE POLICY "Users can update movements" ON movements
FOR UPDATE TO authenticated
USING (
  (
    personnel_id IN (
      SELECT id FROM personnel WHERE email = auth.jwt() ->> 'email'
    ) AND statut = 'brouillon'
  ) OR
  EXISTS (
    SELECT 1 FROM personnel p1, personnel p2
    WHERE p1.email = auth.jwt() ->> 'email'
    AND p2.id = personnel_id
    AND (
      p1.role IN ('rh', 'admin') OR
      (p1.role = 'chef_service' AND p1.service = p2.service)
    )
  )
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_movements_updated_at
  BEFORE UPDATE ON movements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movements_personnel_id ON movements(personnel_id);
CREATE INDEX IF NOT EXISTS idx_movements_statut ON movements(statut);
CREATE INDEX IF NOT EXISTS idx_movements_type ON movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_date_debut ON movements(date_debut);
CREATE INDEX IF NOT EXISTS idx_movements_date_demande ON movements(date_demande);