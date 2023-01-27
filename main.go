package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("Hello, World.")
	fmt.Printf("bucketName: %s, objectKey: %s\n", os.Getenv("bucketName"), os.Getenv("objectKey"))
}
