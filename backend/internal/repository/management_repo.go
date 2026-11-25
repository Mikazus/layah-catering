package repository

import (
	"context"
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"layah-catering-backend/internal/models"
)

type ManagementRepository struct {
	pool *pgxpool.Pool
}

func NewManagementRepository(pool *pgxpool.Pool) *ManagementRepository {
	return &ManagementRepository{pool: pool}
}

var idMonthsFull = map[int]string{
	1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
	5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
	9: "September", 10: "Oktober", 11: "November", 12: "Desember",
}

var idMonthsShort = map[int]string{
	1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
	5: "Mei", 6: "Jun", 7: "Jul", 8: "Agu",
	9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
}

type monthBucket struct {
	Year            int
	MonthNum        int
	MonthShort      string
	PeriodLabel     string
	PeriodRange     string
	TotalOrders     int
	TotalRevenue    int64
	ActiveCustomers int
	HighlightNote   string
	IsLive          bool
}

func (r *ManagementRepository) GetSalesReport(ctx context.Context, requestedPeriod string) (*models.SalesReportResponse, error) {
	wib := time.FixedZone("WIB", 7*3600)
	now := time.Now().In(wib)
	currentYear := now.Year()

	buckets := make(map[int]*monthBucket)

	// 1. Load historical baseline snapshots for the current year (if any exist)
	snapRows, err := r.pool.Query(ctx, `
		SELECT year, month_num, month_short, period_label, period_range,
		       total_orders, total_revenue, active_customers, highlight_note
		FROM monthly_sales_snapshots
		WHERE year = $1
		ORDER BY month_num ASC
	`, currentYear)
	if err == nil {
		defer snapRows.Close()
		for snapRows.Next() {
			var b monthBucket
			if scanErr := snapRows.Scan(
				&b.Year, &b.MonthNum, &b.MonthShort, &b.PeriodLabel, &b.PeriodRange,
				&b.TotalOrders, &b.TotalRevenue, &b.ActiveCustomers, &b.HighlightNote,
			); scanErr == nil {
				copyB := b
				buckets[b.MonthNum] = &copyB
			}
		}
	}

	// 2. Aggregate REAL live orders directly from the orders table (overrides/adds to current data)
	liveRows, err := r.pool.Query(ctx, `
		SELECT
			EXTRACT(YEAR FROM (created_at AT TIME ZONE 'Asia/Jakarta'))::int AS yr,
			EXTRACT(MONTH FROM (created_at AT TIME ZONE 'Asia/Jakarta'))::int AS mo,
			COUNT(*)::int AS total_orders,
			COALESCE(SUM(total_amount), 0)::bigint AS total_revenue,
			COUNT(DISTINCT LOWER(TRIM(customer_name)))::int AS active_customers
		FROM orders
		WHERE status <> 'cancelled'
		  AND EXTRACT(YEAR FROM (created_at AT TIME ZONE 'Asia/Jakarta'))::int = $1
		GROUP BY yr, mo
		ORDER BY mo ASC
	`, currentYear)
	if err != nil {
		return nil, err
	}
	defer liveRows.Close()

	for liveRows.Next() {
		var yr, mo, totalOrders, activeCust int
		var totalRev int64
		if err := liveRows.Scan(&yr, &mo, &totalOrders, &totalRev, &activeCust); err != nil {
			return nil, err
		}
		lastDay := time.Date(yr, time.Month(mo+1), 0, 0, 0, 0, 0, wib).Day()
		mFull := idMonthsFull[mo]
		mShort := idMonthsShort[mo]

		if existing, exists := buckets[mo]; exists {
			existing.TotalOrders += totalOrders
			existing.TotalRevenue += totalRev
			existing.ActiveCustomers += activeCust
			existing.IsLive = true
			existing.HighlightNote = fmt.Sprintf("Data live diperbarui dari %d pesanan aktif di Neon PostgreSQL.", existing.TotalOrders)
		} else {
			buckets[mo] = &monthBucket{
				Year:            yr,
				MonthNum:        mo,
				MonthShort:      mShort,
				PeriodLabel:     fmt.Sprintf("%s %d", mFull, yr),
				PeriodRange:     fmt.Sprintf("01–%02d %s %d · Data live pesanan aktif", lastDay, mFull, yr),
				TotalOrders:     totalOrders,
				TotalRevenue:    totalRev,
				ActiveCustomers: activeCust,
				HighlightNote:   fmt.Sprintf("Data live bulan %s dihitung langsung dari %d pesanan Neon DB.", mFull, totalOrders),
				IsLive:          true,
			}
		}
	}
	if err := liveRows.Err(); err != nil {
		return nil, err
	}

	// Ensure current month always exists even if 0 orders yet
	curMonth := int(now.Month())
	if _, ok := buckets[curMonth]; !ok {
		lastDay := time.Date(currentYear, time.Month(curMonth+1), 0, 0, 0, 0, 0, wib).Day()
		mFull := idMonthsFull[curMonth]
		buckets[curMonth] = &monthBucket{
			Year:          currentYear,
			MonthNum:      curMonth,
			MonthShort:    idMonthsShort[curMonth],
			PeriodLabel:   fmt.Sprintf("%s %d", mFull, currentYear),
			PeriodRange:   fmt.Sprintf("01–%02d %s %d · Data live pesanan aktif", lastDay, mFull, currentYear),
			HighlightNote: fmt.Sprintf("Belum ada pesanan tercatat untuk %s %d.", mFull, currentYear),
			IsLive:        true,
		}
	}

	// Sort chronologically
	monthKeys := make([]int, 0, len(buckets))
	for k := range buckets {
		monthKeys = append(monthKeys, k)
	}
	sort.Ints(monthKeys)

	ordered := make([]*monthBucket, 0, len(monthKeys))
	availablePeriods := make([]string, 0, len(monthKeys))
	for _, k := range monthKeys {
		ordered = append(ordered, buckets[k])
	}
	// Latest period first in dropdown
	for i := len(ordered) - 1; i >= 0; i-- {
		availablePeriods = append(availablePeriods, ordered[i].PeriodLabel)
	}

	selectedIdx := len(ordered) - 1
	if requestedPeriod != "" {
		for i, b := range ordered {
			if b.PeriodLabel == requestedPeriod {
				selectedIdx = i
				break
			}
		}
	}

	curr := ordered[selectedIdx]
	prev := &monthBucket{}
	if selectedIdx > 0 {
		prev = ordered[selectedIdx-1]
	}

	var ytd int64
	trend := make([]models.MonthlyRevenuePoint, 0, len(ordered))
	for i, b := range ordered {
		if i <= selectedIdx {
			ytd += b.TotalRevenue
		}
		millions := math.Round((float64(b.TotalRevenue)/1_000_000.0)*100) / 100
		trend = append(trend, models.MonthlyRevenuePoint{
			Month:           b.MonthShort,
			RevenueMillions: millions,
			RevenueRaw:      b.TotalRevenue,
			IsCurrent:       i == selectedIdx,
		})
	}

	lastUpdated := fmt.Sprintf("%02d %s %d, %s WIB", now.Day(), idMonthsShort[int(now.Month())], now.Year(), now.Format("15.04"))

	return &models.SalesReportResponse{
		AvailablePeriods: availablePeriods,
		Summary: models.SalesSummary{
			Period:             curr.PeriodLabel,
			PeriodRangeLabel:   curr.PeriodRange,
			TotalOrders:        curr.TotalOrders,
			OrdersGrowthPct:    pctGrowth(float64(curr.TotalOrders), float64(prev.TotalOrders)),
			PrevOrders:         prev.TotalOrders,
			TotalRevenue:       curr.TotalRevenue,
			RevenueGrowthPct:   pctGrowth(float64(curr.TotalRevenue), float64(prev.TotalRevenue)),
			PrevRevenue:        prev.TotalRevenue,
			ActiveCustomers:    curr.ActiveCustomers,
			CustomersGrowthPct: pctGrowth(float64(curr.ActiveCustomers), float64(prev.ActiveCustomers)),
			PrevCustomers:      prev.ActiveCustomers,
			YtdTotalRevenue:    ytd,
			HighlightNote:      curr.HighlightNote,
			LastUpdated:        lastUpdated,
		},
		MonthlyTrend: trend,
	}, nil
}

func (r *ManagementRepository) GetMemberships(ctx context.Context) (*models.MembershipResponse, error) {
	wib := time.FixedZone("WIB", 7*3600)
	now := time.Now().In(wib)

	const query = `
		SELECT id::text, member_code, full_name, email, status, joined_date, total_transactions
		FROM memberships
		ORDER BY member_code ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]models.MemberRecord, 0)
	activeCount := 0
	inactiveCount := 0

	for rows.Next() {
		var m models.MemberRecord
		var joined time.Time
		if err := rows.Scan(
			&m.ID, &m.MemberCode, &m.FullName, &m.Email,
			&m.Status, &joined, &m.TotalTransactions,
		); err != nil {
			return nil, err
		}
		m.JoinedDate = joined.Format("02 Jan 2006")
		if m.Status == "Active" {
			activeCount++
		} else {
			inactiveCount++
		}
		members = append(members, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	asOfLabel := fmt.Sprintf(
		"Total transaksi kumulatif hingga %02d %s %d",
		now.Day(), idMonthsShort[int(now.Month())], now.Year(),
	)

	return &models.MembershipResponse{
		TotalRegistered: len(members),
		ActiveCount:     activeCount,
		InactiveCount:   inactiveCount,
		AsOfLabel:       asOfLabel,
		Members:         members,
	}, nil
}

func pctGrowth(curr, prev float64) float64 {
	if prev == 0 {
		return 0
	}
	return math.Round(((curr-prev)/prev)*1000) / 10
}
