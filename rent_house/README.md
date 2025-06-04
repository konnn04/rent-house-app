# RENT HOUSE APP

Ứng dụng di động xây dựng với React Native và Expo giúp người dùng tìm kiếm, đăng tin và thuê nhà/phòng trọ.

## Framework và Công nghệ

- **React Native** - Framework phát triển ứng dụng di động
- **Expo** - Platform hỗ trợ phát triển React Native
- **React Navigation** - Điều hướng trong ứng dụng
- **React Native Paper** - UI framework dựa trên Material Design
- **AsyncStorage** - Lưu trữ dữ liệu local
- **Redux** - Quản lý state
- **Axios** - HTTP client
- **OAuth2** - Xác thực người dùng
- **React Native Maps** - Hiển thị bản đồ
- **Expo Image Picker** - Chọn và xử lý hình ảnh
- **React Native Vector Icons** - Bộ icon

## Cấu trúc Component

Ứng dụng được tổ chức theo mô-đun với các nhóm component chức năng:

### Authentication
- `Login`: Đăng nhập người dùng
- `Register`: Đăng ký tài khoản mới
- `Verify`: Xác thực tài khoản qua email
- `CantLogin`: Hỗ trợ khi không thể đăng nhập

### User Profiles
- `ProfileScreen`: Hiển thị thông tin người dùng đăng nhập
- `PublicProfile`: Xem thông tin người dùng khác
- `EditProfileScreen`: Chỉnh sửa thông tin cá nhân
- `ChangePasswordScreen`: Thay đổi mật khẩu
- `ProfileAvatar`: Component hiển thị và cập nhật avatar

### Posts & Feeds
- `PostCard`: Hiển thị bài đăng dạng card
- `PostDetail`: Chi tiết bài đăng
- `NewPostSample`: Giao diện tạo bài đăng mới
- `FeedList`: Danh sách bài đăng theo feed

### Lookup & Search
- `Lookup`: Màn hình tìm kiếm chính
- `ListView`: Hiển thị kết quả dạng danh sách
- `MapViewCustom`: Hiển thị kết quả trên bản đồ
- `SearchFilters`: Bộ lọc tìm kiếm
- `HouseMarker`: Marker hiển thị nhà trên bản đồ

### Chat
- `ChatList`: Danh sách các cuộc trò chuyện
- `ChatDetail`: Chi tiết cuộc trò chuyện
- `ChatInfo`: Thông tin nhóm chat
- `SearchBar`: Thanh tìm kiếm người dùng

### Notifications
- `Notices`: Quản lý thông báo
- `NotificationCard`: Hiển thị thông báo đơn

### Settings
- `SettingsScreen`: Cài đặt ứng dụng
- `NotificationSettingsScreen`: Cài đặt thông báo
- `LanguageSettingsScreen`: Cài đặt ngôn ngữ
- `AboutAppScreen`: Thông tin ứng dụng

### Common
- `ImageGallery`: Hiển thị gallery ảnh
- `Loading`: Màn hình loading

## Cấu trúc Dự Án

```
rent_house/
├── components/        # UI components theo tính năng
├── content/           # Dữ liệu tĩnh và nội dung hiển thị
├── contexts/          # React Contexts quản lý state toàn cục
├── hooks/             # Custom React hooks
├── services/          # Các API services
├── styles/            # Styles và themes
├── utils/             # Các hàm tiện ích
└── constants/         # Các hằng số và cấu hình
```

© 2025 Rent House Team. All rights reserved.