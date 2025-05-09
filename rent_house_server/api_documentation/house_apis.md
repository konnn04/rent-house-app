# House APIs

## Danh sách nhà/căn hộ

```
GET /api/houses/
```

Lấy danh sách nhà/căn hộ với các tùy chọn lọc.

**Query Parameters**:

- `search`: Tìm kiếm theo từ khóa (tên, địa chỉ)
- `type`: Lọc theo loại nhà (house, apartment, dormitory, room)
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `area`: Lọc theo khu vực
- `has_rooms`: true/false - Chỉ hiển thị nhà có phòng trống
- `ordering`: Sắp xếp (created_at, -created_at, base_price, -base_price)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 50,
  "next": "https://api.example.com/api/houses/?page=2",
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
      "thumbnail": "https://example.com/thumbnails/house1.jpg"
    },
    // ... more houses
  ]
}
```

## Chi tiết nhà/căn hộ

```
GET /api/houses/{id}/
```

Lấy thông tin chi tiết của một nhà/căn hộ.

**Response (200 OK)**:

```json
{
  "id": 1,
  "title": "Nhà riêng quận 1",
  "description": "Nhà riêng 3 tầng tại trung tâm quận 1",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "rooms": [
    {
      "id": 1,
      "house": 1,
      "house_title": "Nhà riêng quận 1",
      "title": "Phòng 101",
      "price": 3000000,
      "area": 25.5,
      "bedrooms": 1,
      "bathrooms": 1,
      "max_people": 2,
      "cur_people": 1,
      "is_available": true,
      "thumbnail": "https://example.com/thumbnails/room101.jpg"
    },
    // ... more rooms
  ],
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
    },
    // ... more media
  ],
  "room_count": 5,
  "available_rooms": 2,
  "avg_rating": 4.5
}
```

## Tạo nhà/căn hộ mới

```
POST /api/houses/
```

Tạo mới một nhà/căn hộ (yêu cầu người dùng có role owner).

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
type: house
base_price: 5000000
water_price: 10000
electricity_price: 3500
internet_price: 200000
trash_price: 50000
images: [file1, file2, ...]  // Files hình ảnh
```

**Response (201 Created)**:

```json
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
  "thumbnail": "https://example.com/thumbnails/house1.jpg"
}
```

## Thêm hình ảnh cho nhà/căn hộ

```
POST /api/houses/{id}/add_image/
```

Thêm hình ảnh cho nhà/căn hộ.

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

## Xóa hình ảnh của nhà/căn hộ

```
DELETE /api/houses/{id}/remove_image/
```

Xóa một hình ảnh của nhà/căn hộ.

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

## Danh sách nhà của tôi

```
GET /api/houses/my_houses/
```

Lấy danh sách nhà/căn hộ của người dùng hiện tại (role owner).

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
      "thumbnail": "https://example.com/thumbnails/house1.jpg"
    },
    // ... more houses
  ]
}
```

## Cập nhật nhà/căn hộ

```
PATCH /api/houses/{id}/
```

Cập nhật thông tin của một nhà/căn hộ.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
title: Nhà riêng quận 1 (Đã cập nhật)
description: Mô tả mới
base_price: 5500000
// Các trường khác tùy theo nhu cầu cập nhật
```

**Response (200 OK)**:

```json
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
  "title": "Nhà riêng quận 1 (Đã cập nhật)",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-16T08:45:00Z",
  "base_price": 5500000,
  "type": "house",
  "thumbnail": "https://example.com/thumbnails/house1.jpg"
}
```

## Xóa nhà/căn hộ

```
DELETE /api/houses/{id}/
```

Xóa một nhà/căn hộ (yêu cầu người dùng là chủ sở hữu).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.

## Tìm kiếm nhà/căn hộ theo khu vực

```
GET /api/houses/by_location/?lat=10.7731&lng=106.7030&radius=5
```

Tìm kiếm nhà/căn hộ trong một bán kính cụ thể từ một điểm.

**Query Parameters**:

- `lat`: Vĩ độ
- `lng`: Kinh độ
- `radius`: Bán kính tìm kiếm (km)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    // ... danh sách nhà/căn hộ trong khu vực
  ]
}
```
