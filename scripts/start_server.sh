#!/bin/bash
# filepath: /home/konnn04/Code/rent-house-app/scripts/start_server.sh
#!/bin/bash
cd /home/ec2-user/rent-house-app/rent_house_server
source venv/bin/activate
pkill gunicorn || true
nohup gunicorn --bind 0.0.0.0:8000 rent_house_server.wsgi:application > /home/ec2-user/rent-house-app/gunicorn.log 2>&1 &