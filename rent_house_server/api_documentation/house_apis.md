# House APIs

## Lấy danh sách nhà/căn hộ

```
GET /api/houses/
```

**Query Parameters**:

- `search`: Tìm kiếm theo từ khóa (tên, mô tả, địa chỉ)
- `lat`, `lon`: Tìm các nhà gần tọa độ này nhất (sẽ trả về trường distance trong km)
- `type`: Lọc theo loại nhà (house, apartment, dormitory, room)
- `is_verified`: Lọc nhà đã được xác thực (true/false)
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `is_renting`: Còn cho thuê không (true/false)
- `is_blank`: Tìm nhà còn phòng trống (true/false)
- `sort_by`: Sắp xếp (price_asc, price_desc, date_asc, date_desc, rating_desc)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 50,
  "next": "http://example.com/api/houses/?page=2",
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
      "avg_rating": 4.5,
      "area": 100,
      "deposit": 10000000,
      "is_renting": true,
      "is_verified": true,
      "distance": 1.5  // Chỉ trả về khi có tham số lat và lon, đơn vị km
    },
    {
      "id": 2,
      "owner": {
        "id": 6,
        "username": "owner2",
        "full_name": "Owner Two",
        "avatar": "https://example.com/avatars/owner2.jpg",
        "avatar_thumbnail": "https://example.com/avatars/owner2_thumb.jpg",
        "role": "owner"
      },
      "title": "Phòng trọ quận Bình Thạnh",
      "address": "45 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
      "latitude": 10.8012,
      "longitude": 106.7192,
      "created_at": "2023-07-20T15:45:00Z",
      "updated_at": "2023-07-20T15:45:00Z",
      "base_price": 2800000,
      "type": "room",
      "thumbnail": "https://example.com/thumbnails/room2.jpg",
      "max_rooms": 10,
      "current_rooms": 8,
      "max_people": 20,
      "avg_rating": 4.2,
      "area": 25,
      "deposit": 5000000,
      "is_renting": true,
      "is_verified": true,
      "distance": 3.2  // Chỉ trả về khi có tham số lat và lon, đơn vị km
    }
    // ... more houses
  ]
}
```

**Ví dụ Request**:

```
GET /api/houses/?search=quận 1&min_price=3000000&max_price=6000000&type=house&is_verified=true&sort_by=price_asc
```

Tìm kiếm nhà riêng đã xác thực tại quận 1 với giá từ 3-6 triệu, sắp xếp theo giá tăng dần.

```
GET /api/houses/?lat=10.7731&lon=106.7030&is_renting=true&is_blank=true
```

Tìm kiếm nhà còn cho thuê và còn phòng trống gần tọa độ đã cho, sắp xếp theo khoảng cách tăng dần.

---

## Tìm kiếm nhà/căn hộ theo bán kính trên bản đồ

```
GET /api/houses/search_by_map/
```

API này cho phép tìm kiếm nhà trong phạm vi bán kính từ tọa độ trung tâm.

**Query Parameters**:

- `lat`: Vĩ độ tọa độ trung tâm (bắt buộc)
- `lon`: Kinh độ tọa độ trung tâm (bắt buộc)
- `radius`: Bán kính tìm kiếm (đơn vị km, mặc định: 5km)
- Có thể sử dụng các tham số lọc của API `/api/houses/` như `type`, `min_price`, `max_price`, `is_verified`, ...

**Response (200 OK)**:

```json
{
  "count": 15,
  "next": "http://example.com/api/houses/search_by_map/?page=2&lat=10.7731&lon=106.7030&radius=3",
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
      "avg_rating": 4.5,
      "area": 100,
      "deposit": 10000000,
      "is_renting": true,
      "is_verified": true,
      "distance": 0.5  // Khoảng cách từ tọa độ tìm kiếm, đơn vị km
    }
    // ... more houses
  ]
}
```

**Ví dụ Request**:

```
GET /api/houses/search_by_map/?lat=10.7731&lon=106.7030&radius=2&type=apartment&min_price=3000000&max_price=8000000
```

Tìm kiếm các căn hộ trong bán kính 2km từ tọa độ đã cho với giá từ 3-8 triệu.

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
