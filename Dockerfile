# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git gcc musl-dev

# Copy go mod files
COPY go.mod go.mod

# Download dependencies
RUN go mod download

# Copy backend code
COPY backend/ backend/

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o vpn-server ./backend

# Final stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy the binary from builder
COPY --from=builder /app/vpn-server .

# Copy frontend files
COPY frontend/ frontend/

# Copy .env file
COPY .env .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/packages || exit 1

# Run the application
CMD ["./vpn-server"]
