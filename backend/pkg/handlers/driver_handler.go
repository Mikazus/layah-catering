package handlers

import (
	"errors"
	"net/http"

	"layah-catering-backend/pkg/middleware"
	"layah-catering-backend/pkg/models"
	"layah-catering-backend/pkg/repository"
)

type DriverHandler struct {
	driverRepo *repository.DriverRepository
	orderRepo  *repository.OrderRepository
}

func NewDriverHandler(driverRepo *repository.DriverRepository, orderRepo *repository.OrderRepository) *DriverHandler {
	return &DriverHandler{driverRepo: driverRepo, orderRepo: orderRepo}
}

func (h *DriverHandler) VerifyQR(w http.ResponseWriter, r *http.Request) {
	var req models.QrVerifyRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid QR payload")
		return
	}
	if req.KitchenQR == "" || req.ReceiptQR == "" {
		WriteError(w, http.StatusBadRequest, "kitchenQr and receiptQr are required")
		return
	}

	driverID := ""
	if claims, ok := middleware.GetClaims(r.Context()); ok {
		driverID = claims.UserID
	}

	result, err := h.driverRepo.VerifyDualQR(r.Context(), driverID, req.KitchenQR, req.ReceiptQR)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to verify QR codes")
		return
	}

	WriteJSON(w, http.StatusOK, result)
}

func (h *DriverHandler) UpdateLocation(w http.ResponseWriter, r *http.Request) {
	var req models.UpdateDriverLocationRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid location payload")
		return
	}
	if req.OrderID == "" || (req.Lat == 0 && req.Lng == 0) {
		WriteError(w, http.StatusBadRequest, "orderId, lat, and lng are required")
		return
	}

	driverID := ""
	if claims, ok := middleware.GetClaims(r.Context()); ok {
		driverID = claims.UserID
	}

	err := h.driverRepo.UpdateDriverLocation(r.Context(), driverID, req)
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "order not found")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to update driver location")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]any{
		"status":  "updated",
		"orderId": req.OrderID,
		"lat":     req.Lat,
		"lng":     req.Lng,
	})
}

func (h *DriverHandler) MarkDelivered(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	updated, err := h.orderRepo.UpdateStatus(r.Context(), id, "delivered")
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "order not found")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to mark order delivered")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]any{
		"status":  "delivered",
		"orderId": updated.ID,
		"order":   updated,
	})
}
