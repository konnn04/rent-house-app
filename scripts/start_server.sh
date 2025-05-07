#!/bin/bash
cd /home/ec2-user/rent-house-app/rent_house_server
source venv/bin/activate
pkill gunicorn
gunicorn --bind 0.0.0.0:8000 rent_house_server.wsgi:application &