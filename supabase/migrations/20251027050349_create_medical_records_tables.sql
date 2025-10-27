/*
  # Create HealthSense AI Database Schema

  ## Overview
  Complete database schema for HealthSense AI medical assistant application
  supporting medical records management, symptom assessments, and chat sessions.

  ## New Tables

  ### 1. medical_records
  Stores uploaded medical reports and test results
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `record_type` (text) - Type of medical record (Blood Test, X-Ray, etc.)
  - `report_date` (date) - Date of the medical report
  - `lab_name` (text) - Laboratory or hospital name
  - `file_path` (text) - Path to stored file
  - `extracted_text` (text) - OCR extracted text from document
  - `parsed_data` (jsonb) - Structured medical test values
  - `notes` (text) - Optional user notes
  - `status` (text) - NORMAL, MONITOR, or URGENT
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. symptom_assessments
  Stores AI-generated symptom analysis results
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `symptoms` (text) - Description of symptoms
  - `age` (integer)
  - `gender` (text)
  - `duration` (text)
  - `severity` (integer) - Scale 1-10
  - `urgency_level` (text) - NORMAL, MODERATE, or URGENT
  - `urgency_score` (integer) - Score 0-100
  - `possible_conditions` (jsonb) - Array of condition objects
  - `recommended_tests` (jsonb) - Array of test recommendations
  - `action_items` (jsonb) - Array of suggested actions
  - `warning_signs` (jsonb) - Array of warning signs
  - `when_to_seek_care` (text)
  - `created_at` (timestamptz)

  ### 3. report_explanations
  Stores AI-generated explanations of medical reports
  - `id` (uuid, primary key)
  - `record_id` (uuid, references medical_records)
  - `simple_summary` (text)
  - `key_findings` (jsonb) - Array of finding objects
  - `overall_health_score` (integer) - Score 0-100
  - `risk_level` (text) - LOW, MODERATE, or HIGH
  - `positive_findings` (jsonb) - Array of positive findings
  - `concerns` (jsonb) - Array of concerns
  - `next_steps` (jsonb) - Array of recommended next steps
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. chat_sessions
  Stores chat conversation sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. chat_messages
  Stores individual chat messages
  - `id` (uuid, primary key)
  - `session_id` (uuid, references chat_sessions)
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - Message content
  - `referenced_records` (jsonb) - Array of record IDs referenced
  - `confidence_score` (float) - AI confidence level
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations
*/

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL,
  report_date DATE NOT NULL,
  lab_name TEXT NOT NULL,
  file_path TEXT,
  extracted_text TEXT,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  status TEXT DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'MONITOR', 'URGENT')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create symptom_assessments table
CREATE TABLE IF NOT EXISTS symptom_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symptoms TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  duration TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  urgency_level TEXT DEFAULT 'NORMAL' CHECK (urgency_level IN ('NORMAL', 'MODERATE', 'URGENT')),
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  possible_conditions JSONB DEFAULT '[]'::jsonb,
  recommended_tests JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  warning_signs JSONB DEFAULT '[]'::jsonb,
  when_to_seek_care TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create report_explanations table
CREATE TABLE IF NOT EXISTS report_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  simple_summary TEXT NOT NULL,
  key_findings JSONB DEFAULT '[]'::jsonb,
  overall_health_score INTEGER DEFAULT 0 CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  risk_level TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  positive_findings JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  referenced_records JSONB DEFAULT '[]'::jsonb,
  confidence_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_report_date ON medical_records(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_user_id ON symptom_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_report_explanations_record_id ON report_explanations(record_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medical_records
CREATE POLICY "Users can view own medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical records"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical records"
  ON medical_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for symptom_assessments
CREATE POLICY "Users can view own symptom assessments"
  ON symptom_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom assessments"
  ON symptom_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for report_explanations
CREATE POLICY "Users can view explanations for own records"
  ON report_explanations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_records
      WHERE medical_records.id = report_explanations.record_id
      AND medical_records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert explanations for own records"
  ON report_explanations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medical_records
      WHERE medical_records.id = report_explanations.record_id
      AND medical_records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update explanations for own records"
  ON report_explanations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_records
      WHERE medical_records.id = report_explanations.record_id
      AND medical_records.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medical_records
      WHERE medical_records.id = report_explanations.record_id
      AND medical_records.user_id = auth.uid()
    )
  );

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages from own sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_explanations_updated_at
  BEFORE UPDATE ON report_explanations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
