# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git gcc musl-dev

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy backend code
COPY backend/ backend/

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o vpn-server ./backend

# Final stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies including wget for health checks
RUN apk --no-cache add ca-certificates wget

# Create non-root user for better security
RUN addgroup -g 1000 vpnuser && \
    adduser -D -u 1000 -G vpnuser vpnuser

# Copy the binary from builder
COPY --from=builder /app/vpn-server .

# Copy frontend files
COPY frontend/ frontend/

# Copy .env file if it exists
COPY .env* ./

# Set proper permissions - backend binary and app directory should be owned by vpnuser
RUN chown -R vpnuser:vpnuser /app && \
    chmod 755 /app/vpn-server

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/packages || exit 1

# Switch to non-root user
USER vpnuser

# Run the application
CMD ["./vpn-server"]
