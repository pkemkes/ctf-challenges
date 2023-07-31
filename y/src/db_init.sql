CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL,
    profile_pic TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS yeets (
    yeet_id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    placeholder INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS secrets (
    user_id INTEGER PRIMARY KEY,
    secret TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
    yeet_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (yeet_id, user_id)
);