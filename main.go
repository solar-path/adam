package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// declare database variable
var db *sql.DB

// initilize database connection
func initDB() {
	// error variable
	var err error
	// supabase url
	supabaseURL := "postgres://postgres:zFAYvTAl1Zu1Vqvk@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?options=reference%3Dxizxaxgkhimeipbokvqf"
	// check if supabase url is empty
	if supabaseURL == "" {
		log.Fatal("SUPABASE_URL environment variable is required")
	}

	// open database connection - define driver name as postgres and connection string as supabaseURL
	db, err = sql.Open("postgres", supabaseURL)
	// check for errors
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	// ping database
	err = db.Ping()
	if err != nil {
		log.Fatal("Error pinging database:", err)
	}

	fmt.Println("Successfully connected to Supabase Postgres")
}

func main() {
	initDB()
	defer db.Close()

	gRouter := mux.NewRouter()
	gRouter.HandleFunc("/", HomeHandler)

	port := ":3000"
	fmt.Printf("Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, gRouter))
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Welcome to the Home page")
}
