# Report APIs

## Gửi báo cáo người dùng

```
POST /api/reports/
```

Báo cáo một người dùng vi phạm.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Request Body**:

```json
{
  "reported_user": 456,
  "type": "scam",
  "reason": "Người dùng này đã lừa đảo khi giao dịch đặt cọc"
}
```

**Các loại báo cáo (type):**
- `scam`: Lừa đảo
- `violation`: Vi phạm quy định
- `offensive`: Phản cảm
- `hate`: Gây thù ghét
- `other`: Khác

**Response (201 Created)**:

```json
{
  "id": 1,
  "reported_user": 456,
  "type": "scam",
  "type_display": "Lừa đảo",
  "reason": "Người dùng này đã lừa đảo khi giao dịch đặt cọc",
  "is_resolved": false,
  "created_at": "2023-07-15T10:30:00Z"
}
```

**Response (400 Bad Request)** - Khi thiếu thông tin:

```json
{
  "reported_user": ["This field is required."],
  "type": ["This field is required."],
  "reason": ["This field is required."]
}
```

**Response (404 Not Found)** - Khi người dùng bị báo cáo không tồn tại:

```json
{
  "reported_user": ["Invalid pk \"456\" - object does not exist."]
}
```
