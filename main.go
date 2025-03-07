package main

import (
	"fmt"
	"net/http"
)

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Welcome to the Home page")
}

func setupRoutes() {
	http.HandleFunc("/", homePage)
}

func main() {
	setupRoutes()
	fmt.Println("Server started at 127.0.0.1:3000")
	if err := http.ListenAndServe(":3000", nil); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
