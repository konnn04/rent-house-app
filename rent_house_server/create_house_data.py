import requests
import json
import random
import time

# Boundaries for coordinate generation (Ho Chi Minh City area)
min_lat = 10.6989849
min_long = 106.5976056
max_lat = 10.8886463
max_long = 106.8030311

# Number of samples to generate
n_sample = 60

def get_address_from_coordinates(lat, lon):
    """Fetch address from Nominatim API"""
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1&accept-language=vi"
    
    # Proper User-Agent as required by Nominatim usage policy
    headers = {
        'User-Agent': 'RentHouseDataGenerator/1.0'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if 'display_name' in data:
            return {
                'lat': lat,
                'lon': lon,
                'address': data['display_name']
            }
        return None
    except Exception as e:
        print(f"Error fetching data for {lat}, {lon}: {e}")
        return None

# Generate random coordinates
print(f"Generating {n_sample} coordinates in Ho Chi Minh City area...")
coordinates = []
for _ in range(n_sample):
    lat = random.uniform(min_lat, max_lat)
    lon = random.uniform(min_long, max_long)
    coordinates.append((lat, lon))

# Fetch addresses and build JSON data
address_data = []
for i, (lat, lon) in enumerate(coordinates):
    print(f"Processing coordinate {i+1}/{n_sample}: {lat:.6f}, {lon:.6f}")
    data = get_address_from_coordinates(lat, lon)
    if data:
        address_data.append(data)
        print(f"Found: {data['address'][:60]}...")
    time.sleep(1.2)  # Respect Nominatim usage policy (max 1 request per second)

# Write directly to JSON file
output_file = "address_data.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(address_data, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(address_data)} addresses to {output_file}")