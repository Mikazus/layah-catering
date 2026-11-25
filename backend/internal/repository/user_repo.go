package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"layah-catering-backend/internal/models"
)

var ErrNotFound = errors.New("record not found")

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) FindByUsernameAndRole(ctx context.Context, username string, role models.UserRole) (*models.User, error) {
	const query = `
		SELECT id::text, username, password_hash, full_name, email, phone, role, initials, title
		FROM users
		WHERE LOWER(username) = LOWER($1) AND role = $2 AND is_active = TRUE
		LIMIT 1
	`
	var u models.User
	err := r.pool.QueryRow(ctx, query, username, string(role)).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.FullName,
		&u.Email, &u.Phone, &u.Role, &u.Initials, &u.Title,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	const query = `
		SELECT id::text, username, password_hash, full_name, email, phone, role, initials, title
		FROM users
		WHERE id = $1::uuid AND is_active = TRUE
		LIMIT 1
	`
	var u models.User
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.FullName,
		&u.Email, &u.Phone, &u.Role, &u.Initials, &u.Title,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
