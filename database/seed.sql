-- Gig Sentry — Seed Data
-- Password for demo user is: demo1234
\c gig_sentry_db;

INSERT INTO users (name, email, password_hash, platform, phone)
VALUES ('Ravi Kumar', 'ravi@gigsentry.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdRe77Z.kK', 'Swiggy', '9876543210');

-- Seed initial gig score (will be recomputed on first real entry)
INSERT INTO gig_scores (user_id, score) VALUES (1, 500);

-- 14 days of history (gives a realistic score)
INSERT INTO ride_history (user_id, date, earnings, trips, rating, score_impact, weather) VALUES
(1, NOW() - INTERVAL '13 days', 1100, 8,  4.7, 0,  'Normal'),
(1, NOW() - INTERVAL '12 days', 1350, 10, 4.8, 0,  'Normal'),
(1, NOW() - INTERVAL '11 days', 800,  6,  4.3, 0,  'Rain'),
(1, NOW() - INTERVAL '10 days', 1500, 12, 5.0, 0,  'Normal'),
(1, NOW() - INTERVAL '9 days',  1250, 9,  4.6, 0,  'Normal'),
(1, NOW() - INTERVAL '8 days',  950,  7,  4.5, 0,  'Heat'),
(1, NOW() - INTERVAL '7 days',  1700, 14, 4.9, 0,  'Normal'),
(1, NOW() - INTERVAL '6 days',  1400, 11, 5.0, 0,  'Normal'),
(1, NOW() - INTERVAL '5 days',  1600, 13, 4.8, 0,  'Normal'),
(1, NOW() - INTERVAL '4 days',  1100, 8,  4.6, 0,  'Rain'),
(1, NOW() - INTERVAL '3 days',  1800, 15, 5.0, 0,  'Normal'),
(1, NOW() - INTERVAL '2 days',  1450, 11, 4.9, 0,  'Normal'),
(1, NOW() - INTERVAL '1 day',   1550, 12, 4.8, 0,  'Normal'),
(1, NOW(),                       1200, 9,  4.7, 0,  'Normal');
