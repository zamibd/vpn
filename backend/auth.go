package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func init() {
	// Initialize JWT secret from environment variable
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-this" // Fallback for development
	}
	jwtSecret = []byte(secret)
}

type User struct {
	ID         int       `json:"id"`
	Username   string    `json:"username"`
	Password   string    `json:"-"`
	Role       string    `json:"role"` // admin, reseller, user
	Email      string    `json:"email"`
	Status     string    `json:"status"` // active, suspended
	ExpiryDays int       `json:"expiry_days"`
	CreatedAt  time.Time `json:"created_at"`
	ExpiresAt  time.Time `json:"expires_at"`
	ResellerID *int      `json:"reseller_id"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username   string `json:"username"`
	Email      string `json:"email"`
	Role       string `json:"role"` // admin, reseller
	ExpiryDays int    `json:"expiry_days"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
	Error string `json:"error,omitempty"`
}

// Generate random 6-digit number
func generateRandomDigits(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		num, _ := rand.Int(rand.Reader, big.NewInt(10))
		result += fmt.Sprintf("%d", num.Int64())
	}
	return result
}

// Generate JWT token
func generateToken(userID int, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// Verify JWT token
func verifyToken(tokenString string) (map[string]interface{}, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	claims := token.Claims.(jwt.MapClaims)
	return claims, nil
}

// Login handler
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var user User
	err := db.QueryRow(
		"SELECT id, username, role, email, status, created_at, expires_at FROM users WHERE username = ? AND password = ?",
		req.Username, hashPassword(req.Password),
	).Scan(&user.ID, &user.Username, &user.Role, &user.Email, &user.Status, &user.CreatedAt, &user.ExpiresAt)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "Invalid credentials"})
		return
	}

	// Check if user is suspended
	if user.Status == "suspended" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "User account is suspended"})
		return
	}

	// Check if user is expired
	if user.ExpiresAt.Before(time.Now()) && user.Role == "user" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "User account has expired"})
		return
	}

	token, err := generateToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "Token generation error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Token: token,
		User:  user,
	})
}

// Register handler (for admin and reseller creation)
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate role
	if req.Role != "admin" && req.Role != "reseller" {
		http.Error(w, "Invalid role", http.StatusBadRequest)
		return
	}

	// Only admin can create other accounts via this endpoint
	// In production, add proper authorization checks

	username := generateRandomDigits(6)
	password := generateRandomDigits(6)

	var expiresAt time.Time
	if req.Role == "user" {
		expiresAt = time.Now().AddDate(0, req.ExpiryDays/30, req.ExpiryDays%30)
	} else {
		expiresAt = time.Date(2099, 12, 31, 0, 0, 0, 0, time.UTC) // No expiry for admin/reseller
	}

	result, err := db.Exec(
		"INSERT INTO users (username, password, role, email, status, expires_at) VALUES (?, ?, ?, ?, 'active', ?)",
		username, hashPassword(password), req.Role, req.Email, expiresAt,
	)

	if err != nil {
		http.Error(w, "Registration error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userID, _ := result.LastInsertId()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username": username,
		"password": password,
		"user_id":  userID,
		"role":     req.Role,
		"message":  "Account created successfully",
	})
}

// Public user registration for VPN package purchase
func PublicRegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email     string `json:"email"`
		Password  string `json:"password"`
		PackageID int    `json:"package_id"`
		FullName  string `json:"full_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" || req.PackageID == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "Email, password, and package selection are required"})
		return
	}

	// Check if email already exists
	var existingID int
	err := db.QueryRow("SELECT id FROM users WHERE email = ?", req.Email).Scan(&existingID)
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "Email address is already registered"})
		return
	}

	// Get package details to calculate expiry
	var pkg struct {
		ID    int     `json:"id"`
		Name  string  `json:"name"`
		Days  int     `json:"days"`
		Price float64 `json:"price"`
	}

	err = db.QueryRow("SELECT id, name, days, price FROM packages WHERE id = ?", req.PackageID).Scan(
		&pkg.ID, &pkg.Name, &pkg.Days, &pkg.Price,
	)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "Invalid package selected"})
		return
	}

	// Generate username (6-digit number)
	username := generateRandomDigits(6)

	// Calculate expiry date based on package
	expiresAt := time.Now().AddDate(0, 0, pkg.Days)

	// Create user account
	result, err := db.Exec(
		"INSERT INTO users (username, password, role, email, status, expires_at, full_name, package_id) VALUES (?, ?, 'user', ?, 'active', ?, ?, ?)",
		username, hashPassword(req.Password), req.Email, expiresAt, req.FullName, pkg.ID,
	)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "Registration failed: " + err.Error()})
		return
	}

	userID, _ := result.LastInsertId()

	// Generate token for immediate login
	token, err := generateToken(int(userID), "user")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{Error: "Token generation failed"})
		return
	}

	// Create user object for response
	user := User{
		ID:        int(userID),
		Username:  username,
		Role:      "user",
		Email:     req.Email,
		Status:    "active",
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":    token,
		"user":     user,
		"username": username,
		"package":  pkg,
		"message":  "Account created successfully! Your VPN username is: " + username,
		"success":  true,
	})
}

// Simple password hashing (use bcrypt in production)
func hashPassword(password string) string {
	return password // Placeholder - use bcrypt or similar in production
}

// Auth middleware
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := verifyToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Store claims in context for later use
		r.Header.Set("user_id", fmt.Sprintf("%.0f", claims["user_id"]))
		r.Header.Set("user_role", claims["role"].(string))

		next.ServeHTTP(w, r)
	})
}

// Admin only middleware
func AdminOnly(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("user_role") != "admin" {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}
		next(w, r)
	})
}

// Reseller only middleware
func ResellerOnly(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role := r.Header.Get("user_role")
		if role != "reseller" && role != "admin" {
			http.Error(w, "Reseller access required", http.StatusForbidden)
			return
		}
		next(w, r)
	})
}
