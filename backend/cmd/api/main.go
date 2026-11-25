package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"layah-catering-backend/internal/config"
	"layah-catering-backend/internal/db"
	"layah-catering-backend/internal/handlers"
	"layah-catering-backend/internal/middleware"
	"layah-catering-backend/internal/models"
	"layah-catering-backend/internal/repository"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	pool, err := db.NewNeonPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer pool.Close()
	log.Println("Connected to Neon PostgreSQL successfully.")

	// Repositories
	userRepo := repository.NewUserRepository(pool)
	menuRepo := repository.NewMenuRepository(pool)
	orderRepo := repository.NewOrderRepository(pool)
	driverRepo := repository.NewDriverRepository(pool)
	mgmtRepo := repository.NewManagementRepository(pool)

	// Handlers
	healthH := handlers.NewHealthHandler(pool)
	authH := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)
	menuH := handlers.NewMenuHandler(menuRepo)
	orderH := handlers.NewOrderHandler(orderRepo)
	driverH := handlers.NewDriverHandler(driverRepo, orderRepo)
	mgmtH := handlers.NewManagementHandler(mgmtRepo)

	// Middleware builders
	requireAuth := middleware.Authenticate(cfg.JWTSecret)
	protect := func(handler http.HandlerFunc, roles ...models.UserRole) http.Handler {
		var h http.Handler = handler
		if len(roles) > 0 {
			h = middleware.RequireRoles(roles...)(h)
		}
		return requireAuth(h)
	}

	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("GET /api/v1/health", healthH.Check)
	mux.HandleFunc("POST /api/v1/auth/login", authH.Login)
	mux.HandleFunc("POST /api/v1/auth/logout", authH.Logout)
	mux.HandleFunc("GET /api/v1/menus", menuH.List)

	// Authenticated routes
	mux.Handle("GET /api/v1/auth/me", protect(authH.Me))

	// Menu management (Management role only)
	mux.Handle("POST /api/v1/menus", protect(menuH.Create, models.RoleManagement))
	mux.Handle("PUT /api/v1/menus/{id}", protect(menuH.Update, models.RoleManagement))
	mux.Handle("DELETE /api/v1/menus/{id}", protect(menuH.Delete, models.RoleManagement))

	// Orders (Customer checkout, Kitchen KDS, Driver delivery queue, Management overview)
	mux.Handle("GET /api/v1/orders", protect(orderH.List, models.RoleKitchen, models.RoleManagement, models.RoleCustomer, models.RoleDriver))
	mux.Handle("GET /api/v1/orders/{id}", protect(orderH.GetByID, models.RoleKitchen, models.RoleManagement, models.RoleCustomer, models.RoleDriver))
	mux.Handle("POST /api/v1/orders", protect(orderH.Create, models.RoleCustomer, models.RoleManagement))
	mux.Handle("PATCH /api/v1/orders/{id}/status", protect(orderH.UpdateStatus, models.RoleKitchen, models.RoleManagement))

	// Driver dual-QR verification & delivery status
	mux.Handle("POST /api/v1/driver/verify-qr", protect(driverH.VerifyQR, models.RoleDriver, models.RoleManagement))
	mux.Handle("PATCH /api/v1/driver/orders/{id}/deliver", protect(driverH.MarkDelivered, models.RoleDriver, models.RoleManagement))

	// Management analytics & memberships
	mux.Handle("GET /api/v1/management/sales", protect(mgmtH.SalesReport, models.RoleManagement))
	mux.Handle("GET /api/v1/management/memberships", protect(mgmtH.Memberships, models.RoleManagement))

	// Global middleware chain: Logger/Recover -> CORS -> Router
	rootHandler := middleware.LoggerAndRecover(
		middleware.CORS(cfg.CORSOrigin)(mux),
	)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      rootHandler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Printf("Layah Catering Go API listening on http://localhost:%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down Layah Catering API...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
}
