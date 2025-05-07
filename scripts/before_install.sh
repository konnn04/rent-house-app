#!/bin/bash
yum install -y nginx
systemctl start nginx
systemctl enable nginx
sudo rm -rf /home/ec2-user/rent-house-app/rent_house_server