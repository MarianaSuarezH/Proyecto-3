CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

INSERT INTO usuarios (nombre, email)
VALUES
    ('Mariana', 'mariana@example.com'),
    ('Carlos', 'carlos@example.com'),
    ('Laura', 'laura@example.com')
ON CONFLICT (email) DO NOTHING;