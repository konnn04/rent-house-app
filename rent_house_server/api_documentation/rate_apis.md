# Rate APIs

## Lấy danh sách đánh giá

```
GET /api/rates/
```

Lấy danh sách các đánh giá với các tùy chọn lọc.

**Query Parameters**:

- `house_id`: Lọc theo nhà/căn hộ
- `user_id`: Lọc theo người dùng
- `min_star`: Lọc theo số sao tối thiểu
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 10,
  "next": "https://api.example.com/api/rates/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 123,
        "username": "user1",
        "full_name": "User One",
        "avatar": "https://example.com/avatars/user1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
        "role": "renter"
      },
      "house": 5,
      "star": 4,
      "comment": "Phòng rất sạch sẽ và thoáng mát",
      "created_at": "2023-07-10T15:30:00Z",
      "updated_at": "2023-07-10T15:30:00Z",
      "media": [
        {
          "id": 10,
          "url": "https://example.com/images/rate1_1.jpg",
          "thumbnail": "https://example.com/thumbnails/rate1_1.jpg",
          "type": "image"
        }
      ]
    }
    // ... more ratings
  ]
}
```

## Đánh giá nhà/căn hộ

```
POST /api/rates/
```

Tạo một đánh giá mới cho nhà/căn hộ.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
house: 5
star: 4
comment: Phòng rất sạch sẽ và thoáng mát
images: [file1, file2, ...]  // Optional - Files hình ảnh
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "username": "user1",
    "full_name": "User One",
    "avatar": "https://example.com/avatars/user1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "renter"
  },
  "house": 5,
  "star": 4,
  "comment": "Phòng rất sạch sẽ và thoáng mát",
  "created_at": "2023-07-10T15:30:00Z",
  "updated_at": "2023-07-10T15:30:00Z",
  "media": [
    {
      "id": 10,
      "url": "https://res.cloudinary.com/example/image/upload/v1234567/rating_images/abc123.jpg",
      "thumbnail": "https://res.cloudinary.com/example/image/upload/w_150,h_150,c_fill/v1234567/rating_images/abc123.jpg",
      "type": "image"
    }
  ]
}
```

**Response (400 Bad Request)** - Khi nhà/căn hộ không tồn tại:

```json
{
  "detail": "House không tồn tại"
}
```

## Chi tiết đánh giá

```
GET /api/rates/{id}/
```

Xem chi tiết một đánh giá cụ thể.

**Response (200 OK)**:

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "username": "user1",
    "full_name": "User One",
    "avatar": "https://example.com/avatars/user1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "renter"
  },
  "house": 5,
  "star": 4,
  "comment": "Phòng rất sạch sẽ và thoáng mát",
  "created_at": "2023-07-10T15:30:00Z",
  "updated_at": "2023-07-10T15:30:00Z",
  "media": [
    {
      "id": 10,
      "url": "https://example.com/images/rate1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/rate1_1.jpg",
      "type": "image"
    }
  ]
}
```

## Cập nhật đánh giá

```
PUT /api/rates/{id}/
PATCH /api/rates/{id}/
```

Cập nhật đánh giá (chỉ người tạo đánh giá mới được phép).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "star": 5,
  "comment": "Cập nhật: Phòng rất sạch sẽ, thoáng mát và dịch vụ tuyệt vời"
}
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "username": "user1",
    "full_name": "User One",
    "avatar": "https://example.com/avatars/user1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "renter"
  },
  "house": 5,
  "star": 5,
  "comment": "Cập nhật: Phòng rất sạch sẽ, thoáng mát và dịch vụ tuyệt vời",
  "created_at": "2023-07-10T15:30:00Z",
  "updated_at": "2023-07-10T16:15:00Z",
  "media": [
    {
      "id": 10,
      "url": "https://example.com/images/rate1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/rate1_1.jpg",
      "type": "image"
    }
  ]
}
```

## Xóa đánh giá

```
DELETE /api/rates/{id}/
```

Xóa đánh giá (chỉ người tạo đánh giá hoặc admin mới được phép).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.
