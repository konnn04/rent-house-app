# Ping API

## Health Check

```
GET /api/ping/
```

A simple health check endpoint to verify the API is running.

**Response (200 OK)**:

```json
{
  "message": "pong",
  "latency_ms": 0.12,
  "timestamp": "2023-07-15T10:30:00Z"
}
```
