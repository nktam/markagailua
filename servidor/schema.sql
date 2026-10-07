CREATE DATABASE IF NOT EXISTS markagailua
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE markagailua;

CREATE TABLE IF NOT EXISTS scoreboard (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    local_points INT UNSIGNED NOT NULL DEFAULT 0,
    local_tries INT UNSIGNED NOT NULL DEFAULT 0,
    visitor_points INT UNSIGNED NOT NULL DEFAULT 0,
    visitor_tries INT UNSIGNED NOT NULL DEFAULT 0,
    second_half TINYINT(1) NOT NULL DEFAULT 0,
    elapsed_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    is_running TINYINT(1) NOT NULL DEFAULT 0,
    started_at BIGINT UNSIGNED NULL,
    visitor_logo VARCHAR(100) NOT NULL DEFAULT 'Bisitaria.jpg',
    event_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
    last_try_team ENUM('local', 'visitor') NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO scoreboard (id)
VALUES (1)
ON DUPLICATE KEY UPDATE id = VALUES(id);
