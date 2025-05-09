# Authentication APIs

## Đăng ký tài khoản

```
POST /api/register/
```

Đăng ký tài khoản mới và gửi email xác thực.

**Request Body**:

```json
{
  "username": "example_user",
  "email": "user@example.com",
  "password": "secure_password",
  "password2": "secure_password",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "0987654321",
  "role": "renter"  // Giá trị có thể: "renter", "owner"
}
```

**Response (201 Created)**:

```json
{
  "message": "Đăng ký thành công! Vui lòng xác thực tài khoản.",
  "user_id": 123,
  "email": "user@example.com"
}
```

**Response (400 Bad Request)**:

```json
{
  "username": [
    "Tên đăng nhập này đã tồn tại."
  ],
  "email": [
    "Email này đã được sử dụng."
  ]
}
```

## Xác thực Email

```
POST /api/verify-email/
```

Xác thực tài khoản bằng mã được gửi đến email.

**Request Body**:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200 OK)**:

```json
{
  "message": "Xác thực tài khoản thành công!",
  "user_id": 123,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 36000
}
```

**Response (400 Bad Request)**:

```json
{
  "non_field_errors": [
    "Mã xác thực không hợp lệ hoặc đã hết hạn."
  ]
}
```

## Gửi lại mã xác thực

```
POST /api/resend-verification/
```

Gửi lại mã xác thực đến email nếu mã cũ đã hết hạn.

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:

```json
{
  "message": "Mã xác thực mới đã được gửi đến email của bạn.",
  "email": "user@example.com"
}
```

**Response (400 Bad Request)**:

```json
{
  "email": [
    "Địa chỉ email không tồn tại hoặc đã được xác thực."
  ]
}
```

## Kiểm tra trạng thái xác thực

```
POST /api/check-verification-status/
```

Kiểm tra xem tài khoản đã được xác thực chưa.

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:

```json
{
  "is_verified": true,
  "email": "user@example.com",
  "user_id": 123,
  "username": "example_user"
}
```

**Response (400 Bad Request)**:

```json
{
  "email": [
    "Email không tồn tại trong hệ thống"
  ]
}
```

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
