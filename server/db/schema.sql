CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'donor' CHECK (role IN ('donor','charity','volunteer','admin')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(60) NOT NULL,
  location VARCHAR(120),
  goal_amount NUMERIC(14,2) NOT NULL CHECK (goal_amount > 0),
  raised_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (raised_amount >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','rejected','paused')),
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  donor_name VARCHAR(120),
  donor_phone VARCHAR(20),
  donor_email VARCHAR(180),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 10),
  currency CHAR(3) NOT NULL DEFAULT 'KES',
  provider VARCHAR(40) NOT NULL DEFAULT 'mpesa',
  merchant_request_id VARCHAR(120),
  checkout_request_id VARCHAR(120),
  transaction_reference VARCHAR(120),
  mpesa_receipt_number VARCHAR(120),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed','refunded')),
  result_code INTEGER,
  result_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID UNIQUE NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  receipt_number VARCHAR(80) UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  location VARCHAR(120),
  event_date TIMESTAMPTZ,
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(opportunity_id, volunteer_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_category_idx ON campaigns(category);
CREATE INDEX IF NOT EXISTS donations_campaign_idx ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);
CREATE INDEX IF NOT EXISTS donations_checkout_idx ON donations(checkout_request_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);

ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_email VARCHAR(180);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS merchant_request_id VARCHAR(120);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(120);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(120);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS result_code INTEGER;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS result_description TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS donations_checkout_request_uidx ON donations(checkout_request_id) WHERE checkout_request_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS donations_transaction_reference_uidx ON donations(transaction_reference) WHERE transaction_reference IS NOT NULL;
