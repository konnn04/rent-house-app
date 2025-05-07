#!/bin/bash
cd /home/ec2-user/rent-house-app/rent_house_server
python3 -m venv venv
source venv/bin/activate
yum install -y mariadb-devel gcc python3-devel
pip install -r requirements.txt


python manage.py makemigrations rent_house
python manage.py migrate