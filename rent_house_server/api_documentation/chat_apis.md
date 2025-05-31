# Chat & Messaging API Documentation

## Overview

The Chat API allows users to:
- Create and manage chat conversations (1:1 or group chats)
- Send and receive text messages and media
- View message history
- Manage group membership

## ChatGroup Endpoints

### List User's Chat Groups

```http
GET /api/chats/
```

Retrieves all chat conversations that the authenticated user is a member of, sorted by most recent activity.

**Authentication:** Required

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
    // Additional chat groups...
  ]
}
```

### Get Chat Details

```http
GET /api/chats/{id}/
```

Retrieves detailed information about a specific chat group, including all members and their statuses.

**Authentication:** Required

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
    },
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
    }
  ]
}
```

### Create Group Chat

```http
POST /api/chats/
```

Creates a new group chat with multiple members.

**Authentication:** Required

**Request Body (multipart/form-data)**:

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

### Create or Get 1-1 Chat

```http
POST /api/chats/create_direct_chat/
```

Creates a 1-1 chat with another user, or retrieves an existing chat.

**Authentication:** Required

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

**Response (404 Not Found)** - When the user does not exist:

```json
{
  "error": "User không tồn tại"
}
```

### Add Member to Chat Group

```http
POST /api/chats/{id}/add_member/
```

Adds a new member to a chat group (requires admin privileges).

**Authentication:** Required

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

**Response (403 Forbidden)** - When lacking permission to add members:

```json
{
  "error": "Không có quyền thêm thành viên"
}
```

### Remove Member from Chat Group

```http
POST /api/chats/{id}/remove_member/
```

Removes a member from a chat group (requires admin privileges).

**Authentication:** Required

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

**Response (403 Forbidden)** - When lacking permission to remove members:

```json
{
  "error": "Không có quyền xóa thành viên"
}
```

### Leave Chat Group

```http
POST /api/chats/{id}/leave_group/
```

Leaves a chat group.

**Authentication:** Required

**Response (200 OK)**:

```json
{
  "status": "success"
}
```

**Response (400 Bad Request)** - When trying to leave a 1-1 chat:

```json
{
  "error": "Không thể rời khỏi chat trực tiếp"
}
```

## Message APIs

### Get Messages of a Chat Group

```http
GET /api/chats/{id}/messages/
```

Retrieves message history for a chat group.

**Authentication:** Required

**Query Parameters**:

- `page`: Page number
- `page_size`: Number of results per page

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

### Send Message

```http
POST /api/chats/{id}/send-message/
```

Sends a new message to a chat group.

**Authentication:** Required

**Request Body (multipart/form-data)**:

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

**Response (403 Forbidden)** - When not a member of the chat:

```json
{
  "error": "Bạn không phải là thành viên của nhóm chat này"
}
```

### Update Message

```http
PATCH /api/messages/{id}/
```

Updates the content of an existing message.

**Authentication:** Required

**Request Body**:

```json
{
  "content": "Đã chỉnh sửa: Phòng này có wifi không ạ?"
}
```

**Response (200 OK)**:

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
  "content": "Đã chỉnh sửa: Phòng này có wifi không ạ?",
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
  "updated_at": "2023-07-15T10:45:00Z",
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

**Response (403 Forbidden)** - When trying to update someone else's message:

```json
{
  "error": "Bạn chỉ có thể cập nhật tin nhắn của mình"
}
```

**Response (400 Bad Request)** - When trying to update a deleted message:

```json
{
  "error": "Tin nhắn này đã bị xóa"
}
```

### Delete Message

```http
DELETE /api/messages/{id}/
```

Deletes (soft delete) a message. The message will be marked as removed and its content will be hidden.

**Authentication:** Required

**Response (204 No Content)** - When message is successfully deleted.

**Response (403 Forbidden)** - When trying to delete someone else's message:

```json
{
  "error": "Bạn chỉ có thể xóa tin nhắn của mình"
}
```

**Response (400 Bad Request)** - When trying to delete a system message:

```json
{
  "error": "Không thể xóa tin nhắn hệ thống"
}
```
