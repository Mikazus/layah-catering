package models

import "time"

type MenuItem struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Price       int64     `json:"price"`
	ImageURL    string    `json:"imageUrl,omitempty"`
	IsAvailable bool      `json:"isAvailable"`
	Allergens   []string  `json:"allergens,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type CreateMenuRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Price       int64    `json:"price"`
	ImageURL    string   `json:"imageUrl"`
	IsAvailable bool     `json:"isAvailable"`
	Allergens   []string `json:"allergens"`
}

type UpdateMenuRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Category    *string  `json:"category"`
	Price       *int64   `json:"price"`
	ImageURL    *string  `json:"imageUrl"`
	IsAvailable *bool    `json:"isAvailable"`
	Allergens   []string `json:"allergens"`
}
