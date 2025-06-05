# Ứng dụng Cho Thuê Nhà - Phần Backend

Hệ thống quản lý tài sản cho thuê toàn diện được xây dựng bằng Django, cho phép người dùng đăng tin, khám phá và quản lý các tài sản cho thuê.

## Công Nghệ Sử Dụng

- **Framework Backend**: Django 5.1.x
- **Cơ sở dữ liệu**: PostgreSQL/MySQL
- **Lưu trữ hình ảnh**: Cloudinary
- **Xác thực**: OAuth2 (Django OAuth Toolkit) với mô hình User tùy chỉnh
- **API**: Django REST Framework
- **Tích hợp Frontend**: Dựa trên template với hỗ trợ JavaScript hiện đại

## Cấu Trúc Mô Hình

### Mô Hình Cốt Lõi

- **User**: Mở rộng mô hình User của Django với các trường bổ sung như avatar, vai trò (chủ nhà/người thuê), số điện thoại và địa chỉ
- **House**: Đại diện cho các tài sản có sẵn để cho thuê với thông tin chi tiết như vị trí, tiện nghi và thông tin chủ sở hữu
- **Room**: Các phòng riêng lẻ trong nhà, với thông số kỹ thuật và giá cả
- **Post**: Nội dung được chia sẻ bởi người dùng về tài sản, bao gồm mô tả và phương tiện
- **Comment**: Phản hồi và đánh giá của người dùng
- **Media**: Xử lý tải lên hình ảnh và lưu trữ, tích hợp với Cloudinary
- **Rate**: Đánh giá nhà/phòng
- **Notification**: Thông báo hệ thống
- **Follow**: Theo dõi người dùng
- **Chat/Message**: Nhắn tin, nhóm chat
- **IdentityVerification**: Xác thực danh tính chủ nhà
- **Report**: Báo cáo vi phạm

## Cấu Trúc Dự Án

```
rent_house_server/
├── rent_house/               # Ứng dụng chính
│   ├── models.py             # Mô hình cơ sở dữ liệu
│   ├── views.py              # Bộ điều khiển view
│   ├── admin.py              # Tùy chỉnh giao diện admin
│   ├── urls.py               # Định tuyến URL
│   ├── utils.py              # Các hàm tiện ích
│   ├── templates/            # Mẫu HTML
│   │   └── admin/            # Mẫu admin tùy chỉnh
│   └── static/               # Tệp tĩnh (CSS, JS, hình ảnh)
├── api_documentation/        # Tài liệu API
├── manage.py                 # Script quản lý Django
└── requirements.txt          # Các phụ thuộc dự án
```

## Thiết Lập và Chạy

### Yêu Cầu Tiên Quyết

- Python 3.8 hoặc cao hơn
- PostgreSQL hoặc MySQL
- Tài khoản Cloudinary

### Cài Đặt & Khởi Tạo Dữ Liệu

1. **Clone kho lưu trữ:**
    ```bash
    git clone https://github.com/konnn04/rent-house-app.git
    cd rent-house-app/rent_house_server
    ```

2. **Tạo và kích hoạt môi trường ảo:**
    ```bash
    python -m venv .venv
    # Trên Windows
    .venv\Scripts\activate
    # Trên macOS/Linux
    source .venv/bin/activate
    ```

3. **Cài đặt các phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Tạo file `.env` với các biến môi trường cần thiết (xem mẫu bên dưới)**

5. **Tạo migration và migrate database:**
    ```bash
    python manage.py makemigrations rent_house
    python manage.py migrate
    ```

6. **Tạo dữ liệu mẫu và app OAuth2 (tùy chọn):**
    ```bash
    python manage.py populate_data
    ```
    - Lệnh này sẽ tạo data ảo và tự động tạo app OAuth2 cho React Native.

    **Hoặc tự tạo superuser và app OAuth2:**
    ```bash
    python manage.py createsuperuser
    python manage.py runserver
    # Truy cập admin để tạo app OAuth2 nếu cần
    ```

7. **Chạy server phát triển:**
    ```bash
    python manage.py runserver
    ```

8. **Truy cập giao diện quản trị tại:**  
    http://127.0.0.1:8000/admin/

## Cấu Hình .env Mẫu

```
# Cài đặt Django
DEBUG=True
SECRET_KEY=your_secure_django_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1

# Cấu hình Cơ sở dữ liệu
DB_NAME=rent_house_db
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Cấu hình Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cấu hình Email (tùy chọn)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

## Tính Năng

- Quản lý người dùng với các vai trò khác nhau (chủ sở hữu, người thuê)
- Quản lý tài sản (nhà và phòng)
- Tải lên phương tiện với tự động tạo hình thu nhỏ
- Bình luận và đánh giá
- Tùy chọn tìm kiếm và lọc nâng cao (search, filter, phân trang)
- Giao diện quản trị đáp ứng với hỗ trợ chế độ tối
- Xác thực OAuth2, quản lý token
- Thông báo hệ thống, nhắn tin, báo cáo vi phạm

## Điểm Cuối API

Hệ thống cung cấp API RESTful cho các ứng dụng khách, bao gồm:

- Xác thực người dùng (đăng nhập/đăng ký)
- Quản lý hồ sơ
- Danh sách và chi tiết tài sản
- Tìm kiếm và lọc
- Đánh giá và bình luận
- Quản lý thông báo, chat, báo cáo

**Xem chi tiết tại thư mục api_documentation.**
