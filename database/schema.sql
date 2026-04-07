-- Gig Sentry Database Schema

CREATE DATABASE gig_sentry_db;
\c gig_sentry_db;

-- Users (gig workers)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  platform      VARCHAR(50),          -- e.g. 'Uber', 'Ola', 'Rapido', 'Swiggy'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Ride/work session history
CREATE TABLE ride_history (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         TIMESTAMPTZ NOT NULL,
  earnings     NUMERIC(10,2) NOT NULL,
  trips        INTEGER NOT NULL,
  rating       NUMERIC(3,2) NOT NULL,
  score_impact INTEGER DEFAULT 0,
  weather      VARCHAR(50) DEFAULT 'Normal',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Gig score (one row per user, upserted on each entry)
CREATE TABLE gig_scores (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL DEFAULT 742,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active ride sessions (tracks real-time ride state)
CREATE TABLE ride_sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active  BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at   TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_ride_history_user_id ON ride_history(user_id);
CREATE INDEX idx_ride_sessions_user_id ON ride_sessions(user_id);
