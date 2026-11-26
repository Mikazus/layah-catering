package models

import "time"

type OrderItem struct {
	ID           string `json:"id"`
	MenuID       string `json:"menuId"`
	MenuName     string `json:"menuName"`
	Description  string `json:"description,omitempty"`
	Category     string `json:"category"`
	Quantity     int    `json:"quantity"`
	UnitPrice    int64  `json:"unitPrice"`
	AllergenNote string `json:"allergenNote,omitempty"`
}

type Order struct {
	ID                      string      `json:"id"`
	OrderCode               string      `json:"orderCode"`
	ReceiptCode             string      `json:"receiptCode"`
	CustomerName            string      `json:"customerName"`
	CustomerPhone           string      `json:"customerPhone"`
	DeliveryAddress         string      `json:"deliveryAddress"`
	DeliveryRoute           string      `json:"deliveryRoute"`
	ScheduledTime           string      `json:"scheduledTime"`
	ScheduledLabel          string      `json:"scheduledLabel,omitempty"`
	ServiceType             string      `json:"serviceType,omitempty"`
	Status                  string      `json:"status"`
	Items                   []OrderItem `json:"items"`
	TotalAmount             int64       `json:"totalAmount"`
	AllergyAlert            string      `json:"allergyAlert,omitempty"`
	AllergyInstruction      string      `json:"allergyInstruction,omitempty"`
	CreatedAt               time.Time   `json:"createdAt"`
	ElapsedMinutes          int         `json:"elapsedMinutes"`
	DispatchedAt            string      `json:"dispatchedAt,omitempty"`
	DeliveredAt             string      `json:"deliveredAt,omitempty"`
	DriverName              string      `json:"driverName,omitempty"`
	DriverLat               *float64    `json:"driverLat,omitempty"`
	DriverLng               *float64    `json:"driverLng,omitempty"`
	DriverLocationUpdatedAt string      `json:"driverLocationUpdatedAt,omitempty"`
}

type CreateOrderItemInput struct {
	MenuID       string `json:"menuId"`
	MenuName     string `json:"menuName"`
	Quantity     int    `json:"quantity"`
	UnitPrice    int64  `json:"unitPrice"`
	AllergenNote string `json:"allergenNote"`
}

type CreateOrderRequest struct {
	CustomerName    string                 `json:"customerName"`
	CustomerPhone   string                 `json:"customerPhone"`
	DeliveryAddress string                 `json:"deliveryAddress"`
	Items           []CreateOrderItemInput `json:"items"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}
