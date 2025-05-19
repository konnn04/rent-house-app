# Chat and Message APIs

## Chat Group APIs

### Danh sách nhóm chat

```
GET /api/chats/
```

Lấy danh sách các nhóm chat mà người dùng là thành viên.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Owner One và Renter One",
      "description": null,
      "is_group": false,
      "members_summary": [
        {
          "id": 123,
          "username": "renter1",
          "full_name": "Renter One",
          "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
          "role": "renter"
        },
        {
          "id": 456,
          "username": "owner1",
          "full_name": "Owner One",
          "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
          "role": "owner"
        }
      ],
      "created_by": 456,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T11:45:00Z",
      "last_message": {
        "id": 10,
        "sender": {
          "id": 123,
          "username": "renter1",
          "full_name": "Renter One",
          "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
          "role": "renter"
        },
        "content": "Phòng còn trống không ạ?",
        "created_at": "2023-07-15T11:45:00Z",
        "is_removed": false
      },
      "unread_count": 1
    }
    // ... more chat groups
  ]
}
```

### Chi tiết nhóm chat

```
GET /api/chats/{id}/
```

Lấy thông tin chi tiết của một nhóm chat.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "name": "Owner One và Renter One",
  "description": null,
  "is_group": false,
  "members_summary": [
    {
      "id": 123,
      "username": "renter1",
      "full_name": "Renter One",
      "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
      "role": "renter"
    },
    {
      "id": 456,
      "username": "owner1",
      "full_name": "Owner One",
      "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
      "role": "owner"
    }
  ],
  "created_by": 456,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T11:45:00Z",
  "last_message": {
    "id": 10,
    "sender": {
      "id": 123,
      "username": "renter1",
      "full_name": "Renter One",
      "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
      "role": "renter"
    },
    "content": "Phòng còn trống không ạ?",
    "created_at": "2023-07-15T11:45:00Z",
    "is_removed": false
  },
  "unread_count": 1,
  "members": [
    {
      "id": 2,
      "chat_group": 1,
      "user": {
        "id": 123,
        "username": "renter1",
        "full_name": "Renter One",
        "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
        "role": "renter"
      },
      "is_admin": false,
      "nickname": null,
      "last_read_at": "2023-07-15T10:45:00Z",
      "unread_count": 1,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z"
    },
    {
      "id": 1,
      "chat_group": 1,
      "user": {
        "id": 456,
        "username": "owner1",
        "full_name": "Owner One",
        "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
        "role": "owner"
      },
      "is_admin": true,
      "nickname": null,
      "last_read_at": "2023-07-15T11:45:00Z",
      "unread_count": 0,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z"
    }
  ]
}
```

### Tạo nhóm chat

```
POST /api/chats/
```

Tạo một nhóm chat mới.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
name: Nhóm thảo luận dự án
description: Nhóm chat thảo luận về dự án xây dựng
members: 123
members: 456
members: 789
```

**Response (201 Created)**:

```json
{
  "id": 2,
  "name": "Nhóm thảo luận dự án",
  "description": "Nhóm chat thảo luận về dự án xây dựng",
  "is_group": true,
  "members_summary": [
    {
      "id": 123,
      "username": "renter1",
      "full_name": "Renter One",
      "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
      "role": "renter"
    },
    {
      "id": 456,
      "username": "owner1",
      "full_name": "Owner One",
      "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
      "role": "owner"
    },
    {
      "id": 789,
      "username": "user3",
      "full_name": "User Three",
      "avatar_thumbnail": "https://example.com/avatars/user3_thumb.jpg",
      "role": "renter"
    }
  ],
  "created_by": 123,
  "created_at": "2023-07-15T13:30:00Z",
  "updated_at": "2023-07-15T13:30:00Z",
  "last_message": null,
  "unread_count": 0
}
```

### Tạo hoặc lấy chat 1-1

```
POST /api/chats/create_direct_chat/
```

Tạo một cuộc trò chuyện 1-1 với một người dùng khác, hoặc lấy cuộc trò chuyện đã tồn tại.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "user_id": 456
}
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "name": "Owner One và Renter One",
  "description": null,
  "is_group": false,
  "members_summary": [
    {
      "id": 123,
      "username": "renter1",
      "full_name": "Renter One",
      "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
      "role": "renter"
    },
    {
      "id": 456,
      "username": "owner1",
      "full_name": "Owner One",
      "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
      "role": "owner"
    }
  ],
  "created_by": 456,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T11:45:00Z",
  "last_message": {
    "id": 10,
    "sender": {
      "id": 123,
      "username": "renter1",
      "full_name": "Renter One",
      "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
      "role": "renter"
    },
    "content": "Phòng còn trống không ạ?",
    "created_at": "2023-07-15T11:45:00Z",
    "is_removed": false
  },
  "unread_count": 1
}
```

**Response (404 Not Found)** - Khi người dùng không tồn tại:

```json
{
  "error": "User không tồn tại"
}
```

### Thêm thành viên vào nhóm chat

```
POST /api/chats/{id}/add_member/
```

Thêm một thành viên mới vào nhóm chat (yêu cầu là admin của nhóm).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "user_id": 789,
  "is_admin": false
}
```

**Response (200 OK)**:

```json
{
  "status": "success"
}
```

**Response (403 Forbidden)** - Khi không có quyền thêm thành viên:

```json
{
  "error": "Không có quyền thêm thành viên"
}
```

### Xóa thành viên khỏi nhóm chat

```
POST /api/chats/{id}/remove_member/
```

Xóa một thành viên khỏi nhóm chat (yêu cầu là admin của nhóm).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "user_id": 789
}
```

**Response (200 OK)**:

```json
{
  "status": "success"
}
```

**Response (403 Forbidden)** - Khi không có quyền xóa thành viên:

```json
{
  "error": "Không có quyền xóa thành viên"
}
```

### Rời khỏi nhóm chat

```
POST /api/chats/{id}/leave_group/
```

Rời khỏi một nhóm chat.

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

**Response (400 Bad Request)** - Khi cố gắng rời khỏi chat 1-1:

```json
{
  "error": "Không thể rời khỏi chat trực tiếp"
}
```

## Message APIs

### Lấy tin nhắn của một nhóm chat

```
GET /api/chats/{id}/messages/
```

Lấy danh sách tin nhắn của một nhóm chat.

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
  "next": "https://api.example.com/api/chats/1/messages/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "chat_group": 1,
      "sender": {
        "id": 456,
        "username": "owner1",
        "full_name": "Owner One",
        "avatar": "https://example.com/avatars/owner1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
        "role": "owner"
      },
      "content": "Chào bạn, bạn quan tâm đến phòng nào?",
      "is_system_message": false,
      "is_removed": false,
      "replied_to": null,
      "replied_to_preview": null,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "media": []
    },
    {
      "id": 2,
      "chat_group": 1,
      "sender": {
        "id": 123,
        "username": "renter1",
        "full_name": "Renter One",
        "avatar": "https://example.com/avatars/renter1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
        "role": "renter"
      },
      "content": "Tôi quan tâm đến Phòng 101",
      "is_system_message": false,
      "is_removed": false,
      "replied_to": 1,
      "replied_to_preview": {
        "id": 1,
        "sender": {
          "id": 456,
          "username": "owner1",
          "full_name": "Owner One",
          "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
          "role": "owner"
        },
        "content": "Chào bạn, bạn quan tâm đến phòng nào?",
        "created_at": "2023-07-15T10:30:00Z"
      },
      "created_at": "2023-07-15T10:35:00Z",
      "updated_at": "2023-07-15T10:35:00Z",
      "media": []
    }
    // ... more messages
  ]
}
```

### Gửi tin nhắn

```
POST /api/chats/{id}/send-message/
```

Gửi một tin nhắn mới đến nhóm chat.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
content: Phòng này có wifi không ạ?
replied_to: 2  // Optional - ID của tin nhắn đang trả lời
medias: [file1, file2, ...]  // Optional - Files hình ảnh/video
```

**Response (201 Created)**:

```json
{
  "id": 3,
  "chat_group": 1,
  "sender": {
    "id": 123,
    "username": "renter1",
    "full_name": "Renter One",
    "avatar": "https://example.com/avatars/renter1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
    "role": "renter"
  },
  "content": "Phòng này có wifi không ạ?",
  "is_system_message": false,
  "is_removed": false,
  "replied_to": 2,
  "replied_to_preview": {
    "id": 2,
    "sender": {
      "id": 123,
      "username": "renter1",
      "full_name": "Renter One",
      "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
      "role": "renter"
    },
    "content": "Tôi quan tâm đến Phòng 101",
    "created_at": "2023-07-15T10:35:00Z"
  },
  "created_at": "2023-07-15T10:40:00Z",
  "updated_at": "2023-07-15T10:40:00Z",
  "media": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/example/image1.jpg",
      "thumbnail": "https://res.cloudinary.com/example/c_fill,h_150,w_150/image1.jpg",
      "media_type": "image"
    }
  ]
}
```

**Response (403 Forbidden)** - Khi không phải là thành viên của chat:

```json
{
  "error": "Bạn không phải là thành viên của nhóm chat này"
}
```
