# Follow APIs

## Danh sách theo dõi

```
GET /api/follows/
```

Lấy danh sách các mối quan hệ theo dõi của người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Query Parameters**:

- `user_id`: Lọc theo người theo dõi (nếu cần lấy danh sách người được theo dõi bởi một người dùng khác)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "follower": 123,
      "followee": 456,
      "is_following": true,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "follower_detail": {
        "id": 123,
        "username": "user1",
        "full_name": "User One",
        "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
        "role": "renter"
      },
      "followee_detail": {
        "id": 456,
        "username": "owner1",
        "full_name": "Owner One",
        "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
        "role": "owner"
      }
    }
    // ... more follow relationships
  ]
}
```

## Theo dõi người dùng

```
POST /api/follows/
```

Tạo mối quan hệ theo dõi một người dùng khác.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "followee": 456
}
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "follower": 123,
  "followee": 456,
  "is_following": true,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "follower_detail": {
    "id": 123,
    "username": "user1",
    "full_name": "User One",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "renter"
  },
  "followee_detail": {
    "id": 456,
    "username": "owner1",
    "full_name": "Owner One",
    "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
    "role": "owner"
  }
}
```

## Hủy theo dõi người dùng

```
POST /api/follows/{id}/unfollow/
```

Hủy theo dõi một người dùng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "status": "success"
}
```

**Response (403 Forbidden)** - Khi không có quyền hủy theo dõi:

```json
{
  "error": "Không có quyền unfollow"
}
```

## Lấy danh sách người theo dõi

```
GET /api/follows/followers/
```

Lấy danh sách những người đang theo dõi người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
[
  {
    "id": 123,
    "username": "user1",
    "full_name": "User One",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "renter"
  },
  {
    "id": 124,
    "username": "user2",
    "full_name": "User Two",
    "avatar_thumbnail": "https://example.com/avatars/user2_thumb.jpg",
    "role": "renter"
  }
  // ... more followers
]
```

## Lấy danh sách người được theo dõi

```
GET /api/follows/following/
```

Lấy danh sách những người mà người dùng hiện tại đang theo dõi.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
[
  {
    "id": 456,
    "username": "owner1",
    "full_name": "Owner One",
    "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
    "role": "owner"
  },
  {
    "id": 457,
    "username": "owner2",
    "full_name": "Owner Two",
    "avatar_thumbnail": "https://example.com/avatars/owner2_thumb.jpg",
    "role": "owner"
  }
  // ... more people being followed
]
```
