# House APIs

## Lấy danh sách nhà/căn hộ

```
GET /api/houses/
```

**Query Parameters**:

- `search`: Tìm kiếm theo từ khóa (tên, địa chỉ)
- `type`: Lọc theo loại nhà (house, apartment, dormitory, room)
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `area`: Lọc theo khu vực
- `ordering`: Sắp xếp (created_at, -created_at, base_price, -base_price)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 50,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "owner": {
        "id": 5,
        "username": "owner1",
        "full_name": "Owner One",
        "avatar": "https://example.com/avatars/owner1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
        "role": "owner"
      },
      "title": "Nhà riêng quận 1",
      "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "latitude": 10.7731,
      "longitude": 106.7030,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "base_price": 5000000,
      "type": "house",
      "thumbnail": "https://example.com/thumbnails/house1.jpg",
      "max_rooms": null,
      "current_rooms": null,
      "max_people": null,
      "avg_rating": 4.5
    }
    // ... more houses
  ]
}
```

---

## Tạo nhà/căn hộ mới

```
POST /api/houses/
```

Tạo mới một nhà/căn hộ (chỉ chủ nhà - owner).

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
title: Nhà riêng quận 1
description: Nhà riêng 3 tầng tại trung tâm quận 1
address: 123 Nguyễn Huệ, Quận 1, TP.HCM
latitude: 10.7731
longitude: 106.7030
base_price: 5000000
water_price: 10000
electricity_price: 3500
internet_price: 200000
trash_price: 50000
type: house  // house, apartment, dormitory, room
max_rooms: 10         // Chỉ bắt buộc nếu type=room
max_people: 20        // Chỉ bắt buộc nếu type=room
images: [file1, file2, ...]  // Files hình ảnh (tùy chọn)
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "title": "Nhà riêng quận 1",
  "description": "Nhà riêng 3 tầng tại trung tâm quận 1",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "base_price": 5000000,
  "water_price": 10000,
  "electricity_price": 3500,
  "internet_price": 200000,
  "trash_price": 50000,
  "is_verified": false,
  "owner": {
    "id": 5,
    "username": "owner1",
    "full_name": "Owner One",
    "avatar": "https://example.com/avatars/owner1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
    "role": "owner"
  },
  "type": "house",
  "media": [
    {
      "id": 1,
      "url": "https://example.com/images/house1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/house1_1.jpg",
      "medium": "https://example.com/medium/house1_1.jpg",
      "type": "image",
      "purpose": "gallery"
    }
    // ... more media
  ],
  "max_rooms": null,
  "current_rooms": null,
  "max_people": null,
  "avg_rating": 0
}
```

---

## Lấy chi tiết nhà/căn hộ

```
GET /api/houses/{id}/
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "title": "Nhà riêng quận 1",
  "description": "Nhà riêng 3 tầng tại trung tâm quận 1",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "base_price": 5000000,
  "water_price": 10000,
  "electricity_price": 3500,
  "internet_price": 200000,
  "trash_price": 50000,
  "is_verified": true,
  "owner": {
    "id": 5,
    "username": "owner1",
    "full_name": "Owner One",
    "avatar": "https://example.com/avatars/owner1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
    "role": "owner"
  },
  "type": "house",
  "media": [
    {
      "id": 1,
      "url": "https://example.com/images/house1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/house1_1.jpg",
      "medium": "https://example.com/medium/house1_1.jpg",
      "type": "image",
      "purpose": "gallery"
    }
    // ... more media
  ],
  "max_rooms": null,
  "current_rooms": null,
  "max_people": null,
  "avg_rating": 4.5
}
```

---

## Sửa thông tin nhà/căn hộ

```
PATCH /api/houses/{id}/
```

Chỉ chủ sở hữu mới được sửa.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body** (chỉ gửi các trường cần sửa):

```
title: Nhà riêng quận 1 (Đã cập nhật)
description: Mô tả mới
base_price: 5500000
// Các trường khác tùy theo nhu cầu cập nhật
```

**Response (200 OK)**:

```json
{
  "title": "Nhà riêng quận 1 (Đã cập nhật)",
  "description": "Mô tả mới",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "base_price": 5500000,
  "water_price": 10000,
  "electricity_price": 3500,
  "internet_price": 200000,
  "trash_price": 50000,
  "type": "house",
  "max_rooms": null,
  "current_rooms": null,
  "max_people": null
}
```

---

## Xóa nhà/căn hộ

```
DELETE /api/houses/{id}/
```

Chỉ chủ sở hữu mới được xóa.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.

---

## Thêm hình ảnh cho nhà/căn hộ

```
POST /api/houses/{id}/add_image/
```

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
  "message": "Đã thêm 2 ảnh",
  "media": [
    {
      "id": 5,
      "url": "https://example.com/images/house1_5.jpg",
      "thumbnail": "https://example.com/thumbnails/house1_5.jpg"
    },
    {
      "id": 6,
      "url": "https://example.com/images/house1_6.jpg",
      "thumbnail": "https://example.com/thumbnails/house1_6.jpg"
    }
  ]
}
```

---

## Xóa hình ảnh của nhà/căn hộ

```
DELETE /api/houses/{id}/remove_image/
```

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
  "message": "Đã xóa ảnh"
}
```

---

## Lấy danh sách nhà của tôi

```
GET /api/houses/my_houses/
```

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "owner": {
        "id": 5,
        "username": "owner1",
        "full_name": "Owner One",
        "avatar": "https://example.com/avatars/owner1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
        "role": "owner"
      },
      "title": "Nhà riêng quận 1",
      "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "latitude": 10.7731,
      "longitude": 106.7030,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "base_price": 5000000,
      "type": "house",
      "thumbnail": "https://example.com/thumbnails/house1.jpg",
      "max_rooms": null,
      "current_rooms": null,
      "max_people": null,
      "avg_rating": 4.5
    }
    // ... more houses
  ]
}
```
