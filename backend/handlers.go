package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type Package struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Days        int     `json:"days"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
}

type UserResponse struct {
	ID         int       `json:"id"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	Role       string    `json:"role"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	ExpiresAt  time.Time `json:"expires_at"`
	ResellerID *int      `json:"reseller_id,omitempty"`
}

// Get user profile
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("user_id")

	var user UserResponse
	err := db.QueryRow(
		"SELECT id, username, email, role, status, created_at, expires_at FROM users WHERE id = ?",
		userID,
	).Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.Status, &user.CreatedAt, &user.ExpiresAt)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// Update user profile
func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("user_id")

	var update map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	email, ok := update["email"].(string)
	if !ok {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	_, err := db.Exec("UPDATE users SET email = ? WHERE id = ?", email, userID)
	if err != nil {
		http.Error(w, "Update error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated successfully"})
}

// Delete user account
func DeleteUserAccount(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("user_id")

	_, err := db.Exec("DELETE FROM users WHERE id = ? AND role = 'user'", userID)
	if err != nil {
		http.Error(w, "Delete error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Account deleted successfully"})
}

// Admin: Get all users
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(
		"SELECT id, username, email, role, status, created_at, expires_at FROM users ORDER BY created_at DESC",
	)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []UserResponse
	for rows.Next() {
		var user UserResponse
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.Status, &user.CreatedAt, &user.ExpiresAt); err != nil {
			continue
		}
		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// Admin: Get user by ID
func GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	var user UserResponse
	err := db.QueryRow(
		"SELECT id, username, email, role, status, created_at, expires_at FROM users WHERE id = ?",
		userID,
	).Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.Status, &user.CreatedAt, &user.ExpiresAt)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// Admin: Suspend user
func SuspendUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	_, err := db.Exec("UPDATE users SET status = 'suspended' WHERE id = ?", userID)
	if err != nil {
		http.Error(w, "Update error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User suspended successfully"})
}

// Admin: Activate user
func ActivateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	_, err := db.Exec("UPDATE users SET status = 'active' WHERE id = ?", userID)
	if err != nil {
		http.Error(w, "Update error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User activated successfully"})
}

// Admin: Delete user
func AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	_, err := db.Exec("DELETE FROM users WHERE id = ?", userID)
	if err != nil {
		http.Error(w, "Delete error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

// Reseller: Create user
func ResellerCreateUser(w http.ResponseWriter, r *http.Request) {
	resellerID := r.Header.Get("user_id")
	role := r.Header.Get("user_role")

	var req struct {
		ExpiryDays int    `json:"expiry_days"` // 1, 3, 6, 12 months
		Email      string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Only admin can create users without reseller_id
	if role == "reseller" {
		// Reseller can only create limited users based on admin quota
		// Check reseller quota first
		var currentCount int
		db.QueryRow("SELECT COUNT(*) FROM users WHERE reseller_id = ?", resellerID).Scan(&currentCount)

		var quota int
		db.QueryRow("SELECT user_quota FROM resellers WHERE user_id = ?", resellerID).Scan(&quota)

		if currentCount >= quota {
			http.Error(w, "User quota exceeded", http.StatusForbidden)
			return
		}
	}

	username := generateRandomDigits(6)
	password := generateRandomDigits(6)
	expiresAt := time.Now().AddDate(0, req.ExpiryDays/30, req.ExpiryDays%30)

	result, err := db.Exec(
		"INSERT INTO users (username, password, role, email, status, expires_at, reseller_id) VALUES (?, ?, 'user', ?, 'active', ?, ?)",
		username, hashPassword(password), req.Email, expiresAt, resellerID,
	)

	if err != nil {
		http.Error(w, "Creation error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userID, _ := result.LastInsertId()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id":    userID,
		"username":   username,
		"password":   password,
		"email":      req.Email,
		"role":       "user",
		"expires_at": expiresAt,
		"message":    "User created successfully",
	})
}

// Reseller: Get own users
func ResellerGetUsers(w http.ResponseWriter, r *http.Request) {
	resellerID := r.Header.Get("user_id")

	rows, err := db.Query(
		"SELECT id, username, email, role, status, created_at, expires_at FROM users WHERE reseller_id = ? ORDER BY created_at DESC",
		resellerID,
	)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []UserResponse
	for rows.Next() {
		var user UserResponse
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.Status, &user.CreatedAt, &user.ExpiresAt); err != nil {
			continue
		}
		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// Reseller: Get quota
func ResellerGetQuota(w http.ResponseWriter, r *http.Request) {
	resellerID := r.Header.Get("user_id")

	var quota, currentCount int
	db.QueryRow("SELECT user_quota FROM resellers WHERE user_id = ?", resellerID).Scan(&quota)
	db.QueryRow("SELECT COUNT(*) FROM users WHERE reseller_id = ?", resellerID).Scan(&currentCount)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{
		"total_quota": quota,
		"used":        currentCount,
		"remaining":   quota - currentCount,
	})
}

// Get VPN packages
func GetPackages(w http.ResponseWriter, r *http.Request) {
	packages := []Package{
		{ID: 1, Name: "1 Month", Days: 30, Price: 2.99, Description: "1 month VPN access"},
		{ID: 2, Name: "3 Months", Days: 90, Price: 7.99, Description: "3 months VPN access"},
		{ID: 3, Name: "6 Months", Days: 180, Price: 14.99, Description: "6 months VPN access"},
		{ID: 4, Name: "12 Months", Days: 365, Price: 27.99, Description: "12 months VPN access"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(packages)
}

// Cleanup expired users (call this periodically)
func CleanupExpiredUsers() {
	ticker := time.NewTicker(24 * time.Hour)
	go func() {
		for range ticker.C {
			_, err := db.Exec("DELETE FROM users WHERE role = 'user' AND expires_at < NOW()")
			if err != nil {
				fmt.Println("Cleanup error:", err)
			} else {
				fmt.Println("Expired users cleaned up")
			}
		}
	}()
}
