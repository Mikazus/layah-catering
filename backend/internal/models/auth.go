package models

type UserRole string

const (
	RoleCustomer   UserRole = "customer"
	RoleKitchen    UserRole = "kitchen"
	RoleDriver     UserRole = "driver"
	RoleManagement UserRole = "management"
)

type User struct {
	ID           string   `json:"id"`
	Username     string   `json:"username"`
	PasswordHash string   `json:"-"`
	FullName     string   `json:"fullName"`
	Email        string   `json:"email"`
	Phone        string   `json:"phone,omitempty"`
	Role         UserRole `json:"role"`
	Initials     string   `json:"initials"`
	Title        string   `json:"title,omitempty"`
}

type LoginRequest struct {
	Username   string   `json:"username"`
	Password   string   `json:"password"`
	Role       UserRole `json:"role"`
	RememberMe bool     `json:"rememberMe"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
