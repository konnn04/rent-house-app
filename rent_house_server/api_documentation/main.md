# Rent House API Documentation

Tài liệu này mô tả các API có sẵn trong ứng dụng Rent House và cách sử dụng chúng.

## Base URL

```
https://your-api-domain.com/api/
```

## Authentication

Hầu hết các API yêu cầu xác thực. Rent House sử dụng OAuth2 để xác thực. 

### Loại xác thực

- **Bearer Token**: Hầu hết API yêu cầu token OAuth2 trong header Authorization
  ```
  Authorization: Bearer {access_token}
  ```

### Lấy Access Token

Sau khi xác thực email qua API `/api/verify-email/`, bạn sẽ nhận được access token và refresh token.

## Table of Contents

- [Authentication APIs](authentication_apis.md)
- [OAuth APIs](oauth_apis.md)
- [User APIs](user_apis.md)
- [House APIs](house_apis.md)
- [Room APIs](room_apis.md)
- [Post APIs](post_apis.md)
- [Comment APIs](comment_apis.md)
- [Rate APIs](rate_apis.md)
- [Notification APIs](notification_apis.md)
- [Follow APIs](follow_apis.md)
- [Room Rental APIs](room_rental_apis.md)
- [Chat APIs](chat_apis.md)

## Mô tả chung về hệ thống

Rent House là nền tảng kết nối chủ nhà và người thuê. Hệ thống cho phép:

1. **Chủ nhà** (role: owner):
   - Đăng ký, quản lý thông tin nhà và phòng cho thuê
   - Đăng thông tin tìm người thuê
   - Tương tác, trò chuyện với người có nhu cầu thuê
   - Quản lý các hợp đồng cho thuê

2. **Người thuê** (role: renter):
   - Tìm kiếm nhà/phòng phù hợp
   - Đăng thông tin tìm phòng/nhà
   - Tương tác, trò chuyện với chủ nhà
   - Quản lý hợp đồng thuê phòng

Tài liệu API được tổ chức theo các module chức năng, mỗi module bao gồm nhiều API endpoint phục vụ các tác vụ khác nhau.
