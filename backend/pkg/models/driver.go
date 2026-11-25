package models

type QrVerifyRequest struct {
	KitchenQR string `json:"kitchenQr"`
	ReceiptQR string `json:"receiptQr"`
}

type QrVerifyResponse struct {
	Matched         bool   `json:"matched"`
	OrderID         string `json:"orderId,omitempty"`
	OrderCode       string `json:"orderCode,omitempty"`
	ReceiptCode     string `json:"receiptCode,omitempty"`
	RecipientName   string `json:"recipientName,omitempty"`
	DeliveryAddress string `json:"deliveryAddress,omitempty"`
	Route           string `json:"route,omitempty"`
	Status          string `json:"status,omitempty"`
	Message         string `json:"message,omitempty"`
}
