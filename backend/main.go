package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type UploadRequest struct {
	Prompt string `json:"prompt"`
}

type UploadResponse struct {
	ID        int       `json:"id"`
	Prompt    string    `json:"prompt"`
	ImagePath string    `json:"image_path"`
	CreatedAt time.Time `json:"created_at"`
}

var db *sql.DB

func main() {
	// Database connection
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "host=localhost port=5432 user=postgres password=postgres dbname=instagrammable sslmode=disable"
	}

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test database connection
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Create table if not exists
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS uploads (
		id SERIAL PRIMARY KEY,
		prompt TEXT NOT NULL,
		image_path TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatal("Failed to create table:", err)
	}

	// Ensure uploads directory exists
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		log.Fatal("Failed to create uploads directory:", err)
	}

	// Setup router
	mux := http.NewServeMux()
	mux.HandleFunc("/api/upload", handleUpload)
	mux.HandleFunc("/api/health", handleHealth)

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed:", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get prompt
	prompt := r.FormValue("prompt")
	if prompt == "" {
		http.Error(w, "Prompt is required", http.StatusBadRequest)
		return
	}

	// Get file
	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Image is required: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filepath := filepath.Join("uploads", filename)

	// Create file
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert into database
	var upload UploadResponse
	err = db.QueryRow(
		"INSERT INTO uploads (prompt, image_path) VALUES ($1, $2) RETURNING id, prompt, image_path, created_at",
		prompt, filepath,
	).Scan(&upload.ID, &upload.Prompt, &upload.ImagePath, &upload.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to save to database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(upload)
}
