package handlers

import (
	"errors"
	"net/http"
	"strings"

	"layah-catering-backend/internal/middleware"
	"layah-catering-backend/internal/models"
	"layah-catering-backend/internal/repository"
)

var validOrderStatuses = map[string]bool{
	"incoming":   true,
	"preparing":  true,
	"ready":      true,
	"dispatched": true,
	"delivered":  true,
	"cancelled":  true,
}

type OrderHandler struct {
	repo *repository.OrderRepository
}

func NewOrderHandler(repo *repository.OrderRepository) *OrderHandler {
	return &OrderHandler{repo: repo}
}

func (h *OrderHandler) List(w http.ResponseWriter, r *http.Request) {
	orders, err := h.repo.List(r.Context())
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to fetch orders")
		return
	}
	WriteJSON(w, http.StatusOK, orders)
}

func (h *OrderHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	order, err := h.repo.GetByID(r.Context(), id)
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "order not found")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to fetch order")
		return
	}
	WriteJSON(w, http.StatusOK, order)
}

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateOrderRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid order payload")
		return
	}

	req.CustomerName = strings.TrimSpace(req.CustomerName)
	req.CustomerPhone = strings.TrimSpace(req.CustomerPhone)
	req.DeliveryAddress = strings.TrimSpace(req.DeliveryAddress)

	if req.CustomerName == "" || req.CustomerPhone == "" || req.DeliveryAddress == "" || len(req.Items) == 0 {
		WriteError(w, http.StatusBadRequest, "customer details and at least one menu item are required")
		return
	}

	userID := ""
	if claims, ok := middleware.GetClaims(r.Context()); ok {
		userID = claims.UserID
	}

	created, err := h.repo.Create(r.Context(), userID, req)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to create order")
		return
	}

	WriteJSON(w, http.StatusCreated, created)
}

func (h *OrderHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.UpdateOrderStatusRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid status payload")
		return
	}
	if !validOrderStatuses[req.Status] {
		WriteError(w, http.StatusBadRequest, "unsupported order status")
		return
	}

	updated, err := h.repo.UpdateStatus(r.Context(), id, req.Status)
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "order not found")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to update order status")
		return
	}

	WriteJSON(w, http.StatusOK, updated)
}
