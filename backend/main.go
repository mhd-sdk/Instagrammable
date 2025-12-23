package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/google/generative-ai-go/genai"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"google.golang.org/api/option"
)

type UploadRequest struct {
	Prompt string `json:"prompt"`
}

type UploadResponse struct {
	ID                 int       `json:"id"`
	Prompt             string    `json:"prompt"`
	ImagePath          string    `json:"image_path"`
	GeneratedImagePath string    `json:"generated_image_path"`
	CreatedAt          time.Time `json:"created_at"`
}

var db *sql.DB
var genaiClient *genai.Client

func main() {
	ctx := context.Background()

	// Initialize Gemini client avec la clé API
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY environment variable is required")
	}

	var err error
	genaiClient, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal("Failed to create Gemini client:", err)
	}
	defer genaiClient.Close()

	// Database connection
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "host=localhost port=5432 user=postgres password=postgres dbname=instagrammable sslmode=disable"
	}

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
		generated_image_path TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatal("Failed to create table:", err)
	}

	// Ensure uploads and generated directories exist
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		log.Fatal("Failed to create uploads directory:", err)
	}
	if err := os.MkdirAll("./generated", 0755); err != nil {
		log.Fatal("Failed to create generated directory:", err)
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

func generateImageWithGemini(ctx context.Context, prompt string, imageBytes []byte) ([]byte, error) {
	// Utiliser le modèle Imagen pour l'édition d'image
	model := genaiClient.GenerativeModel("nano-banana-pro-preview")

	// list models
	// iter := genaiClient.ListModels(ctx)
	// for {
	// 	m, err := iter.Next()
	// 	if err == iterator.Done {
	// 		break
	// 	}
	// 	if err != nil {
	// 		log.Printf("Error listing models: %v", err)
	// 		break
	// 	}
	// 	log.Printf("Available model: %s, methods %s", m.Name, m.SupportedGenerationMethods)
	// }

	// Créer la requête avec l'image et le prompt
	parts := []genai.Part{
		genai.ImageData("jpeg", imageBytes),
		genai.Text(prompt),
	}

	resp, err := model.GenerateContent(ctx, parts...)
	if err != nil {
		return nil, fmt.Errorf("failed to generate image: %w", err)
	}

	// Extraire l'image générée de la réponse
	if len(resp.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates in response")
	}

	for _, part := range resp.Candidates[0].Content.Parts {
		if blob, ok := part.(genai.Blob); ok {
			return blob.Data, nil
		}
	}

	return nil, fmt.Errorf("no image data in response")
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := r.Context()

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

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join("uploads", filename)

	// Save file
	if err := os.WriteFile(filePath, fileBytes, 0644); err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate image with Gemini
	log.Printf("Generating image with Gemini using prompt: %s", prompt)
	generatedImageData, err := generateImageWithGemini(ctx, prompt, fileBytes)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		http.Error(w, "Failed to generate image with Gemini: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Save generated image
	generatedFilename := fmt.Sprintf("%d_generated.png", time.Now().UnixNano())
	generatedPath := filepath.Join("generated", generatedFilename)

	if err := os.WriteFile(generatedPath, generatedImageData, 0644); err != nil {
		log.Printf("Failed to save generated image: %v", err)
		http.Error(w, "Failed to save generated image: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert into database
	var upload UploadResponse
	err = db.QueryRow(
		"INSERT INTO uploads (prompt, image_path, generated_image_path) VALUES ($1, $2, $3) RETURNING id, prompt, image_path, generated_image_path, created_at",
		prompt, filePath, generatedPath,
	).Scan(&upload.ID, &upload.Prompt, &upload.ImagePath, &upload.GeneratedImagePath, &upload.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to save to database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(upload)
}
