package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"layah-catering-backend/pkg/models"
)

type DriverRepository struct {
	pool *pgxpool.Pool
}

func NewDriverRepository(pool *pgxpool.Pool) *DriverRepository {
	return &DriverRepository{pool: pool}
}

func (r *DriverRepository) VerifyDualQR(
	ctx context.Context,
	driverID string,
	kitchenQR string,
	receiptQR string,
) (*models.QrVerifyResponse, error) {
	normKitchen := strings.ToUpper(strings.TrimPrefix(strings.TrimSpace(kitchenQR), "#"))
	normReceipt := strings.ToUpper(strings.TrimPrefix(strings.TrimSpace(receiptQR), "#"))

	const query = `
		SELECT id, order_code, receipt_code, customer_name, delivery_address, delivery_route, status
		FROM orders
		WHERE (UPPER(id) = $1 OR UPPER(REPLACE(order_code, '#', '')) = $1)
		  AND UPPER(receipt_code) = $2
		LIMIT 1
	`
	var resp models.QrVerifyResponse
	err := r.pool.QueryRow(ctx, query, normKitchen, normReceipt).Scan(
		&resp.OrderID,
		&resp.OrderCode,
		&resp.ReceiptCode,
		&resp.RecipientName,
		&resp.DeliveryAddress,
		&resp.Route,
		&resp.Status,
	)

	var matched bool
	var loggedOrderID *string
	if errors.Is(err, pgx.ErrNoRows) {
		matched = false
		resp = models.QrVerifyResponse{
			Matched: false,
			Message: "Data QR tidak sesuai dengan rute pengiriman. Periksa kembali alamat atau paket sebelum melanjutkan.",
		}
	} else if err != nil {
		return nil, err
	} else {
		matched = true
		resp.Matched = true
		idCopy := resp.OrderID
		loggedOrderID = &idCopy
	}

	// Audit log every scan attempt into Neon DB
	var nullableDriver *string
	if driverID != "" {
		nullableDriver = &driverID
	}
	_, _ = r.pool.Exec(
		ctx,
		`INSERT INTO delivery_verifications (order_id, driver_id, kitchen_qr, receipt_qr, matched)
		 VALUES ($1, $2::uuid, $3, $4, $5)`,
		loggedOrderID, nullableDriver, normKitchen, normReceipt, matched,
	)

	return &resp, nil
}
