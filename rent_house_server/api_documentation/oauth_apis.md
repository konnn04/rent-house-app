# OAuth APIs

## Đăng nhập

```
POST /oauth/token/
```

Đăng nhập và lấy access token.

**Request Body**:

```json
{
  "grant_type": "password",
  "username": "example_user",
  "password": "secure_password",
  "client_id": "reactnative",
  "client_secret": "reactnativesecret"
}
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 36000,
  "token_type": "Bearer",
  "scope": "read write"
}
```

**Response (400 Bad Request)**:

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid credentials given."
}
```

## Làm mới Token

```
POST /oauth/token/
```

Làm mới access token khi hết hạn.

**Request Body**:

```json
{
  "grant_type": "refresh_token",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client_id": "reactnative",
  "client_secret": "reactnativesecret"
}
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 36000,
  "token_type": "Bearer",
  "scope": "read write"
}
```

**Response (400 Bad Request)**:

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid refresh token."
}
```

## Đăng xuất

```
POST /api/logout/
```

Đăng xuất và thu hồi token.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "client_id": "reactnative",
  "client_secret": "reactnativesecret",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:

```json
{
  "message": "Đăng xuất thành công."
}
```
