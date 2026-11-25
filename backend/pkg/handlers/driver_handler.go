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

	// Always return HTTP 200 with matched: true/false so mobile UI renders Verified or PERINGATAN cleanly
	WriteJSON(w, http.StatusOK, result)
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
