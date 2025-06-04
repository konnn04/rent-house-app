# Profile APIs

## Xem profile người dùng

```
GET /api/profiles/{username}/
```

Xem thông tin chi tiết về profile của người dùng dựa trên username.

**Response (200 OK)**:

```json
{
  "id": 123,
  "username": "user1",
  "full_name": "User One",
  "avatar": "https://example.com/avatars/user1.jpg",
  "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
  "role": "owner",
  "email": "user@example.com",
  "phone_number": "0987654321",
  "address": "123 Street, City",
  "is_active": true,
  "first_name": "User",
  "last_name": "One",
  "post_count": 5,
  "joined_date": "2023-05-10T10:30:00Z",
  "follower_count": 10,
  "following_count": 20,
  "avg_rating": 4.5,
  "is_followed": false
}
```

## Danh sách chủ nhà

```
GET /api/profiles/owners/
```

Lấy danh sách người dùng có vai trò là chủ nhà (owner).

**Query Parameters**:

- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 25,
  "next": "https://api.example.com/api/profiles/owners/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "username": "owner1",
      "full_name": "Owner One",
      "avatar": "https://example.com/avatars/owner1.jpg",
      "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
      "role": "owner",
      "email": "owner@example.com",
      "phone_number": "0987654321",
      "address": "123 Street, City",
      "is_active": true,
      "first_name": "Owner",
      "last_name": "One"
    },
    {
      "id": 124,
      "username": "owner2",
      "full_name": "Owner Two",
      "avatar": "https://example.com/avatars/owner2.jpg",
      "avatar_thumbnail": "https://example.com/avatars/owner2_thumb.jpg",
      "role": "owner",
      "email": "owner2@example.com",
      "phone_number": "0987654322",
      "address": "124 Street, City",
      "is_active": true,
      "first_name": "Owner",
      "last_name": "Two"
    }
    // ... more owners
  ]
}
```
