# Post APIs

## Danh sách bài đăng

```
GET /api/posts/
```

Lấy danh sách bài đăng với các tùy chọn lọc.

**Query Parameters**:

- `search`: Tìm kiếm theo từ khóa (tiêu đề, nội dung, địa chỉ)
- `ordering`: Sắp xếp (created_at, -created_at)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 30,
  "next": "https://api.example.com/api/posts/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "author": {
        "id": 5,
        "username": "user1",
        "full_name": "User One",
        "avatar": "https://example.com/avatars/user1.jpg",
        "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
        "role": "owner"
      },
      "type": "rental_listing",
      "title": "Cho thuê phòng quận 1",
      "content": "Phòng rộng rãi, đầy đủ tiện nghi...",
      "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "latitude": 10.7731,
      "longitude": 106.7030,
      "created_at": "2023-07-15T10:30:00Z",
      "updated_at": "2023-07-15T10:30:00Z",
      "house_link": 1,
      "interaction_count": 10,
      "interaction": null,
      "is_followed_owner": false,
      "comment_count": 5,
      "media": [
        {
          "id": 1,
          "url": "https://example.com/images/post1_1.jpg",
          "thumbnail": "https://example.com/thumbnails/post1_1.jpg",
          "medium": "https://example.com/medium/post1_1.jpg",
          "type": "image"
        }
        // ... more media
      ],
      "is_active": true
    },
    // ... more posts
  ]
}
```

## Chi tiết bài đăng

```
GET /api/posts/{id}/
```

Lấy thông tin chi tiết của một bài đăng.

**Response (200 OK)**:

```json
{
  "id": 1,
  "author": {
    "id": 5,
    "username": "user1",
    "full_name": "User One",
    "avatar": "https://example.com/avatars/user1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "owner"
  },
  "type": "rental_listing",
  "title": "Cho thuê phòng quận 1",
  "content": "Phòng rộng rãi, đầy đủ tiện nghi...",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "house_link": 1,
  "house_details": {
    "id": 1,
    "title": "Nhà riêng quận 1",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "type": "house",
    "thumbnail": "https://example.com/thumbnails/house1.jpg",
    "base_price": 5000000
  },
  "comments": [
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
      "reply_count": 1,
      "media": []
    },
    // ... more comments
  ],
  "interaction_count": 10,
  "interaction": {
    "id": 5,
    "type": "like",
    "created_at": "2023-07-15T12:30:00Z",
    "updated_at": "2023-07-15T12:30:00Z"
  },
  "is_followed_owner": true,
  "comment_count": 5,
  "media": [
    {
      "id": 1,
      "url": "https://example.com/images/post1_1.jpg",
      "thumbnail": "https://example.com/thumbnails/post1_1.jpg",
      "medium": "https://example.com/medium/post1_1.jpg",
      "type": "image"
    }
    // ... more media
  ],
  "is_active": true
}
```

## Tạo bài đăng mới

```
POST /api/posts/
```

Tạo mới một bài đăng.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
type: rental_listing
title: Cho thuê phòng quận 1
content: Phòng rộng rãi, đầy đủ tiện nghi...
address: 123 Nguyễn Huệ, Quận 1, TP.HCM
latitude: 10.7731
longitude: 106.7030
house_link: 1  // ID của nhà/căn hộ (nếu có)
images: [file1, file2, ...]  // Files hình ảnh
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "author": {
    "id": 5,
    "username": "user1",
    "full_name": "User One",
    "avatar": "https://example.com/avatars/user1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "owner"
  },
  "type": "rental_listing",
  "title": "Cho thuê phòng quận 1",
  "content": "Phòng rộng rãi, đầy đủ tiện nghi...",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z",
  "house_link": 1,
  "interaction_count": 0,
  "interaction": null,
  "is_followed_owner": false,
  "comment_count": 0,
  "media": [],
  "is_active": true
}
```

## Thêm hình ảnh cho bài đăng

```
POST /api/posts/{id}/add_image/
```

Thêm hình ảnh cho bài đăng.

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
      "url": "https://example.com/images/post1_5.jpg",
      "thumbnail": "https://example.com/thumbnails/post1_5.jpg"
    },
    {
      "id": 6,
      "url": "https://example.com/images/post1_6.jpg",
      "thumbnail": "https://example.com/thumbnails/post1_6.jpg"
    }
  ]
}
```

## Xóa hình ảnh của bài đăng

```
DELETE /api/posts/{id}/remove_image/
```

Xóa một hình ảnh của bài đăng.

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

## Tương tác với bài đăng (like/dislike)

```
POST /api/posts/{id}/toggle_interaction/
```

Thêm/xóa tương tác với bài đăng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "type": "like"  // "like" hoặc "dislike"
}
```

**Response (200 OK)**:

```json
{
  "status": "success",
  "is_interacted": true,
  "type": "like"
}
```

## Bài đăng của tôi

```
GET /api/posts/my_posts/
```

Lấy danh sách bài đăng của người dùng hiện tại.

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
    // ... bài đăng của người dùng
  ]
}
```

## Lọc bài đăng theo loại

```
GET /api/posts/by_type/?type=rental_listing
```

Lấy danh sách bài đăng theo loại (rental_listing, search_listing, roommate).

**Query Parameters**:

- `type`: Loại bài đăng (rental_listing, search_listing, roommate)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 20,
  "next": "https://api.example.com/api/posts/by_type/?type=rental_listing&page=2",
  "previous": null,
  "results": [
    // ... bài đăng theo loại
  ]
}
```

## Lọc bài đăng theo vị trí

```
GET /api/posts/by_location/?lat=10.7731&lng=106.7030&radius=5
```

Lấy danh sách bài đăng gần một vị trí.

**Query Parameters**:

- `lat`: Vĩ độ
- `lng`: Kinh độ
- `radius`: Bán kính tìm kiếm (km)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 15,
  "next": "https://api.example.com/api/posts/by_location/?lat=10.7731&lng=106.7030&radius=5&page=2",
  "previous": null,
  "results": [
    // ... bài đăng gần vị trí
  ]
}
```

## Cập nhật bài đăng

```
PATCH /api/posts/{id}/
```

Cập nhật thông tin của một bài đăng.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
title: Cho thuê phòng quận 1 (Đã cập nhật)
content: Nội dung mới
// Các trường khác tùy theo nhu cầu cập nhật
```

**Response (200 OK)**:

```json
{
  "id": 1,
  // ... thông tin bài đăng đã cập nhật
}
```

## Xóa bài đăng

```
DELETE /api/posts/{id}/
```

Xóa một bài đăng (yêu cầu người dùng là tác giả hoặc admin).

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.

## Lấy feed bài đăng mới

```
GET /api/new-feed/
```

Lấy feed các bài đăng mới nhất.

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
  "count": 50,
  "next": "https://api.example.com/api/new-feed/?page=2",
  "previous": null,
  "results": [
    // ... danh sách bài đăng mới nhất
  ]
}
```
