.PHONY: run tidy migrate seed build

tidy:
	go mod tidy

run:
	go run ./cmd/api

build:
	go build -o bin/layah-api ./cmd/api

migrate:
	psql "$(DATABASE_URL)" -f migrations/001_schema.sql

seed:
	psql "$(DATABASE_URL)" -f migrations/002_seed.sql
