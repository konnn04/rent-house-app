#!/bin/bash
# Install required packages
yum install -y nginx net-tools
systemctl start nginx
systemctl enable nginx

# Clean up previous installation
sudo rm -rf /home/ec2-user/rent-house-app/rent_house_server
sudo rm -rf /home/ec2-user/rent-house-app/logs

# Create directories for logs
mkdir -p /home/ec2-user/rent-house-app/logs
touch /home/ec2-user/rent-house-app/deploy.log
chown -R ec2-user:ec2-user /home/ec2-user/rent-house-app