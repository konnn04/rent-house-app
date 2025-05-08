# Room APIs

## Danh sách phòng

```
GET /api/rooms/
```

Lấy danh sách phòng với các tùy chọn lọc.

**Query Parameters**:

- `house_id`: Lọc theo nhà/căn hộ
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `available`: true/false - Chỉ hiển thị phòng còn chỗ trống
- `max_people`: Số người tối đa
- `min_area`: Diện tích tối thiểu
- `search`: Tìm kiếm theo từ khóa
- `ordering`: Sắp xếp (price, -price, area, -area, created_at, -created_at)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 20,
  "next": "https://api.example.com/api/rooms/?page=2",
  "previous": null,
  "results": [
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
  ]
}
```

## Chi tiết phòng

```
GET /api/rooms/{id}/
```

Lấy thông tin chi tiết của một phòng.

**Response (200 OK)**:

```json
{
  "id": 1,
  "house": 1,
  "house_title": "Nhà riêng quận 1",
  "house_address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "title": "Phòng 101",
  "description": "Phòng rộng rãi, có ban công, hướng đông nam",
  "price": 3000000,
  "area": 25.5,
  "bedrooms": 1,
  "bathrooms": 1,
  "max_people": 2,
  "cur_people": 1,
  "is_available": true,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "media": [
    {
      "id": 1,
      "url": "https://example.com/images/room1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/room1_1.jpg",
      "medium": "https://example.com/medium/room1_1.jpg",
      "type": "image"
    },
    // ... more media
  ]
}
```

## Tạo phòng mới

```
POST /api/rooms/
```

Tạo mới một phòng trong nhà/căn hộ (yêu cầu người dùng là chủ sở hữu của nhà/căn hộ).

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
house: 1
title: Phòng 101
description: Phòng rộng rãi, có ban công, hướng đông nam
price: 3000000
area: 25.5
bedrooms: 1
bathrooms: 1
max_people: 2
images: [file1, file2, ...]  // Files hình ảnh
```

**Response (201 Created)**:

```json
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
  "cur_people": 0,
  "is_available": true,
  "thumbnail": null
}
```

## Thêm hình ảnh cho phòng

```
POST /api/rooms/{id}/add_image/
```

Thêm hình ảnh cho phòng.

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
      "url": "https://example.com/images/room1_5.jpg",
      "thumbnail": "https://example.com/thumbnails/room1_5.jpg"
    },
    {
      "id": 6,
      "url": "https://example.com/images/room1_6.jpg",
      "thumbnail": "https://example.com/thumbnails/room1_6.jpg"
    }
  ]
}
```

## Xóa hình ảnh của phòng

```
DELETE /api/rooms/{id}/remove_image/
```

Xóa một hình ảnh của phòng.

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

## Cập nhật phòng

```
PATCH /api/rooms/{id}/
```

Cập nhật thông tin của một phòng.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
title: Phòng 101 (Đã cập nhật)
description: Mô tả mới
price: 3200000
// Các trường khác tùy theo nhu cầu cập nhật
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "house": 1,
  "house_title": "Nhà riêng quận 1",
  "title": "Phòng 101 (Đã cập nhật)",
  "price": 3200000,
  "area": 25.5,
  "bedrooms": 1,
  "bathrooms": 1,
  "max_people": 2,
  "cur_people": 1,
  "is_available": true,
  "thumbnail": "https://example.com/thumbnails/room101.jpg"
}
```

## Xóa phòng

```
DELETE /api/rooms/{id}/
```

Xóa một phòng (yêu cầu người dùng là chủ sở hữu của nhà/căn hộ).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.

## Danh sách phòng theo nhà/căn hộ

```
GET /api/houses/{id}/rooms/
```

Lấy danh sách phòng của một nhà/căn hộ cụ thể.

**Query Parameters**:

- `available_only`: true/false - Chỉ hiển thị phòng còn chỗ trống

**Response (200 OK)**:

```json
[
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
]
```
