-- +goose Up
CREATE TABLE IF NOT EXISTS histories (
    id           UUID PRIMARY KEY,
    type         VARCHAR(10) NOT NULL,
    question     TEXT        NOT NULL,
    answer       TEXT        NOT NULL,
    from_lang    CHAR(2),
    to_lang      CHAR(2),
    enhancement  VARCHAR(20),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_histories_created_at ON histories (created_at DESC);
CREATE INDEX idx_histories_type       ON histories (type);

-- +goose Down
DROP TABLE IF EXISTS histories;
