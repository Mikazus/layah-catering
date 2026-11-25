package handlers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"layah-catering-backend/internal/middleware"
	"layah-catering-backend/internal/models"
	"layah-catering-backend/internal/repository"
)

type AuthHandler struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

func NewAuthHandler(userRepo *repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, jwtSecret: jwtSecret}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" || req.Role == "" {
		WriteError(w, http.StatusBadRequest, "username, password, and role are required")
		return
	}

	user, err := h.userRepo.FindByUsernameAndRole(r.Context(), req.Username, req.Role)
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusUnauthorized, "invalid username or workspace role")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to verify user")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		WriteError(w, http.StatusUnauthorized, "invalid password")
		return
	}

	ttl := 24 * time.Hour
	if req.RememberMe {
		ttl = 30 * 24 * time.Hour
	}

	claims := middleware.Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to sign auth token")
		return
	}

	WriteJSON(w, http.StatusOK, models.AuthResponse{
		Token: signed,
		User:  *user,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	WriteJSON(w, http.StatusOK, map[string]string{"message": "logged out"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetClaims(r.Context())
	if !ok {
		WriteError(w, http.StatusUnauthorized, "unauthenticated")
		return
	}

	user, err := h.userRepo.FindByID(r.Context(), claims.UserID)
	if err != nil {
		WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	WriteJSON(w, http.StatusOK, user)
}
