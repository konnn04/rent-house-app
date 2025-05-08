# Notification APIs

## Danh sách thông báo

```
GET /api/notifications/
```

Lấy danh sách thông báo của người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Query Parameters**:

- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 20,
  "next": "https://api.example.com/api/notifications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 123,
      "content": "Có người bình luận về bài đăng của bạn",
      "url": "/posts/456",
      "type": "comment",
      "is_read": false,
      "sender": {
        "id": 789,
        "username": "user2",
        "full_name": "User Two",
        "avatar": "https://example.com/avatars/user2.jpg",
        "avatar_thumbnail": "https://example.com/avatars/user2_thumb.jpg",
        "role": "renter"
      },
      "related_object_type": "post",
      "related_object_id": 456,
      "created_at": "2023-07-20T14:30:00Z",
      "updated_at": "2023-07-20T14:30:00Z"
    }
    // ... more notifications
  ]
}
```

## Đánh dấu thông báo đã đọc

```
PATCH /api/notifications/{id}/mark_as_read/
```

Đánh dấu một thông báo cụ thể đã được đọc.

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

## Đánh dấu tất cả thông báo đã đọc

```
POST /api/notifications/mark_all_as_read/
```

Đánh dấu tất cả các thông báo chưa đọc của người dùng hiện tại là đã đọc.

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

## Lấy số lượng thông báo chưa đọc

```
GET /api/notifications/unread_count/
```

Lấy số lượng thông báo chưa đọc của người dùng hiện tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "unread_count": 5
}
```
