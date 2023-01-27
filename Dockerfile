ARG GO_VERSION=1.19

# First stage: build the executable.
FROM golang:${GO_VERSION}-alpine AS builder

RUN apk add git

WORKDIR /src

# Import the code from the context.
COPY ./ ./

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /app ./main.go

CMD ["/app"]
