package models

type SalesSummary struct {
	Period             string  `json:"period"`
	PeriodRangeLabel   string  `json:"periodRangeLabel"`
	TotalOrders        int     `json:"totalOrders"`
	OrdersGrowthPct    float64 `json:"ordersGrowthPct"`
	PrevOrders         int     `json:"prevOrders"`
	TotalRevenue       int64   `json:"totalRevenue"`
	RevenueGrowthPct   float64 `json:"revenueGrowthPct"`
	PrevRevenue        int64   `json:"prevRevenue"`
	ActiveCustomers    int     `json:"activeCustomers"`
	CustomersGrowthPct float64 `json:"customersGrowthPct"`
	PrevCustomers      int     `json:"prevCustomers"`
	YtdTotalRevenue    int64   `json:"ytdTotalRevenue"`
	HighlightNote      string  `json:"highlightNote"`
	LastUpdated        string  `json:"lastUpdated"`
}

type MonthlyRevenuePoint struct {
	Month           string `json:"month"`
	RevenueMillions float64 `json:"revenueMillions"`
	RevenueRaw      int64   `json:"revenueRaw"`
	IsCurrent       bool    `json:"isCurrent,omitempty"`
}

type SalesReportResponse struct {
	AvailablePeriods []string              `json:"availablePeriods"`
	Summary          SalesSummary          `json:"summary"`
	MonthlyTrend     []MonthlyRevenuePoint `json:"monthlyTrend"`
}

type MemberRecord struct {
	ID                string `json:"id"`
	MemberCode        string `json:"memberCode"`
	FullName          string `json:"fullName"`
	Email             string `json:"email"`
	Status            string `json:"status"`
	JoinedDate        string `json:"joinedDate"`
	TotalTransactions int64  `json:"totalTransactions"`
}

type MembershipResponse struct {
	TotalRegistered int            `json:"totalRegistered"`
	ActiveCount     int            `json:"activeCount"`
	InactiveCount   int            `json:"inactiveCount"`
	AsOfLabel       string         `json:"asOfLabel"`
	Members         []MemberRecord `json:"members"`
}
