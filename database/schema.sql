-- ============================================================
-- Gig Sentry — PostgreSQL Schema
-- Tracks gig worker income (Swiggy, Blinkit, Uber, Ola, Rapido)
-- to compute a Gig Score for loan and insurance eligibility.
-- ============================================================

CREATE DATABASE gig_sentry_db;
\c gig_sentry_db;

-- ── Users ────────────────────────────────────────────────────
-- One row per gig worker account.
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  platform      VARCHAR(50)   NOT NULL CHECK (platform IN ('Swiggy','Blinkit','Uber','Ola','Rapido','Zomato','Porter','Other')),
  phone         VARCHAR(20),
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- ── Ride / Work History ──────────────────────────────────────
-- One row per logged work day. The source of truth for scoring.
CREATE TABLE ride_history (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  earnings          NUMERIC(10,2) NOT NULL,      -- ₹ earned that day
  trips             INTEGER       NOT NULL,       -- deliveries / rides completed
  rating            NUMERIC(3,2)  NOT NULL,       -- customer rating 1.0–5.0
  score_impact      INTEGER       DEFAULT 0,      -- delta applied to gig_score that day
  weather           VARCHAR(50)   DEFAULT 'Normal',
  platform_override VARCHAR(50),                  -- if worker uses multiple apps
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT rating_range CHECK (rating BETWEEN 1.0 AND 5.0),
  CONSTRAINT earnings_positive CHECK (earnings >= 0),
  CONSTRAINT trips_positive    CHECK (trips >= 0)
);

-- ── Gig Score ────────────────────────────────────────────────
-- One row per user. Upserted every time a history entry is added.
-- Score 0–1000; broken down into 5 components (stored as JSON).
CREATE TABLE gig_scores (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score      INTEGER       NOT NULL DEFAULT 500 CHECK (score BETWEEN 0 AND 1000),
  breakdown  JSONB,          -- { rating, consistency, volume, activity, tenure }
  updated_at TIMESTAMPTZ    DEFAULT NOW()
);

-- ── Ride Sessions ─────────────────────────────────────────────
-- Tracks real-time "online" status (Start Ride / End Ride button).
CREATE TABLE ride_sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active  BOOLEAN      DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at   TIMESTAMPTZ
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_ride_history_user_date  ON ride_history(user_id, date DESC);
CREATE INDEX idx_ride_sessions_user_active ON ride_sessions(user_id, is_active);
