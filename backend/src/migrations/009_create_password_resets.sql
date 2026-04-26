-- Create PasswordResets table
CREATE TABLE IF NOT EXISTS PasswordResets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    isUsed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_email ON PasswordResets (email);
CREATE INDEX idx_password_resets_otp ON PasswordResets (otp);
