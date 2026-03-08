/*
  # Payment and Invoice System with Stripe Integration

  ## Overview
  This migration creates a comprehensive payment and invoicing system for course enrollments with Stripe integration.

  ## New Tables Created

  ### 1. payments
  Tracks all payment transactions for course enrollments
  - `id` (uuid, primary key)
  - `enrollment_id` (uuid, foreign key to course_enrollments)
  - `user_id` (uuid, foreign key to auth.users)
  - `amount` (numeric) - Payment amount
  - `currency` (text) - Currency code (e.g., USD, GBP)
  - `status` (text) - Payment status: pending, completed, failed, refunded
  - `stripe_payment_intent_id` (text) - Stripe Payment Intent ID
  - `stripe_charge_id` (text) - Stripe Charge ID
  - `payment_method` (text) - Payment method used
  - `paid_at` (timestamptz) - When payment was completed
  - `refunded_at` (timestamptz) - When payment was refunded
  - `metadata` (jsonb) - Additional payment metadata
  - `created_at` (timestamptz)

  ### 2. invoices
  Stores invoice records for payments
  - `id` (uuid, primary key)
  - `invoice_number` (text, unique) - Sequential invoice number
  - `payment_id` (uuid, foreign key to payments)
  - `user_id` (uuid, foreign key to auth.users)
  - `enrollment_id` (uuid, foreign key to course_enrollments)
  - `course_title` (text) - Course name at time of purchase
  - `amount` (numeric) - Invoice amount
  - `currency` (text) - Currency code
  - `tax_amount` (numeric) - Tax amount
  - `total_amount` (numeric) - Total including tax
  - `status` (text) - Invoice status: draft, issued, paid, cancelled
  - `issued_at` (timestamptz) - When invoice was issued
  - `due_date` (timestamptz) - Payment due date
  - `paid_at` (timestamptz) - When invoice was paid
  - `billing_details` (jsonb) - Customer billing information
  - `line_items` (jsonb) - Invoice line items
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz)

  ### 3. stripe_webhooks
  Logs all incoming Stripe webhook events
  - `id` (uuid, primary key)
  - `event_id` (text, unique) - Stripe event ID
  - `event_type` (text) - Webhook event type
  - `payload` (jsonb) - Full webhook payload
  - `processed` (boolean) - Whether event was processed
  - `processed_at` (timestamptz) - When event was processed
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can view their own payment history and invoices
  - Admins can view all payments and invoices
  - Webhook table is admin-only
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES course_enrollments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  stripe_charge_id text,
  payment_method text,
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES course_enrollments(id) ON DELETE SET NULL,
  course_title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
  issued_at timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  billing_details jsonb DEFAULT '{}'::jsonb,
  line_items jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create stripe_webhooks table
CREATE TABLE IF NOT EXISTS stripe_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON stripe_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed ON stripe_webhooks(processed);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments table

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only admins can insert payments
CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only admins can update payments
CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for invoices table

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only admins can insert invoices
CREATE POLICY "Admins can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only admins can update invoices
CREATE POLICY "Admins can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for stripe_webhooks table

-- Only admins can view webhooks
CREATE POLICY "Admins can view webhooks"
  ON stripe_webhooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only admins can insert webhooks
CREATE POLICY "Admins can insert webhooks"
  ON stripe_webhooks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only admins can update webhooks
CREATE POLICY "Admins can update webhooks"
  ON stripe_webhooks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  invoice_num text;
BEGIN
  SELECT COUNT(*) + 1 INTO next_number FROM invoices;
  invoice_num := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(next_number::text, 5, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;