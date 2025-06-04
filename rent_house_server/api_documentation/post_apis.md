# Post APIs

## Danh sách bài đăng

```
GET /api/posts/
```

Lấy danh sách bài đăng với các tùy chọn lọc.

**Query Parameters**:

- `search`: Tìm kiếm theo từ khóa (tên, nội dung, địa chỉ)
- `author_username`: Lọc theo username của tác giả
- `type`: Lọc theo loại bài đăng (general, rental_listing, search_listing, roommate)
- `ordering`: Sắp xếp (created_at, -created_at)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 50,
  "next": "https://api.example.com/api/posts/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "author": {
        "id": 123,
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
      ],
      "is_active": true,
      "like_count": 10,
      "dislike_count": 2
    }
    // ... more posts
  ]
}
```

## Tạo bài đăng mới

```
POST /api/posts/
```

Tạo bài đăng mới.

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
house_link: 1  // ID của nhà/căn hộ (tùy chọn)
images: [file1, file2, ...]  // Files hình ảnh (tùy chọn)
```

**Response (201 Created)**:

```json
{
  "id": 1,
  "author": {
    "id": 123,
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
  "interaction": null,
  "is_followed_owner": false,
  "comment_count": 0,
  "media": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/example/image/upload/v1234567/post_images/abc123.jpg",
      "thumbnail": "https://res.cloudinary.com/example/image/upload/w_150,h_150,c_fill/v1234567/post_images/abc123.jpg",
      "medium": "https://res.cloudinary.com/example/image/upload/w_500,c_scale/v1234567/post_images/abc123.jpg",
      "type": "image"
    }
  ],
  "is_active": true,
  "like_count": 0,
  "dislike_count": 0
}
```

## Chi tiết bài đăng

```
GET /api/posts/{id}/
```

Lấy thông tin chi tiết về một bài đăng.

**Response (200 OK)**:

```json
{
  "id": 1,
  "author": {
    "id": 123,
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
        "id": 124,
        "username": "user2",
        "full_name": "User Two",
        "avatar": "https://example.com/avatars/user2.jpg",
        "avatar_thumbnail": "https://example.com/avatars/user2_thumb.jpg",
        "role": "renter"
      },
      "parent": null,
      "content": "Còn phòng không ạ?",
      "created_at": "2023-07-15T11:30:00Z",
      "updated_at": "2023-07-15T11:30:00Z",
      "reply_count": 1,
      "media": []
    }
  ],
  "like_count": 10,
  "dislike_count": 2,
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
  ],
  "is_active": true
}
```

## Cập nhật bài đăng

```
PUT /api/posts/{id}/
PATCH /api/posts/{id}/
```

Cập nhật một bài đăng. Chỉ tác giả mới có quyền cập nhật.

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:

```
title: Cho thuê phòng quận 1 (Cập nhật)
content: Nội dung cập nhật...
images: [file1, file2, ...]  // Files hình ảnh mới (tùy chọn)
```

**Response (200 OK)**:

```json
{
  "id": 1,
  "author": {
    "id": 123,
    "username": "user1",
    "full_name": "User One",
    "avatar": "https://example.com/avatars/user1.jpg",
    "avatar_thumbnail": "https://example.com/avatars/user1_thumb.jpg",
    "role": "owner"
  },
  "type": "rental_listing",
  "title": "Cho thuê phòng quận 1 (Cập nhật)",
  "content": "Nội dung cập nhật...",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "latitude": 10.7731,
  "longitude": 106.7030,
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T12:00:00Z",
  "house_link": 1,
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
    // ... updated or added images
  ],
  "is_active": true,
  "like_count": 10,
  "dislike_count": 2
}
```

## Xóa bài đăng

```
DELETE /api/posts/{id}/
```

Xóa một bài đăng. Chỉ tác giả hoặc admin mới có quyền xóa.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response (204 No Content)**:

Không có nội dung trả về.

## Tương tác với bài đăng

```
POST /api/posts/{id}/interact/
```

Like hoặc dislike một bài đăng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "type": "like"  // Giá trị có thể: "like", "dislike", "none"
}
```

**Response (200 OK)**:

```json
{
  "like_count": 11,
  "status": "success",
  "type": "like",
  "post_id": 1
}
```

## Thêm ảnh cho bài đăng

```
POST /api/posts/{id}/add_image/
```

Thêm hình ảnh cho bài đăng đã tạo.

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
      "id": 10,
      "url": "https://res.cloudinary.com/example/image/upload/v1234567/post_images/def456.jpg",
      "thumbnail": "https://res.cloudinary.com/example/image/upload/w_150,h_150,c_fill/v1234567/post_images/def456.jpg"
    },
    {
      "id": 11,
      "url": "https://res.cloudinary.com/example/image/upload/v1234567/post_images/ghi789.jpg",
      "thumbnail": "https://res.cloudinary.com/example/image/upload/w_150,h_150,c_fill/v1234567/post_images/ghi789.jpg"
    }
  ]
}
```

## Xóa ảnh khỏi bài đăng

```
DELETE /api/posts/{id}/remove_image/
```

Xóa hình ảnh khỏi bài đăng.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "media_id": 10
}
```

**Response (200 OK)**:

```json
{
  "status": "success",
  "message": "Image removed"
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
    {
      "id": 1,
      "author": {
        "id": 123,
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
      ],
      "is_active": true,
      "like_count": 10,
      "dislike_count": 2
    }
    // ... more posts
  ]
}
```

## Lọc bài đăng theo loại

```
GET /api/posts/by_type/?type=rental_listing
```

Lấy danh sách bài đăng theo loại cụ thể.

**Query Parameters**:

- `type`: Loại bài đăng (general, rental_listing, search_listing, roommate)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 20,
  "next": "https://api.example.com/api/posts/by_type/?type=rental_listing&page=2",
  "previous": null,
  "results": [
    // ... posts of specified type
  ]
}
```

## Lọc bài đăng theo vị trí

```
GET /api/posts/by_location/?lat=10.7731&lng=106.7030&radius=5
```

Lấy danh sách bài đăng gần một vị trí địa lý cụ thể.

**Query Parameters**:

- `lat`: Vĩ độ
- `lng`: Kinh độ
- `radius`: Bán kính tìm kiếm (km, mặc định: 5)
- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 15,
  "next": "https://api.example.com/api/posts/by_location/?lat=10.7731&lng=106.7030&radius=5&page=2",
  "previous": null,
  "results": [
    // ... posts near the specified location
  ]
}
```
