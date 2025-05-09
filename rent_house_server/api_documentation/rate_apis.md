# Rate APIs

## Danh sách đánh giá

```
GET /api/rates/
```

Lấy danh sách đánh giá với các tùy chọn lọc.

**Query Parameters**:

- `house_id`: Lọc theo nhà/căn hộ
- `user_id`: Lọc theo người dùng đánh giá
- `min_star`: Lọc theo số sao tối thiểu
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
      "user": {
        "id": 123,
        "username": "renter1",
        "full_name": "Renter One",
        "avatar": "https://example.com/avatars/renter1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
        "role": "renter"
      },
      "house": 1,
      "star": 4.5,
      "comment": "Phòng rất tốt, chủ nhà thân thiện, vị trí thuận tiện.",
      "created_at": "2023-07-15T14:30:00Z",
      "updated_at": "2023-07-15T14:30:00Z",
      "media": [
        {
          "id": 1,
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

## Chi tiết đánh giá

```
GET /api/rates/{id}/
```

Lấy thông tin chi tiết của một đánh giá.

**Response (200 OK)**:

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "username": "renter1",
    "full_name": "Renter One",
    "avatar": "https://example.com/avatars/renter1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
    "role": "renter"
  },
  "house": 1,
  "star": 4.5,
  "comment": "Phòng rất tốt, chủ nhà thân thiện, vị trí thuận tiện.",
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-15T14:30:00Z",
  "media": [
    {
      "id": 1,
      "url": "https://example.com/images/rate1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/rate1_1.jpg",
      "type": "image"
    }
  ]
}
```

## Tạo đánh giá mới

```
POST /api/rates/
```

Tạo một đánh giá mới cho một nhà/căn hộ.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
house: 1
star: 4.5
comment: Phòng rất tốt, chủ nhà thân thiện, vị trí thuận tiện.
images: [file1, file2, ...]  // Optional - Files hình ảnh
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "username": "renter1",
    "full_name": "Renter One",
    "avatar": "https://example.com/avatars/renter1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
    "role": "renter"
  },
  "house": 1,
  "star": 4.5,
  "comment": "Phòng rất tốt, chủ nhà thân thiện, vị trí thuận tiện.",
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-15T14:30:00Z",
  "media": [
    {
      "id": 1,
      "url": "https://example.com/images/rate1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/rate1_1.jpg",
      "type": "image"
    }
  ]
}
```

## Cập nhật đánh giá

```
PATCH /api/rates/{id}/
```

Cập nhật thông tin đánh giá.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "star": 5.0,
  "comment": "Đã cập nhật đánh giá: phòng rất tuyệt vời!"
}
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "user": {
    "id": 123,
    "username": "renter1",
    "full_name": "Renter One",
    "avatar": "https://example.com/avatars/renter1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
    "role": "renter"
  },
  "house": 1,
  "star": 5.0,
  "comment": "Đã cập nhật đánh giá: phòng rất tuyệt vời!",
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-15T15:00:00Z",
  "media": [
    {
      "id": 1,
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

Xóa một đánh giá.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.
