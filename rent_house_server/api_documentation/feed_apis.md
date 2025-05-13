# Feed APIs

## Get News Feed

```
GET /api/new-feed/
```

Get a feed of recent posts for the user.

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
