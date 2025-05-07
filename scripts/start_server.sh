#!/bin/bash

# Set up error handling
set -e
echo "Starting server deployment at $(date)" > /home/ec2-user/rent-house-app/deploy.log

# Create log directory if it doesn't exist
mkdir -p /home/ec2-user/rent-house-app/logs
LOG_FILE="/home/ec2-user/rent-house-app/logs/gunicorn.log"

# Change to the application directory
cd /home/ec2-user/rent-house-app/rent_house_server || {
    echo "Failed to change to application directory" >> /home/ec2-user/rent-house-app/deploy.log
    exit 1
}

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "Virtual environment not found!" >> /home/ec2-user/rent-house-app/deploy.log
    exit 1
fi

source venv/bin/activate || {
    echo "Failed to activate virtual environment" >> /home/ec2-user/rent-house-app/deploy.log
    exit 1
}

# Stop any running Gunicorn processes
echo "Stopping any running Gunicorn processes..." >> "$LOG_FILE"
pkill gunicorn || echo "No Gunicorn processes found to kill."

# Start Gunicorn with better configuration
echo "Starting Gunicorn at $(date)" >> "$LOG_FILE"
nohup gunicorn \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile "$LOG_FILE" \
    --error-logfile "$LOG_FILE" \
    --capture-output \
    --log-level info \
    rent_house_server.wsgi:application >> "$LOG_FILE" 2>&1 &

# Store the PID
GUNICORN_PID=$!
echo "Gunicorn started with PID: $GUNICORN_PID" >> "$LOG_FILE"

# Give Gunicorn time to start up
sleep 5

# Check if Gunicorn is running
if ps -p $GUNICORN_PID > /dev/null; then
    echo "Gunicorn successfully started." >> "$LOG_FILE"
    echo "SUCCESS: Gunicorn started at $(date)" >> /home/ec2-user/rent-house-app/deploy.log
    exit 0
else
    echo "ERROR: Gunicorn failed to start!" >> "$LOG_FILE"
    echo "FAILURE: Gunicorn failed to start at $(date)" >> /home/ec2-user/rent-house-app/deploy.log
    
    # Dump recent log entries for debugging
    echo "Last 20 lines of Gunicorn log:" >> /home/ec2-user/rent-house-app/deploy.log
    tail -n 20 "$LOG_FILE" >> /home/ec2-user/rent-house-app/deploy.log
    
    exit 1
fi