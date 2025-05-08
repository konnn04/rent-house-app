# Comment APIs

## Danh sách bình luận của bài đăng

```
GET /api/comments/post_comments/?post_id=1
```

Lấy danh sách bình luận gốc (không có parent) của một bài đăng.

**Query Parameters**:

- `post_id`: ID của bài đăng
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "post": 1,
      "author": {
        "id": 6,
        "username": "user2",
        "full_name": "User Two",
        "avatar": "https://example.com/avatars/user2.jpg",
        "avatar_thumbnail": "https://example.com/avatars/user2_thumb.jpg",
        "role": "renter"
      },
      "parent": null,
      "content": "Xin hỏi còn phòng không ạ?",
      "created_at": "2023-07-15T11:30:00Z",
      "updated_at": "2023-07-15T11:30:00Z",
      "reply_count": 2,
      "media": []
    },
    // ... more comments
  ]
}
```

## Lấy các phản hồi của bình luận

```
GET /api/comments/post_comments/?post_id=1&parent_id=1
```

Lấy danh sách phản hồi cho một bình luận cụ thể.

**Query Parameters**:

- `post_id`: ID của bài đăng
- `parent_id`: ID của bình luận gốc
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "post": 1,
      "author": {
        "id": 5,
        "username": "user1",
        "full_name": "User One",
        "avatar": "https://example.com/avatars/user1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
        "role": "owner"
      },
      "parent": 1,
      "content": "Vâng, phòng vẫn còn bạn nhé.",
      "created_at": "2023-07-15T11:35:00Z",
      "updated_at": "2023-07-15T11:35:00Z",
      "reply_count": 0,
      "media": []
    },
    // ... more replies
  ]
}
```

## Tạo bình luận mới

```
POST /api/comments/
```

Thêm bình luận mới cho bài đăng.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
post: 1
content: Xin hỏi giá phòng có thể thương lượng không?
parent: 1  // Optional - ID của bình luận gốc nếu đây là phản hồi
images: [file1, file2, ...]  // Optional - Files hình ảnh
```

**Response (201 Created)**:

```json
{
  "id": 3,
  "post": 1,
  "author": {
    "id": 7,
    "username": "user3",
    "full_name": "User Three",
    "avatar": "https://example.com/avatars/user3.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user3_thumb.jpg",
    "role": "renter"
  },
  "parent": 1,
  "content": "Xin hỏi giá phòng có thể thương lượng không?",
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T12:00:00Z",
  "reply_count": 0,
  "media": []
}
```

## Thêm hình ảnh cho bình luận

```
POST /api/comments/{id}/add_image/
```

Thêm hình ảnh cho bình luận.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
images: [file1, file2, ...]  // Files hình ảnh
```

**Response (200 OK)**:

```json
{
  "status": "success",
  "message": "Added 2 images",
  "media": [
    {
      "id": 5,
      "url": "https://example.com/images/comment1_5.jpg",
      "thumbnail": "https://example.com/thumbnails/comment1_5.jpg"
    },
    {
      "id": 6,
      "url": "https://example.com/images/comment1_6.jpg",
      "thumbnail": "https://example.com/thumbnails/comment1_6.jpg"
    }
  ]
}
```

## Xóa hình ảnh của bình luận

```
DELETE /api/comments/{id}/remove_image/
```

Xóa một hình ảnh của bình luận.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "media_id": 5
}
```

**Response (200 OK)**:

```json
{
  "status": "success",
  "message": "Image removed"
}
```

## Cập nhật bình luận

```
PATCH /api/comments/{id}/
```

Cập nhật nội dung của một bình luận.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "content": "Nội dung bình luận đã cập nhật"
}
```

**Response (200 OK)**:

```json
{
  "id": 3,
  "post": 1,
  "author": {
    "id": 7,
    "username": "user3",
    "full_name": "User Three",
    "avatar": "https://example.com/avatars/user3.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user3_thumb.jpg",
    "role": "renter"
  },
  "parent": 1,
  "content": "Nội dung bình luận đã cập nhật",
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T12:10:00Z",
  "reply_count": 0,
  "media": []
}
```

## Xóa bình luận

```
DELETE /api/comments/{id}/
```

Xóa một bình luận (yêu cầu người dùng là tác giả hoặc admin).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.
