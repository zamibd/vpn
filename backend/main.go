package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var db *sql.DB

func init() {
	// Try to load .env.local first for localhost development, fallback to .env
	if err := godotenv.Load(".env.local"); err != nil {
		godotenv.Load(".env")
	}
}

// CORS middleware
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "3600")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	var err error
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Database connection error:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Database ping error:", err)
	}

	log.Println("Database connected successfully")

	router := mux.NewRouter()

	// Public routes
	router.HandleFunc("/api/auth/register", RegisterHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/signup", PublicRegisterHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/login", LoginHandler).Methods("POST", "OPTIONS")

	// Protected routes - use Handle for http.Handler
	router.Handle("/api/user/profile", AuthMiddleware(http.HandlerFunc(GetUserProfile))).Methods("GET", "OPTIONS")
	router.Handle("/api/user/update", AuthMiddleware(http.HandlerFunc(UpdateUserProfile))).Methods("PUT", "OPTIONS")
	router.Handle("/api/user/delete", AuthMiddleware(http.HandlerFunc(DeleteUserAccount))).Methods("DELETE", "OPTIONS")

	// Admin routes
	router.Handle("/api/admin/users", AuthMiddleware(AdminOnly(GetAllUsers))).Methods("GET", "OPTIONS")
	router.Handle("/api/admin/users/{id}", AuthMiddleware(AdminOnly(GetUserByID))).Methods("GET", "OPTIONS")
	router.Handle("/api/admin/users/{id}/suspend", AuthMiddleware(AdminOnly(SuspendUser))).Methods("PUT", "OPTIONS")
	router.Handle("/api/admin/users/{id}/activate", AuthMiddleware(AdminOnly(ActivateUser))).Methods("PUT", "OPTIONS")
	router.Handle("/api/admin/users/{id}/delete", AuthMiddleware(AdminOnly(AdminDeleteUser))).Methods("DELETE", "OPTIONS")

	// Reseller routes
	router.Handle("/api/reseller/create-user", AuthMiddleware(ResellerOnly(ResellerCreateUser))).Methods("POST", "OPTIONS")
	router.Handle("/api/reseller/users", AuthMiddleware(ResellerOnly(ResellerGetUsers))).Methods("GET", "OPTIONS")
	router.Handle("/api/reseller/quota", AuthMiddleware(ResellerOnly(ResellerGetQuota))).Methods("GET", "OPTIONS")

	// Packages route
	router.HandleFunc("/api/packages", GetPackages).Methods("GET", "OPTIONS")

	// Static files
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./frontend")))

	// Apply CORS middleware to all routes
	handler := CORSMiddleware(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
