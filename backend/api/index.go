package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"sync"

	"layah-catering-backend/pkg/config"
	"layah-catering-backend/pkg/db"
	"layah-catering-backend/pkg/router"
)

var (
	once       sync.Once
	appHandler http.Handler
	initErr    error
)

func initApp() {
	if os.Getenv("DATABASE_URL") == "" {
		initErr = errors.New("DATABASE_URL environment variable is not set")
		return
	}

	cfg := config.Load()
	pool, err := db.NewNeonPool(context.Background(), cfg.DatabaseURL)
	if err != nil {
		initErr = err
		return
	}

	appHandler = router.New(pool, cfg)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(initApp)
	if initErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": "backend initialization failed: " + initErr.Error(),
		})
		return
	}

	appHandler.ServeHTTP(w, r)
}