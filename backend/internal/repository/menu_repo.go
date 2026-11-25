package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"layah-catering-backend/internal/models"
)

type MenuRepository struct {
	pool *pgxpool.Pool
}

func NewMenuRepository(pool *pgxpool.Pool) *MenuRepository {
	return &MenuRepository{pool: pool}
}

func (r *MenuRepository) List(ctx context.Context) ([]models.MenuItem, error) {
	const query = `
		SELECT id, name, description, category, price, COALESCE(image_url, ''), is_available, COALESCE(allergens, '{}'), created_at
		FROM menus
		ORDER BY created_at ASC, id ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.MenuItem, 0)
	for rows.Next() {
		var m models.MenuItem
		if err := rows.Scan(
			&m.ID, &m.Name, &m.Description, &m.Category,
			&m.Price, &m.ImageURL, &m.IsAvailable, &m.Allergens, &m.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, m)
	}
	return items, rows.Err()
}

func (r *MenuRepository) Create(ctx context.Context, req models.CreateMenuRequest) (*models.MenuItem, error) {
	id := fmt.Sprintf("menu-%d", time.Now().UnixMilli())
	allergens := req.Allergens
	if allergens == nil {
		allergens = []string{}
	}

	const query = `
		INSERT INTO menus (id, name, description, category, price, image_url, is_available, allergens)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, name, description, category, price, COALESCE(image_url, ''), is_available, COALESCE(allergens, '{}'), created_at
	`
	var m models.MenuItem
	err := r.pool.QueryRow(
		ctx, query,
		id, req.Name, req.Description, req.Category,
		req.Price, req.ImageURL, req.IsAvailable, allergens,
	).Scan(
		&m.ID, &m.Name, &m.Description, &m.Category,
		&m.Price, &m.ImageURL, &m.IsAvailable, &m.Allergens, &m.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *MenuRepository) Update(ctx context.Context, id string, req models.UpdateMenuRequest) (*models.MenuItem, error) {
	const query = `
		UPDATE menus
		SET
			name         = COALESCE($2, name),
			description  = COALESCE($3, description),
			category     = COALESCE($4, category),
			price        = COALESCE($5, price),
			image_url    = COALESCE($6, image_url),
			is_available = COALESCE($7, is_available),
			allergens    = COALESCE($8, allergens)
		WHERE id = $1
		RETURNING id, name, description, category, price, COALESCE(image_url, ''), is_available, COALESCE(allergens, '{}'), created_at
	`
	var m models.MenuItem
	err := r.pool.QueryRow(
		ctx, query,
		id, req.Name, req.Description, req.Category,
		req.Price, req.ImageURL, req.IsAvailable, req.Allergens,
	).Scan(
		&m.ID, &m.Name, &m.Description, &m.Category,
		&m.Price, &m.ImageURL, &m.IsAvailable, &m.Allergens, &m.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *MenuRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM menus WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
