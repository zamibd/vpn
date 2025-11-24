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
	godotenv.Load(".env")
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
	router.HandleFunc("/api/auth/register", RegisterHandler).Methods("POST")
	router.HandleFunc("/api/auth/login", LoginHandler).Methods("POST")

	// Protected routes - use Handle for http.Handler
	router.Handle("/api/user/profile", AuthMiddleware(http.HandlerFunc(GetUserProfile))).Methods("GET")
	router.Handle("/api/user/update", AuthMiddleware(http.HandlerFunc(UpdateUserProfile))).Methods("PUT")
	router.Handle("/api/user/delete", AuthMiddleware(http.HandlerFunc(DeleteUserAccount))).Methods("DELETE")

	// Admin routes
	router.Handle("/api/admin/users", AuthMiddleware(AdminOnly(GetAllUsers))).Methods("GET")
	router.Handle("/api/admin/users/{id}", AuthMiddleware(AdminOnly(GetUserByID))).Methods("GET")
	router.Handle("/api/admin/users/{id}/suspend", AuthMiddleware(AdminOnly(SuspendUser))).Methods("PUT")
	router.Handle("/api/admin/users/{id}/activate", AuthMiddleware(AdminOnly(ActivateUser))).Methods("PUT")
	router.Handle("/api/admin/users/{id}/delete", AuthMiddleware(AdminOnly(AdminDeleteUser))).Methods("DELETE")

	// Reseller routes
	router.Handle("/api/reseller/create-user", AuthMiddleware(ResellerOnly(ResellerCreateUser))).Methods("POST")
	router.Handle("/api/reseller/users", AuthMiddleware(ResellerOnly(ResellerGetUsers))).Methods("GET")
	router.Handle("/api/reseller/quota", AuthMiddleware(ResellerOnly(ResellerGetQuota))).Methods("GET")

	// Packages route
	router.HandleFunc("/api/packages", GetPackages).Methods("GET")

	// Static files
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("../frontend")))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
