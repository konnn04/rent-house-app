# HỆ THỐNG ỨNG DỤNG TÌM NHÀ TRỌ - RENT HOUSE APP

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## Giới thiệu

Hệ thống ứng dụng di động tìm nhà trọ là một nền tảng toàn diện giúp người dùng tìm kiếm, đăng tin và quản lý tài sản cho thuê (nhà/phòng trọ) một cách dễ dàng. Dự án gồm hai phần:
- **Backend**: Xây dựng với Django, cung cấp API, quản lý dữ liệu, xác thực OAuth2, lưu trữ hình ảnh Cloudinary, quản trị, thông báo, chat, báo cáo...
- **Frontend**: Ứng dụng di động React Native (Expo), giao diện hiện đại, hỗ trợ tìm kiếm, đăng tin, chat, thông báo...

---

## Thành viên nhóm

- **Nguyễn Thanh Triều** - [Email](mailto:trieukon1011@gmail.com) - [Github](https://github.com/konnn04/)
- **Vương Minh Trí** - [Email](mailto:minhtri4724@gmail.com) - [Github]()


---

## Công nghệ sử dụng

### Backend
- **Django 5.1.x**
- **Django REST Framework**
- **Django OAuth Toolkit** (OAuth2)
- **PostgreSQL/MySQL**
- **Cloudinary** (lưu trữ hình ảnh)

### Frontend
- **React Native** (Expo)
- **React Navigation**
- **React Native Paper**
- **Redux**
- **Axios**
- **AsyncStorage**
- **React Native Maps**
- **Expo Image Picker**
- **React Native Vector Icons**

---

## Tính năng nổi bật

- Đăng nhập, đăng ký, xác thực OAuth2
- Quản lý người dùng với vai trò chủ nhà/người thuê
- Đăng tin, quản lý tài sản (nhà, phòng)
- Tìm kiếm, lọc, phân trang tài sản
- Đánh giá, bình luận, báo cáo vi phạm
- Tải lên hình ảnh, tự động tạo thumbnail
- Thông báo hệ thống, nhắn tin, nhóm chat
- Quản trị viên với giao diện tùy chỉnh, hỗ trợ chế độ tối
- Xác thực danh tính chủ nhà

---

## Cấu trúc dự án

```
rent-house-app/
├── rent_house/             # Ứng dụng di động (React Native)
│   ├── components/         # UI components
│   ├── content/            # Dữ liệu tĩnh
│   ├── contexts/           # React Contexts
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   ├── styles/             # Styles/themes
│   ├── utils/              # Tiện ích
│   └── constants/          # Hằng số/cấu hình
├── rent_house_server/      # Backend Django
│   ├── rent_house/         # Ứng dụng chính
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── admin.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   ├── templates/
│   │   └── static/
│   ├── api_documentation/  # Tài liệu API
│   ├── manage.py
│   └── requirements.txt
└── README.md               # Tài liệu tổng quan (file này)
```

---

## Hướng dẫn cài đặt & chạy thử

### Backend (Django)

1. **Clone dự án:**
    ```bash
    git clone https://github.com/konnn04/rent-house-app.git
    cd rent-house-app/rent_house_server
    ```

2. **Tạo và kích hoạt môi trường ảo:**
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate
    ```

3. **Cài đặt phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Tạo file `.env` với các biến môi trường (xem mẫu bên dưới)**

5. **Khởi tạo database:**
    ```bash
    python manage.py makemigrations rent_house
    python manage.py migrate
    ```

6. **Tạo dữ liệu mẫu và app OAuth2 (tùy chọn):**
    ```bash
    python manage.py populate_data
    ```
    Hoặc tự tạo superuser:
    ```bash
    python manage.py createsuperuser
    python manage.py runserver
    ```

7. **Chạy server:**
    ```bash
    python manage.py runserver
    ```

8. **Truy cập admin:**  
    http://127.0.0.1:8000/admin/

#### Mẫu file `.env` (backend)

```
# Django settings
DEBUG=True
SECRET_KEY=your_secure_django_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=rent_house_db
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

---

### Frontend (React Native)

1. **Cài đặt Expo CLI (nếu chưa có):**
    ```bash
    npm install -g expo-cli
    ```

2. **Cài đặt dependencies:**
    ```bash
    cd ../rent_house
    npm install
    ```

3. **Chạy ứng dụng:**
    ```bash
    expo start
    ```
    Quét QR code bằng Expo Go trên điện thoại để trải nghiệm.

---

## Tài liệu chi tiết

- [Chi tiết Backend (Django)](/rent_house_server/README.md)
- [Chi tiết Frontend (React Native)](/rent_house/README.md)

---

## Giấy phép

MIT License

© 2025 Rent House Team. All rights reserved.



