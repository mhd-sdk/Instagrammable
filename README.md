# Instagrammable

A fullstack web application for uploading images with prompts. Built with React TypeScript frontend and Golang backend.

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Golang with PostgreSQL database
- **Database**: PostgreSQL

## Features

- Upload images with text prompts
- Store image paths and prompts in PostgreSQL database
- Modern UI with shadcn/ui components
- RESTful API

## Prerequisites

- Node.js (v18+)
- Go (v1.21+)
- PostgreSQL (v14+)

## Setup

### Database Setup

1. Install and start PostgreSQL
2. Create a database:
```bash
createdb instagrammable
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials if needed

4. Run the backend:
```bash
go run main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter a prompt in the text field
3. Select an image file to upload
4. Click "Upload" to submit

The application will:
- Save the image to the `backend/uploads` directory
- Store the prompt and image path in the PostgreSQL database
- Display a success message with the upload ID

## API Endpoints

### POST /api/upload
Upload an image with a prompt

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `prompt` (string): The text prompt
  - `image` (file): The image file

**Response:**
```json
{
  "id": 1,
  "prompt": "Your prompt text",
  "image_path": "uploads/1234567890.jpg",
  "created_at": "2025-12-21T20:00:00Z"
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok"
}
```

## Database Schema

### uploads table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing ID |
| prompt | TEXT | User's prompt text |
| image_path | TEXT | Path to uploaded image |
| created_at | TIMESTAMP | Upload timestamp |

## Development

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
go build -o instagrammable
```

## License

MIT
