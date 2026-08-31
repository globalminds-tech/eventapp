import requests
import json

url = "http://localhost:5001/superadmin/api/create_venue"
payload = {
    "venue_name": "Test Venue",
    "address": "123 Test St",
    "city_name": "Test City",
    "organizer_id": 1
}

try:
    response = requests.post(url, json=payload)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
