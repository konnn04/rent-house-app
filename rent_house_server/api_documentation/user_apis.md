# User APIs

## Lấy thông tin người dùng hiện tại

```
GET /api/users/current-user/
```

Lấy thông tin chi tiết về người dùng hiện tại đang đăng nhập.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "id": 123,
  "username": "user1",
  "email": "user@example.com",
  "first_name": "First",
  "last_name": "Last",
  "phone_number": "0987654321",
  "role": "owner",
  "address": "123 Street, City",
  "avatar": "https://example.com/avatars/user1.jpg",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "post_count": 5,
  "joined_date": "2023-05-10T10:30:00Z",
  "follower_count": 10,
  "following_count": 20,
  "avg_rating": 4.5,
  "house_count": 3,
  "room_count": null,
  "is_verified": true,
  "has_identity": true
}
```

## Cập nhật thông tin người dùng

```
PATCH /api/users/current-user/
```

Cập nhật thông tin cá nhân của người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "first_name": "New First Name",
  "last_name": "New Last Name",
  "phone_number": "0987654322",
  "address": "456 New Street, City"
}
```

**Response (200 OK)**:

```json
{
  "id": 123,
  "username": "user1",
  "email": "user@example.com",
  "first_name": "New First Name",
  "last_name": "New Last Name",
  "phone_number": "0987654322",
  "role": "owner",
  "address": "456 New Street, City",
  "avatar": "https://example.com/avatars/user1.jpg",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "post_count": 5,
  "joined_date": "2023-05-10T10:30:00Z",
  "follower_count": 10,
  "following_count": 20,
  "avg_rating": 4.5,
  "house_count": 3,
  "room_count": null,
  "is_verified": true,
  "has_identity": true
}
```

## Cập nhật avatar

```
PATCH /api/users/update-avatar/
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
  "username": "user1",
  "email": "user@example.com",
  "first_name": "First",
  "last_name": "Last",
  "phone_number": "0987654321",
  "role": "owner",
  "address": "123 Street, City",
  "avatar": "https://res.cloudinary.com/example/image/upload/v1234567/user_avatars/abc123.jpg",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "post_count": 5,
  "joined_date": "2023-05-10T10:30:00Z",
  "follower_count": 10,
  "following_count": 20,
  "avg_rating": 4.5,
  "house_count": 3,
  "room_count": null,
  "is_verified": true,
  "has_identity": true
}
```

## Xác thực danh tính

```
POST /api/identity-verification/
```

Gửi hồ sơ xác thực danh tính (chỉ dành cho chủ nhà).

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
id_number: 123456789012
front_id_image: [file]  // Ảnh mặt trước CCCD/CMND
back_id_image: [file]   // Ảnh mặt sau CCCD/CMND
selfie_image: [file]    // Ảnh chụp chân dung với giấy tờ
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "id_number": "123456789012",
  "is_verified": false,
  "front_id_image": {
    "id": 5,
    "url": "https://res.cloudinary.com/example/image/upload/v1234567/identity_verification/front_123.jpg"
  },
  "back_id_image": {
    "id": 6,
    "url": "https://res.cloudinary.com/example/image/upload/v1234567/identity_verification/back_123.jpg"
  },
  "selfie_image": {
    "id": 7,
    "url": "https://res.cloudinary.com/example/image/upload/v1234567/identity_verification/selfie_123.jpg"
  },
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z"
}
```

**Response (403 Forbidden)** - Khi người dùng không phải là chủ nhà:

```json
{
  "detail": "Chỉ chủ nhà mới cần xác thực danh tính"
}
```

## Xem trạng thái xác thực danh tính

```
GET /api/identity-verification/{id}/
```

Xem thông tin và trạng thái xác thực danh tính.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "id_number": "123456789012",
  "is_verified": true,
  "front_id_image": {
    "id": 5,
    "url": "https://res.cloudinary.com/example/image/upload/v1234567/identity_verification/front_123.jpg"
  },
  "back_id_image": {
    "id": 6,
    "url": "https://res.cloudinary.com/example/image/upload/v1234567/identity_verification/back_123.jpg"
  },
  "selfie_image": {
    "id": 7,
    "url": "https://res.cloudinary.com/example/image/upload/v1234567/identity_verification/selfie_123.jpg"
  },
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z"
}
```
