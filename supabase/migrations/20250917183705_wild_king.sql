/*
  # Create notifications table for user notifications

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `destinataire_id` (uuid) - Recipient personnel ID
      - `type` (text) - Notification type
      - `titre` (text) - Notification title
      - `message` (text) - Notification message
      - `mouvement_id` (uuid, optional) - Related movement ID
      - `lu` (boolean) - Read status
      - `date_creation` (timestamp) - Creation date
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire_id uuid NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  type text NOT NULL,
  titre text NOT NULL,
  message text NOT NULL,
  mouvement_id uuid REFERENCES movements(id) ON DELETE SET NULL,
  lu boolean DEFAULT false,
  date_creation timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
FOR SELECT TO authenticated
USING (
  destinataire_id IN (
    SELECT id FROM personnel WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: System can insert notifications (this will be used by triggers/functions)
CREATE POLICY "System can insert notifications" ON notifications
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policy: Users can update their own notifications (mainly to mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE TO authenticated
USING (
  destinataire_id IN (
    SELECT id FROM personnel WHERE email = auth.jwt() ->> 'email'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_destinataire_id ON notifications(destinataire_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu);
CREATE INDEX IF NOT EXISTS idx_notifications_date_creation ON notifications(date_creation);
CREATE INDEX IF NOT EXISTS idx_notifications_mouvement_id ON notifications(mouvement_id);