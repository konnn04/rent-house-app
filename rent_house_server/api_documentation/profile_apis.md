# Profile APIs

## Get User Profile by Username

```
GET /api/profiles/{username}/
```

Get the public profile of a user by their username.

**Response (200 OK)**:

```json
{
  "id": 123,
  "username": "example_user",
  "full_name": "John Doe",
  "avatar": "https://example.com/avatars/user123.jpg",
  "avatar_thumbnail": "https://example.com/avatars/user123_thumb.jpg",
  "role": "renter",
  "post_count": 15,
  "joined_date": "2023-05-01T10:30:00Z",
  "follower_count": 10,
  "following_count": 5,
  "avg_rating": 4.5,
  "is_followed": false
}
```

## Get List of Owners

```
GET /api/profiles/owners/
```

Get a list of users with the "owner" role.

**Query Parameters**:

- `page`: Số trang
- `page_size`: Số lượng kết quả trên mỗi trang

**Response (200 OK)**:

```json
{
  "count": 20,
  "next": "https://api.example.com/api/profiles/owners/?page=2",
  "previous": null,
  "results": [
    {
      "id": 456,
      "username": "owner1",
      "full_name": "Owner One",
      "avatar": "https://example.com/avatars/owner1.jpg",
      "avatar_thumbnail": "https://example.com/avatars/owner1_thumb.jpg",
      "role": "owner",
      "email": "owner1@example.com",
      "phone_number": "0987654321",
      "address": "123 Example St"
    },
    // ... more owner profiles
  ]
}
```
