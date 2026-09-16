-- Add gate_presets table
CREATE TABLE IF NOT EXISTS gate_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    organizer_id UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gate_presets_organizer_id FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
);
