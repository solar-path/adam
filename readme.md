# Adam Project

A Go web application using Supabase PostgreSQL for data storage.

## Setup

### Prerequisites
- Go 1.24.1 or later
- Supabase account and project

### Environment Variables
Set the following environment variables:
```bash
export SUPABASE_URL="your-supabase-postgres-connection-url"
export SUPABASE_KEY="your-supabase-postgres-key"
```

### Running the Application
```bash
go run main.go
```
The server will start on port 3000.

## Git Setup
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/solar-path/adam.git
git push -u origin main
```