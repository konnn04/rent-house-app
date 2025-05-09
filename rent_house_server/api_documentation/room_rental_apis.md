# Room Rental APIs

## Danh sách thuê phòng

```
GET /api/rentals/
```

Lấy danh sách các hợp đồng thuê phòng của người dùng hiện tại. Đối với chủ nhà (owner), API sẽ trả về tất cả các hợp đồng của các phòng thuộc sở hữu. Đối với người thuê (renter), chỉ trả về các hợp đồng của họ.

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
  "count": 10,
  "next": "https://api.example.com/api/rentals/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 123,
      "room": 456,
      "start_date": "2023-08-01",
      "end_date": null,
      "is_active": true,
      "price_agreed": 3000000,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "user_detail": {
        "id": 123,
        "username": "renter1",
        "full_name": "Renter One",
        "avatar": "https://example.com/avatars/renter1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
        "role": "renter"
      },
      "room_detail": {
        "id": 456,
        "house": 789,
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
      }
    }
    // ... more rental contracts
  ]
}
```

## Chi tiết thuê phòng

```
GET /api/rentals/{id}/
```

Lấy thông tin chi tiết của một hợp đồng thuê phòng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "user": 123,
  "room": 456,
  "start_date": "2023-08-01",
  "end_date": null,
  "is_active": true,
  "price_agreed": 3000000,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "user_detail": {
    "id": 123,
    "username": "renter1",
    "full_name": "Renter One",
    "avatar": "https://example.com/avatars/renter1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
    "role": "renter"
  },
  "room_detail": {
    "id": 456,
    "house": 789,
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
  }
}
```

## Tạo hợp đồng thuê phòng

```
POST /api/rentals/
```

Tạo mới một hợp đồng thuê phòng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "room": 456,
  "start_date": "2023-08-01",
  "price_agreed": 3000000
}
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "user": 123,
  "room": 456,
  "start_date": "2023-08-01",
  "end_date": null,
  "is_active": true,
  "price_agreed": 3000000,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "user_detail": {
    "id": 123,
    "username": "renter1",
    "full_name": "Renter One",
    "avatar": "https://example.com/avatars/renter1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/renter1_thumb.jpg",
    "role": "renter"
  },
  "room_detail": {
    "id": 456,
    "house": 789,
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
  }
}
```

**Response (400 Bad Request)** - Khi phòng đã đầy:

```json
{
  "error": "Phòng đã đầy"
}
```

## Kết thúc hợp đồng thuê phòng

```
POST /api/rentals/{id}/end_rental/
```

Kết thúc một hợp đồng thuê phòng (người thuê hoặc chủ nhà đều có thể thực hiện).

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

**Response (403 Forbidden)** - Khi không có quyền kết thúc hợp đồng:

```json
{
  "error": "Không có quyền kết thúc hợp đồng"
}
```
