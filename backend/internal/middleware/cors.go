package middleware

import (
	"net/http"
	"strings"
)

func CORS(allowedOrigins string) func(http.Handler) http.Handler {
	origins := strings.Split(allowedOrigins, ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	isAllowedOrigin := func(reqOrigin string) bool {
		if reqOrigin == "" {
			return false
		}
		for _, pattern := range origins {
			if pattern == "*" || pattern == reqOrigin {
				return true
			}
			// Support wildcard subdomain patterns like https://*.vercel.app
			if strings.HasPrefix(pattern, "https://*.") {
				suffix := strings.TrimPrefix(pattern, "https://*")
				if strings.HasPrefix(reqOrigin, "https://") && strings.HasSuffix(reqOrigin, suffix) {
					return true
				}
			}
		}
		return false
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			reqOrigin := r.Header.Get("Origin")
			if isAllowedOrigin(reqOrigin) {
				w.Header().Set("Access-Control-Allow-Origin", reqOrigin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else if len(origins) > 0 && origins[0] != "" {
				w.Header().Set("Access-Control-Allow-Origin", origins[0])
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Vary", "Origin")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
