package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type HealthHandler struct {
	pool *pgxpool.Pool
}

func NewHealthHandler(pool *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{pool: pool}
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	if err := h.pool.Ping(ctx); err != nil {
		WriteError(w, http.StatusServiceUnavailable, "neon database unreachable")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]string{
		"status":   "ok",
		"service":  "layah-catering-api",
		"database": "neon-postgres-connected",
	})
}
