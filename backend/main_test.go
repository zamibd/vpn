package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestCORSMiddleware tests CORS headers
func TestCORSMiddleware(t *testing.T) {
	router := http.NewServeMux()
	handler := CORSMiddleware(router)

	// Test OPTIONS preflight request
	req, _ := http.NewRequest("OPTIONS", "/api/auth/login", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Check CORS headers
	if w.Header().Get("Access-Control-Allow-Origin") == "" {
		t.Error("Missing Access-Control-Allow-Origin header")
	}
	if w.Header().Get("Access-Control-Allow-Methods") == "" {
		t.Error("Missing Access-Control-Allow-Methods header")
	}
}

// TestGenerateRandomDigits tests random generation
func TestGenerateRandomDigits(t *testing.T) {
	result := generateRandomDigits(6)
	if len(result) != 6 {
		t.Errorf("Expected length 6, got %d", len(result))
	}
}

// TestGenerateToken tests JWT token generation
func TestGenerateToken(t *testing.T) {
	token, err := generateToken(1, "admin")
	if err != nil {
		t.Errorf("Token generation failed: %v", err)
	}
	if token == "" {
		t.Error("Token is empty")
	}
}

// TestVerifyToken tests JWT token verification
func TestVerifyToken(t *testing.T) {
	// Generate a token
	token, _ := generateToken(1, "admin")

	// Verify it
	claims, err := verifyToken(token)
	if err != nil {
		t.Errorf("Token verification failed: %v", err)
	}

	if claims["user_id"] != float64(1) {
		t.Errorf("Expected user_id 1, got %v", claims["user_id"])
	}
	if claims["role"] != "admin" {
		t.Errorf("Expected role admin, got %v", claims["role"])
	}
}

// TestLoginRequestParsing tests if login requests are parsed correctly
func TestLoginRequestParsing(t *testing.T) {
	loginReq := LoginRequest{
		Username: "testuser",
		Password: "testpass",
	}

	body, _ := json.Marshal(loginReq)
	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	var decoded LoginRequest
	json.NewDecoder(req.Body).Decode(&decoded)

	if decoded.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", decoded.Username)
	}
}

// TestAuthResponseStructure tests the auth response structure
func TestAuthResponseStructure(t *testing.T) {
	resp := AuthResponse{
		Token: "test_token",
		User: User{
			ID:       1,
			Username: "testuser",
			Role:     "admin",
		},
		Error: "",
	}

	data, _ := json.Marshal(resp)
	var decoded AuthResponse
	json.Unmarshal(data, &decoded)

	if decoded.Token != "test_token" {
		t.Error("Token mismatch in response")
	}
	if decoded.User.Username != "testuser" {
		t.Error("Username mismatch in response")
	}
}
