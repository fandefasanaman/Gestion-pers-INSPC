/*
  # Insert sample personnel data for INSPC

  1. Sample Data
    - Admin user
    - HR users
    - Department managers
    - Regular staff members

  2. Initial Setup
    - Create default admin account
    - Set up basic organizational structure
*/

-- Insert sample personnel data
INSERT INTO personnel (
  nom, prenoms, im, date_naissance, lieu, cin, corps, grade, indice, 
  fonction, date_entree_inspc, email, service, chef_service, actif, role
) VALUES 
-- Admin user
('ADMIN', 'Système', 'ADM001', '1980-01-01', 'Antananarivo', '101000000001', 
 'Administration', 'Directeur', 1000, 'Administrateur Système', '2020-01-01', 
 'admin@inspc.mg', 'Direction', 'AUTO', true, 'admin'),

-- HR users
('RAZAFI', 'Marie Claire', 'RH001', '1985-03-15', 'Antananarivo', '101850315001', 
 'Administratif', 'Attaché Principal', 750, 'Responsable RH', '2021-02-01', 
 'marie.razafi@inspc.mg', 'Ressources Humaines', 'ADMIN', true, 'rh'),

-- Department managers
('RAKOTO', 'Jean Pierre', 'MAN001', '1978-07-20', 'Fianarantsoa', '101780720001', 
 'Technique', 'Ingénieur Principal', 850, 'Chef Service Informatique', '2019-09-01', 
 'jean.rakoto@inspc.mg', 'Informatique', 'ADMIN', true, 'chef_service'),

('ANDRY', 'Hery', 'MAN002', '1982-11-10', 'Toamasina', '101821110001', 
 'Médical', 'Médecin Spécialiste', 900, 'Chef Service Épidémiologie', '2020-03-15', 
 'hery.andry@inspc.mg', 'Épidémiologie', 'ADMIN', true, 'chef_service'),

-- Regular personnel
('RABE', 'Tantely', 'PER001', '1990-05-12', 'Antananarivo', '101900512001', 
 'Technique', 'Ingénieur', 650, 'Développeur', '2022-01-10', 
 'tantely.rabe@inspc.mg', 'Informatique', 'RAKOTO', true, 'personnel'),

('RASOA', 'Mialy', 'PER002', '1988-08-25', 'Antananarivo', '101880825001', 
 'Médical', 'Médecin', 700, 'Épidémiologiste', '2021-06-01', 
 'mialy.rasoa@inspc.mg', 'Épidémiologie', 'ANDRY', true, 'personnel'),

('RANDRIA', 'Voahirana', 'PER003', '1992-02-18', 'Antsirabe', '101920218001', 
 'Administratif', 'Secrétaire', 500, 'Secrétaire de Direction', '2023-03-01', 
 'voahirana.randria@inspc.mg', 'Direction', 'ADMIN', true, 'personnel'),

('RANAIVO', 'Mamy', 'PER004', '1987-12-03', 'Mahajanga', '101871203001', 
 'Technique', 'Technicien Supérieur', 600, 'Technicien Labo', '2020-09-15', 
 'mamy.ranaivo@inspc.mg', 'Laboratoire', 'ADMIN', true, 'personnel'),

('RAJAO', 'Fidy', 'PER005', '1991-04-30', 'Toliara', '101910430001', 
 'Administratif', 'Comptable', 650, 'Gestionnaire Financier', '2022-05-01', 
 'fidy.rajao@inspc.mg', 'Finances', 'ADMIN', true, 'personnel');

-- Insert some sample movement requests
INSERT INTO movements (
  personnel_id, type, date_debut, date_fin, motif, justification, 
  statut, demande_par, date_demande
) VALUES 
(
  (SELECT id FROM personnel WHERE email = 'tantely.rabe@inspc.mg'),
  'conge',
  '2024-12-20',
  '2024-12-31',
  'Congés annuels',
  'Congés de fin d''année',
  'soumise',
  (SELECT id FROM personnel WHERE email = 'tantely.rabe@inspc.mg'),
  now() - interval '2 days'
),
(
  (SELECT id FROM personnel WHERE email = 'mialy.rasoa@inspc.mg'),
  'mission',
  '2024-11-15',
  '2024-11-17',
  'Mission de supervision',
  'Supervision des activités dans la région SAVA',
  'approuvee',
  (SELECT id FROM personnel WHERE email = 'mialy.rasoa@inspc.mg'),
  now() - interval '5 days'
),
(
  (SELECT id FROM personnel WHERE email = 'voahirana.randria@inspc.mg'),
  'permission_absence',
  '2024-11-25',
  '2024-11-25',
  'Rendez-vous médical',
  'Contrôle médical de routine',
  'en_cours',
  (SELECT id FROM personnel WHERE email = 'voahirana.randria@inspc.mg'),
  now() - interval '1 day'
);