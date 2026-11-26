package router

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"layah-catering-backend/pkg/config"
	"layah-catering-backend/pkg/handlers"
	"layah-catering-backend/pkg/middleware"
	"layah-catering-backend/pkg/models"
	"layah-catering-backend/pkg/repository"
)

func New(pool *pgxpool.Pool, cfg *config.Config) http.Handler {
	userRepo := repository.NewUserRepository(pool)
	menuRepo := repository.NewMenuRepository(pool)
	orderRepo := repository.NewOrderRepository(pool)
	driverRepo := repository.NewDriverRepository(pool)
	mgmtRepo := repository.NewManagementRepository(pool)

	healthH := handlers.NewHealthHandler(pool)
	authH := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)
	menuH := handlers.NewMenuHandler(menuRepo)
	orderH := handlers.NewOrderHandler(orderRepo)
	driverH := handlers.NewDriverHandler(driverRepo, orderRepo)
	mgmtH := handlers.NewManagementHandler(mgmtRepo)

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

	// Menu management
	mux.Handle("POST /api/v1/menus", protect(menuH.Create, models.RoleManagement))
	mux.Handle("PUT /api/v1/menus/{id}", protect(menuH.Update, models.RoleManagement))
	mux.Handle("DELETE /api/v1/menus/{id}", protect(menuH.Delete, models.RoleManagement))

	// Orders (Customer tracking, Kitchen KDS, Driver delivery queue, Management)
	mux.Handle("GET /api/v1/orders", protect(orderH.List, models.RoleKitchen, models.RoleManagement, models.RoleCustomer, models.RoleDriver))
	mux.Handle("GET /api/v1/orders/{id}", protect(orderH.GetByID, models.RoleKitchen, models.RoleManagement, models.RoleCustomer, models.RoleDriver))
	mux.Handle("POST /api/v1/orders", protect(orderH.Create, models.RoleCustomer, models.RoleManagement))
	mux.Handle("PATCH /api/v1/orders/{id}/status", protect(orderH.UpdateStatus, models.RoleKitchen, models.RoleManagement))

	// Driver QR verification, live location broadcast, & delivery confirmation
	mux.Handle("POST /api/v1/driver/verify-qr", protect(driverH.VerifyQR, models.RoleDriver, models.RoleManagement))
	mux.Handle("POST /api/v1/driver/location", protect(driverH.UpdateLocation, models.RoleDriver, models.RoleManagement))
	mux.Handle("PATCH /api/v1/driver/orders/{id}/deliver", protect(driverH.MarkDelivered, models.RoleDriver, models.RoleManagement))

	// Management analytics & memberships
	mux.Handle("GET /api/v1/management/sales", protect(mgmtH.SalesReport, models.RoleManagement))
	mux.Handle("GET /api/v1/management/memberships", protect(mgmtH.Memberships, models.RoleManagement))

	return middleware.LoggerAndRecover(
		middleware.CORS(cfg.CORSOrigin)(mux),
	)
}
