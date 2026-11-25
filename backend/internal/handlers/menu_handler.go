package handlers

import (
	"errors"
	"net/http"
	"strings"

	"layah-catering-backend/internal/models"
	"layah-catering-backend/internal/repository"
)

type MenuHandler struct {
	repo *repository.MenuRepository
}

func NewMenuHandler(repo *repository.MenuRepository) *MenuHandler {
	return &MenuHandler{repo: repo}
}

func (h *MenuHandler) List(w http.ResponseWriter, r *http.Request) {
	menus, err := h.repo.List(r.Context())
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to fetch menus")
		return
	}
	WriteJSON(w, http.StatusOK, menus)
}

func (h *MenuHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateMenuRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid menu payload")
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" || req.Price <= 0 {
		WriteError(w, http.StatusBadRequest, "name and positive price are required")
		return
	}
	if req.Category == "" {
		req.Category = "Paket Nasi"
	}

	created, err := h.repo.Create(r.Context(), req)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to create menu")
		return
	}
	WriteJSON(w, http.StatusCreated, created)
}

func (h *MenuHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req models.UpdateMenuRequest
	if err := DecodeJSON(r, &req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid menu update payload")
		return
	}

	updated, err := h.repo.Update(r.Context(), id, req)
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "menu not found")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to update menu")
		return
	}
	WriteJSON(w, http.StatusOK, updated)
}

func (h *MenuHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.repo.Delete(r.Context(), id)
	if errors.Is(err, repository.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "menu not found")
		return
	}
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "failed to delete menu")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"status": "deleted", "id": id})
}
