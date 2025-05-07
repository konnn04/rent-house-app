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

# Create an empty favicon.ico to prevent 404 errors
touch static/favicon.ico

# Cấu hình Nginx để phục vụ port 80 - Fix server_name conflict
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
sudo mkdir -p /etc/nginx/conf.d
sudo cat > /tmp/rent-house.conf << EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    location /static/ {
        alias /home/ec2-user/rent-house-app/rent_house_server/static/;
    }

    location /favicon.ico {
        alias /home/ec2-user/rent-house-app/rent_house_server/static/favicon.ico;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
sudo mv /tmp/rent-house.conf /etc/nginx/conf.d/

# Remove default Nginx configuration to prevent conflicts
sudo rm -f /etc/nginx/conf.d/default.conf

# Thu thập tệp tĩnh và thiết lập quyền
python manage.py collectstatic --noinput
sudo chmod -R 755 /home/ec2-user/rent-house-app/rent_house_server/static
sudo chown -R ec2-user:nginx /home/ec2-user/rent-house-app/rent_house_server/static

# Chạy migrations
python manage.py migrate

# Set up a proper logging directory for Gunicorn
sudo mkdir -p /var/log/gunicorn
sudo chown ec2-user:ec2-user /var/log/gunicorn

# Start the Gunicorn server (this makes sure it works before leaving the script)
pkill gunicorn || true
cd /home/ec2-user/rent-house-app/rent_house_server
source venv/bin/activate
nohup gunicorn --bind 0.0.0.0:8000 rent_house_server.wsgi:application > /home/ec2-user/rent-house-app/gunicorn.log 2>&1 &

# Wait for Gunicorn to start up
sleep 5

# Test if Gunicorn is running
if pgrep gunicorn > /dev/null; then
    echo "Gunicorn started successfully"
else
    echo "Failed to start Gunicorn" >&2
    exit 1
fi

# Khởi động lại Nginx
sudo systemctl restart nginx