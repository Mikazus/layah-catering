package handlers

import (
	"net/http"

	"layah-catering-backend/pkg/repository"
)

type ManagementHandler struct {
	repo *repository.ManagementRepository
}

func NewManagementHandler(repo *repository.ManagementRepository) *ManagementHandler {
	return &ManagementHandler{repo: repo}
}

func (h *ManagementHandler) SalesReport(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")

	report, err := h.repo.GetSalesReport(r.Context(), period)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to load sales report")
		return
	}
	WriteJSON(w, http.StatusOK, report)
}

func (h *ManagementHandler) Memberships(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.GetMemberships(r.Context())
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to load membership data")
		return
	}
	WriteJSON(w, http.StatusOK, data)
}
