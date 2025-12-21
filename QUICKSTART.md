# Quick Start Guide

## Prerequisites
- PostgreSQL must be running
- Node.js v18+ installed
- Go v1.21+ installed

## Setup (5 minutes)

### 1. Create Database
```bash
createdb instagrammable
```

### 2. Start Backend
```bash
cd backend
go run main.go
```
Backend will start at: http://localhost:8080

### 3. Start Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at: http://localhost:5173

### 4. Use the App
1. Open http://localhost:5173 in your browser
2. Enter a prompt text
3. Select an image file
4. Click Upload
5. See success message with upload ID

## Database Configuration

By default, the backend uses:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: instagrammable

To customize, set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="host=localhost port=5432 user=myuser password=mypass dbname=instagrammable sslmode=disable"
```

## API Testing

Test the API directly with curl:
```bash
curl -X POST http://localhost:8080/api/upload \
  -F "prompt=My test prompt" \
  -F "image=@/path/to/image.jpg"
```

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify database exists: `psql -l | grep instagrammable`

### Frontend build errors
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### CORS errors
- Ensure backend is running on port 8080
- Check frontend is accessing http://localhost:8080
