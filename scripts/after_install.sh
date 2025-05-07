#!/bin/bash
# Đảm bảo thư mục tồn tại và có quyền
sudo mkdir -p /home/ec2-user/rent-house-app/rent_house_server
sudo chown -R ec2-user:ec2-user /home/ec2-user/rent-house-app

# Di chuyển đến thư mục
cd /home/ec2-user/rent-house-app/rent_house_server

# Tạo và kích hoạt môi trường ảo
python3 -m venv venv || /usr/bin/python3 -m venv venv
source venv/bin/activate


# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Tạo thư mục static nếu chưa tồn tại
mkdir -p static

# Thêm vào settings.py nếu chưa có STATIC_ROOT
if ! grep -q "STATIC_ROOT" rent_house_server/settings.py; then
    echo "
# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
" >> rent_house_server/settings.py
fi

# Cấu hình Nginx để phục vụ port 80
sudo mkdir -p /etc/nginx/conf.d
sudo cat > /tmp/rent-house.conf << EOF
server {
    listen 80;
    server_name _;

    location /static/ {
        alias /home/ec2-user/rent-house-app/rent_house_server/static/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
sudo mv /tmp/rent-house.conf /etc/nginx/conf.d/

# Thu thập tệp tĩnh và thiết lập quyền
python manage.py collectstatic --noinput
sudo chmod -R 755 /home/ec2-user/rent-house-app/rent_house_server/static
sudo chown -R ec2-user:nginx /home/ec2-user/rent-house-app/rent_house_server/static

# Chạy migrations
python manage.py migrate

# Khởi động lại Nginx
sudo systemctl restart nginx