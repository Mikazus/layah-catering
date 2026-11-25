package repository

import (
	"context"
	"errors"
	"fmt"
	"math"
	"math/rand"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"layah-catering-backend/pkg/models"
)

type OrderRepository struct {
	pool *pgxpool.Pool
}

func NewOrderRepository(pool *pgxpool.Pool) *OrderRepository {
	return &OrderRepository{pool: pool}
}

func wibZone() *time.Location {
	return time.FixedZone("WIB", 7*3600)
}

func (r *OrderRepository) List(ctx context.Context) ([]models.Order, error) {
	const query = `
		SELECT
			id, order_code, receipt_code, customer_name, customer_phone,
			delivery_address, delivery_route, scheduled_time, scheduled_label,
			service_type, status, total_amount,
			COALESCE(allergy_alert, ''), COALESCE(allergy_instruction, ''),
			created_at, dispatched_at, delivered_at
		FROM orders
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]models.Order, 0)
	orderIDs := make([]string, 0)

	for rows.Next() {
		var o models.Order
		var dispatchedAt, deliveredAt *time.Time
		if err := rows.Scan(
			&o.ID, &o.OrderCode, &o.ReceiptCode, &o.CustomerName, &o.CustomerPhone,
			&o.DeliveryAddress, &o.DeliveryRoute, &o.ScheduledTime, &o.ScheduledLabel,
			&o.ServiceType, &o.Status, &o.TotalAmount,
			&o.AllergyAlert, &o.AllergyInstruction,
			&o.CreatedAt, &dispatchedAt, &deliveredAt,
		); err != nil {
			return nil, err
		}
		o.ElapsedMinutes = computeElapsedMinutes(o.CreatedAt)
		if dispatchedAt != nil {
			o.DispatchedAt = formatWibLabel(*dispatchedAt)
		}
		if deliveredAt != nil {
			o.DeliveredAt = formatWibLabel(*deliveredAt)
		}
		o.Items = []models.OrderItem{}
		orders = append(orders, o)
		orderIDs = append(orderIDs, o.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(orderIDs) == 0 {
		return orders, nil
	}

	itemsMap, err := r.fetchItemsByOrderIDs(ctx, orderIDs)
	if err != nil {
		return nil, err
	}
	for i := range orders {
		if items, ok := itemsMap[orders[i].ID]; ok {
			orders[i].Items = items
		}
	}

	return orders, nil
}

func (r *OrderRepository) GetByID(ctx context.Context, rawID string) (*models.Order, error) {
	cleanID := strings.TrimPrefix(strings.TrimSpace(rawID), "#")

	const query = `
		SELECT
			id, order_code, receipt_code, customer_name, customer_phone,
			delivery_address, delivery_route, scheduled_time, scheduled_label,
			service_type, status, total_amount,
			COALESCE(allergy_alert, ''), COALESCE(allergy_instruction, ''),
			created_at, dispatched_at, delivered_at
		FROM orders
		WHERE LOWER(id) = LOWER($1) OR LOWER(order_code) = LOWER($2)
		LIMIT 1
	`
	var o models.Order
	var dispatchedAt, deliveredAt *time.Time
	err := r.pool.QueryRow(ctx, query, cleanID, "#"+cleanID).Scan(
		&o.ID, &o.OrderCode, &o.ReceiptCode, &o.CustomerName, &o.CustomerPhone,
		&o.DeliveryAddress, &o.DeliveryRoute, &o.ScheduledTime, &o.ScheduledLabel,
		&o.ServiceType, &o.Status, &o.TotalAmount,
		&o.AllergyAlert, &o.AllergyInstruction,
		&o.CreatedAt, &dispatchedAt, &deliveredAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	o.ElapsedMinutes = computeElapsedMinutes(o.CreatedAt)
	if dispatchedAt != nil {
		o.DispatchedAt = formatWibLabel(*dispatchedAt)
	}
	if deliveredAt != nil {
		o.DeliveredAt = formatWibLabel(*deliveredAt)
	}

	itemsMap, err := r.fetchItemsByOrderIDs(ctx, []string{o.ID})
	if err != nil {
		return nil, err
	}
	o.Items = itemsMap[o.ID]
	if o.Items == nil {
		o.Items = []models.OrderItem{}
	}

	return &o, nil
}

func (r *OrderRepository) Create(ctx context.Context, userID string, req models.CreateOrderRequest) (*models.Order, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	nowWib := time.Now().In(wibZone())
	scheduledWib := nowWib.Add(1 * time.Hour)
	scheduledTime := scheduledWib.Format("15:04")
	scheduledLabel := fmt.Sprintf("%s, %s WIB", scheduledWib.Format("02 Jan 2006"), scheduledTime)
	serviceType := deriveServiceType(scheduledWib.Hour())

	suffix := 1000 + rand.Intn(8999)
	orderID := fmt.Sprintf("ORD-%d", suffix)
	orderCode := fmt.Sprintf("#%s", orderID)
	receiptCode := fmt.Sprintf("KTG-%d", 1000+rand.Intn(8999))

	route := deriveDeliveryRoute(req.DeliveryAddress)

	var totalAmount int64
	allergenNotes := make([]string, 0)
	for _, it := range req.Items {
		totalAmount += it.UnitPrice * int64(it.Quantity)
		if note := strings.TrimSpace(it.AllergenNote); note != "" {
			allergenNotes = append(allergenNotes, note)
		}
	}

	allergyAlert := ""
	allergyInstruction := ""
	if len(allergenNotes) > 0 {
		allergyAlert = allergenNotes[0]
		allergyInstruction = fmt.Sprintf(
			"WARNING: Dietary request — %s. Use clean utensils and a separate preparation area. Avoid cross-contact.",
			strings.Join(allergenNotes, "; "),
		)
	}

	var nullableUserID *string
	if userID != "" {
		nullableUserID = &userID
	}

	const insertOrder = `
		INSERT INTO orders (
			id, order_code, receipt_code, user_id, customer_name, customer_phone,
			delivery_address, delivery_route, scheduled_time, scheduled_label,
			service_type, status, total_amount, allergy_alert, allergy_instruction
		)
		VALUES ($1, $2, $3, $4::uuid, $5, $6, $7, $8, $9, $10, $11, 'incoming', $12, $13, $14)
		RETURNING created_at
	`
	var createdAt time.Time
	err = tx.QueryRow(
		ctx, insertOrder,
		orderID, orderCode, receiptCode, nullableUserID,
		req.CustomerName, req.CustomerPhone, req.DeliveryAddress,
		route, scheduledTime, scheduledLabel, serviceType,
		totalAmount, allergyAlert, allergyInstruction,
	).Scan(&createdAt)
	if err != nil {
		return nil, err
	}

	const insertItem = `
		INSERT INTO order_items (order_id, menu_id, menu_name, category, quantity, unit_price, allergen_note)
		VALUES ($1, NULLIF($2, ''), $3, 'Main', $4, $5, $6)
		RETURNING id::text
	`
	insertedItems := make([]models.OrderItem, 0, len(req.Items))
	for _, it := range req.Items {
		var itemID string
		if err := tx.QueryRow(
			ctx, insertItem,
			orderID, it.MenuID, it.MenuName, it.Quantity, it.UnitPrice, it.AllergenNote,
		).Scan(&itemID); err != nil {
			return nil, err
		}
		insertedItems = append(insertedItems, models.OrderItem{
			ID:           itemID,
			MenuID:       it.MenuID,
			MenuName:     it.MenuName,
			Category:     "Main",
			Quantity:     it.Quantity,
			UnitPrice:    it.UnitPrice,
			AllergenNote: it.AllergenNote,
		})
	}

	// Sync real transaction totals into memberships table
	if userID != "" {
		var userEmail string
		if err := tx.QueryRow(ctx, `SELECT email FROM users WHERE id = $1::uuid`, userID).Scan(&userEmail); err == nil && userEmail != "" {
			tag, _ := tx.Exec(
				ctx,
				`UPDATE memberships SET total_transactions = total_transactions + $1, status = 'Active' WHERE LOWER(email) = LOWER($2)`,
				totalAmount, userEmail,
			)
			if tag.RowsAffected() == 0 {
				var count int
				_ = tx.QueryRow(ctx, `SELECT COUNT(*) FROM memberships`).Scan(&count)
				memberCode := fmt.Sprintf("LRS-%03d", count+1)
				_, _ = tx.Exec(
					ctx,
					`INSERT INTO memberships (user_id, member_code, full_name, email, status, joined_date, total_transactions)
					 VALUES ($1::uuid, $2, $3, $4, 'Active', CURRENT_DATE, $5)
					 ON CONFLICT (email) DO UPDATE SET total_transactions = memberships.total_transactions + EXCLUDED.total_transactions, status = 'Active'`,
					userID, memberCode, req.CustomerName, userEmail, totalAmount,
				)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &models.Order{
		ID:                 orderID,
		OrderCode:          orderCode,
		ReceiptCode:        receiptCode,
		CustomerName:       req.CustomerName,
		CustomerPhone:      req.CustomerPhone,
		DeliveryAddress:    req.DeliveryAddress,
		DeliveryRoute:      route,
		ScheduledTime:      scheduledTime,
		ScheduledLabel:     scheduledLabel,
		ServiceType:        serviceType,
		Status:             "incoming",
		Items:              insertedItems,
		TotalAmount:        totalAmount,
		AllergyAlert:       allergyAlert,
		AllergyInstruction: allergyInstruction,
		CreatedAt:          createdAt,
		ElapsedMinutes:     0,
	}, nil
}

func (r *OrderRepository) UpdateStatus(ctx context.Context, rawID string, status string) (*models.Order, error) {
	cleanID := strings.TrimPrefix(strings.TrimSpace(rawID), "#")

	const query = `
		UPDATE orders
		SET
			status        = $2,
			dispatched_at = CASE WHEN $2 = 'dispatched' THEN NOW() ELSE dispatched_at END,
			delivered_at  = CASE WHEN $2 = 'delivered'  THEN NOW() ELSE delivered_at  END
		WHERE LOWER(id) = LOWER($1) OR LOWER(order_code) = LOWER($3)
	`
	tag, err := r.pool.Exec(ctx, query, cleanID, status, "#"+cleanID)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}

	return r.GetByID(ctx, cleanID)
}

func (r *OrderRepository) fetchItemsByOrderIDs(ctx context.Context, orderIDs []string) (map[string][]models.OrderItem, error) {
	const query = `
		SELECT id::text, order_id, COALESCE(menu_id, ''), menu_name, COALESCE(description, ''), category, quantity, unit_price, COALESCE(allergen_note, '')
		FROM order_items
		WHERE order_id = ANY($1)
		ORDER BY id ASC
	`
	rows, err := r.pool.Query(ctx, query, orderIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string][]models.OrderItem)
	for rows.Next() {
		var orderID string
		var item models.OrderItem
		if err := rows.Scan(
			&item.ID, &orderID, &item.MenuID, &item.MenuName,
			&item.Description, &item.Category, &item.Quantity,
			&item.UnitPrice, &item.AllergenNote,
		); err != nil {
			return nil, err
		}
		result[orderID] = append(result[orderID], item)
	}
	return result, rows.Err()
}

func deriveDeliveryRoute(address string) string {
	lower := strings.ToLower(address)
	switch {
	case strings.Contains(lower, "dieng") || strings.Contains(lower, "sukun") || strings.Contains(lower, "langsep"):
		return "Malang · Dieng / Sukun"
	case strings.Contains(lower, "soekarno hatta") || strings.Contains(lower, "suhat") || strings.Contains(lower, "lowokwaru") || strings.Contains(lower, "veteran") || strings.Contains(lower, "dinoyo"):
		return "Malang · Lowokwaru"
	case strings.Contains(lower, "ijen") || strings.Contains(lower, "klojen") || strings.Contains(lower, "kayutangan"):
		return "Malang · Klojen / Ijen"
	case strings.Contains(lower, "sawojajar") || strings.Contains(lower, "kedungkandang"):
		return "Malang · Sawojajar"
	case strings.Contains(lower, "blimbing") || strings.Contains(lower, "sulfat") || strings.Contains(lower, "araya"):
		return "Malang · Blimbing"
	case strings.Contains(lower, "dau") || strings.Contains(lower, "batu"):
		return "Malang · Dau / Batu"
	default:
		return "Malang · Tidar Atas"
	}
}

func deriveServiceType(hour int) string {
	switch {
	case hour < 10:
		return "Breakfast service · Home delivery"
	case hour < 15:
		return "Lunch service · Home delivery"
	default:
		return "Dinner service · Home delivery"
	}
}

func computeElapsedMinutes(createdAt time.Time) int {
	mins := int(math.Max(0, math.Floor(time.Since(createdAt).Minutes())))
	return mins
}

func formatWibLabel(t time.Time) string {
	now := time.Now().In(wibZone())
	local := t.In(wibZone())
	if now.Year() == local.Year() && now.YearDay() == local.YearDay() {
		return fmt.Sprintf("Today, %s WIB", local.Format("15:04"))
	}
	return fmt.Sprintf("%s, %s WIB", local.Format("02 Jan 2006"), local.Format("15:04"))
}
