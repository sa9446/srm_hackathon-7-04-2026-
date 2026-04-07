const pool = require('./db');

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    platform      VARCHAR(50)   NOT NULL CHECK (platform IN ('Swiggy','Blinkit','Uber','Ola','Rapido','Zomato','Porter','Other')),
    phone         VARCHAR(20),
    face_descriptor FLOAT8[],
    created_at    TIMESTAMPTZ   DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ride_history (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    earnings          NUMERIC(10,2) NOT NULL,
    trips             INTEGER       NOT NULL,
    rating            NUMERIC(3,2)  NOT NULL,
    score_impact      INTEGER       DEFAULT 0,
    weather           VARCHAR(50)   DEFAULT 'Normal',
    platform_override VARCHAR(50),
    created_at        TIMESTAMPTZ   DEFAULT NOW(),
    CONSTRAINT rating_range CHECK (rating BETWEEN 1.0 AND 5.0),
    CONSTRAINT earnings_positive CHECK (earnings >= 0),
    CONSTRAINT trips_positive    CHECK (trips >= 0)
  );

  CREATE TABLE IF NOT EXISTS gig_scores (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score      INTEGER       NOT NULL DEFAULT 500 CHECK (score BETWEEN 0 AND 1000),
    breakdown  JSONB,
    updated_at TIMESTAMPTZ   DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ride_sessions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active  BOOLEAN      DEFAULT false,
    started_at TIMESTAMPTZ,
    ended_at   TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_ride_history_user_date    ON ride_history(user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_ride_sessions_user_active ON ride_sessions(user_id, is_active);
`;

async function migrate() {
  try {
    await pool.query(schema);
    console.log('Database schema applied.');
  } catch (err) {
    console.error('Migration error:', err.message);
    throw err;
  }
}

module.exports = migrate;
