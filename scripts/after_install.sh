#!/bin/bash
cd /home/ec2-user/rent-house-app/rent_house_server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations rent_house
python manage.py migrate