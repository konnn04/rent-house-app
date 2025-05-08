# User APIs

## Lấy và cập nhật thông tin người dùng hiện tại

```
GET /api/users/current-user/
PATCH /api/users/current-user/
```

Lấy hoặc cập nhật thông tin của người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body (PATCH)**:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "0987654321"
}
```

**Response (200 OK)**:

```json
{
  "id": 123,
  "username": "example_user",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "0987654321",
  "role": "renter",
  "address": "123 Example St",
  "avatar": "https://example.com/avatars/user123.jpg"
}
```

## Đăng ký FCM Token cho thông báo

```
POST /api/users/register_device/
```

Đăng ký FCM token cho thiết bị hiện tại để nhận thông báo.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "fcm_token": "eEw23sdfsdf_FCM_TOKEN_EXAMPLE_3kjnfdwwje"
}
```

**Response (200 OK)**:

```json
{
  "status": "Device registered successfully"
}
```

## Hủy đăng ký FCM Token

```
POST /api/users/unregister_device/
```

Hủy đăng ký FCM token khi đăng xuất hoặc xóa ứng dụng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "fcm_token": "eEw23sdfsdf_FCM_TOKEN_EXAMPLE_3kjnfdwwje"
}
```

**Response (200 OK)**:

```json
{
  "status": "Device unregistered successfully"
}
```

## Cập nhật avatar người dùng

```
PATCH /api/users/update_avatar/
```

Cập nhật ảnh đại diện của người dùng.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
avatar: [file]  // File hình ảnh
```

**Response (200 OK)**:

```json
{
  "id": 123,
  "avatar": "https://example.com/avatars/user123.jpg",
  "avatar_thumbnail": "https://example.com/avatars/user123_thumb.jpg"
}
```

## Đổi mật khẩu

```
POST /api/users/change_password/
```

Đổi mật khẩu của người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "old_password": "old_secure_password",
  "new_password": "new_secure_password",
  "new_password2": "new_secure_password"
}
```

**Response (200 OK)**:

```json
{
  "message": "Mật khẩu đã được cập nhật thành công."
}
```

**Response (400 Bad Request)**:

```json
{
  "old_password": [
    "Mật khẩu hiện tại không đúng."
  ]
}
```

## Xem thông tin người dùng khác

```
GET /api/users/{id}/
```

Xem thông tin cơ bản của người dùng khác.

**Response (200 OK)**:

```json
{
  "id": 124,
  "username": "other_user",
  "full_name": "Other User",
  "avatar": "https://example.com/avatars/other_user.jpg",
  "avatar_thumbnail": "https://example.com/avatars/other_user_thumb.jpg",
  "role": "owner",
  "joined_date": "2023-05-01T10:30:00Z",
  "is_followed": false
}
```

## Tìm kiếm người dùng

```
GET /api/users/search/?q=john
```

Tìm kiếm người dùng theo tên đăng nhập hoặc tên đầy đủ.

**Query Parameters**:

- `q`: Từ khóa tìm kiếm
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 123,
      "username": "john_doe",
      "full_name": "John Doe",
      "avatar_thumbnail": "https://example.com/avatars/john_doe_thumb.jpg",
      "role": "renter"
    },
    {
      "id": 124,
      "username": "johnny",
      "full_name": "Johnny Walker",
      "avatar_thumbnail": "https://example.com/avatars/johnny_thumb.jpg",
      "role": "owner"
    },
    {
      "id": 125,
      "username": "johnson",
      "full_name": "John Smith",
      "avatar_thumbnail": "https://example.com/avatars/johnson_thumb.jpg",
      "role": "renter"
    }
  ]
}
```
