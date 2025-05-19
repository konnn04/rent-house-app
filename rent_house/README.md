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
├── App.js                     # Entry point của ứng dụng
├── components/                # Các components theo chức năng
│   ├── auth/                  # Components xác thực
│   ├── chat/                  # Components nhắn tin
│   ├── common/                # Components dùng chung
│   ├── feeds/                 # Components hiển thị feeds
│   ├── houses/                # Components liên quan đến nhà
│   ├── lookup/                # Components tìm kiếm
│   ├── notices/               # Components thông báo
│   ├── posts/                 # Components bài đăng
│   ├── profiles/              # Components profile
│   ├── settings/              # Components cài đặt
│   └── Main.js                # Component điều hướng chính
├── constants/                 # Hằng số và cấu hình
│   └── Config.js              # Cấu hình API, OAuth, etc.
├── contexts/                  # Context providers
│   ├── AuthContext.js         # Quản lý xác thực
│   ├── SettingContext.js      # Quản lý cài đặt người dùng
│   ├── ThemeContext.js        # Quản lý giao diện
│   └── UserContext.js         # Quản lý thông tin người dùng
├── styles/                    # Style chung
│   └── style.js               # Styles và theme
├── utils/                     # Utilities
│   ├── Authentication.js      # Xử lý xác thực
│   ├── Fetch.js               # Xử lý HTTP requests
│   ├── Theme.js               # Quản lý theme
│   └── Tools.js               # Công cụ hỗ trợ
└── assets/                    # Images, icons, etc.
```

## Cách Khởi Chạy

1. **Cài đặt dependencies**

```bash
# Cài đặt Node.js và npm nếu chưa có

# Clone dự án
git clone https://github.com/konnn04/rent-house-app.git
cd rent-house-app

# Cài đặt các packages
npm install

# Hoặc sử dụng yarn
yarn install
```

2. **Khởi chạy ứng dụng**

```bash
# Khởi động Expo development server
npx expo start

# Chạy trên iOS simulator
npx expo run:ios

# Chạy trên Android emulator
npx expo run:android
```

3. **Sử dụng Expo Go App**

- Tải Expo Go từ App Store hoặc Google Play
- Quét mã QR được hiển thị sau khi chạy `npx expo start`

## Thiết Lập Cấu Hình

1. **Cấu hình API và OAuth**

Mở file `constants/Config.js` và cập nhật các thông số:

```javascript
// constants/Config.js
export const CLIENT_ID = "your_client_id"; 
export const CLIENT_SECRET = "your_client_secret";
export const API_BASE_URL = "https://your-api-endpoint.com";

export const MAX_POSTS_PER_PAGE = 10;
export const MAX_COMMENTS_PER_PAGE = 10;
export const MAX_NOTIFICATIONS_PER_PAGE = 10;
```

2. **Cấu hình Backend API**

Đảm bảo rằng API backend đã được cấu hình đúng để xử lý các endpoints mà ứng dụng sử dụng:
- `/o/token/` - Endpoint xác thực OAuth2
- `/api/register/` - Đăng ký người dùng
- `/api/users/` - Quản lý người dùng
- `/api/new-feed/` - Lấy feed bài đăng
- `/api/houses/` - Quản lý nhà/phòng
- `/api/chats/` - Nhắn tin
- `/api/notifications/` - Thông báo

3. **Tùy chỉnh theme**

Chỉnh sửa theme của ứng dụng trong `utils/Theme.js` và `styles/style.js`

## Tính Năng

- Đăng nhập, đăng ký, quên mật khẩu
- Xem và chỉnh sửa thông tin cá nhân
- Tìm kiếm nhà/phòng trên bản đồ và danh sách
- Lọc kết quả tìm kiếm theo nhiều tiêu chí
- Đăng bài, tương tác với bài đăng
- Nhắn tin 1-1 và nhóm
- Quản lý thông báo
- Thay đổi ngôn ngữ
- Tùy chỉnh giao diện sáng/tối

## Components

- `ImageGallery`: Hiển thị gallery ảnh cho bài đăng và phòng
- `ChatHeader`: Header component cho màn hình chat
- `MessageInput`: Component nhập tin nhắn với hỗ trợ gửi ảnh/video
- `MessageList`: Component hiển thị danh sách tin nhắn
- `MessageItem`: Component hiển thị từng tin nhắn
- `MediaPreview`: Component xem trước media trong tin nhắn
- `MediaViewer`: Component xem ảnh/video full màn hình

## Giấy Phép

© 2025 Rent House Team. All rights reserved.