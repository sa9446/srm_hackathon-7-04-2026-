-- Seed data for development/testing
\c gig_sentry_db;

INSERT INTO users (name, email, password_hash, platform)
VALUES ('Demo Driver', 'demo@gigsentry.com', '$2b$10$examplehashhere', 'Uber');

INSERT INTO gig_scores (user_id, score) VALUES (1, 742);

INSERT INTO ride_history (user_id, date, earnings, trips, rating, score_impact, weather) VALUES
(1, '2026-04-01T10:00:00Z', 1200, 8,  4.8, 5,  'Normal'),
(1, '2026-04-02T10:00:00Z', 1550, 12, 5.0, 12, 'Normal'),
(1, '2026-04-03T10:00:00Z', 900,  6,  4.5, -2, 'Rain'),
(1, '2026-04-04T10:00:00Z', 1800, 14, 4.9, 8,  'Normal'),
(1, '2026-04-05T10:00:00Z', 1100, 9,  4.7, 3,  'Heat'),
(1, '2026-04-06T10:00:00Z', 1450, 11, 5.0, 6,  'Normal'),
(1, '2026-04-07T10:00:00Z', 1600, 13, 4.9, 5,  'Normal');
