import requests
import json

# Test the backend API
url = "http://localhost:9000/api/request-assistance"

# Test 1: Normal request
print("Test 1: Normal Request")
payload = {
    "user_text": "I have a flat tire",
    "user_location": {"lat": 10.05, "lon": 10.05},
    "request_count_last_10_min": 0,
    "cancel_count_today": 0
}

response = requests.post(url, json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print("-" * 50)

# Test 2: Emergency request
print("\nTest 2: Emergency Request")
payload_emergency = {
    "user_text": "Major accident fire people hurt",
    "user_location": {"lat": 10.05, "lon": 10.05},
    "request_count_last_10_min": 0,
    "cancel_count_today": 0
}

response_emergency = requests.post(url, json=payload_emergency)
print(f"Status Code: {response_emergency.status_code}")
print(f"Response: {json.dumps(response_emergency.json(), indent=2)}")
print("-" * 50)

# Test 3: Missing location
print("\nTest 3: Missing Location")
payload_no_location = {
    "user_text": "Help",
    "user_location": None,
    "request_count_last_10_min": 0,
    "cancel_count_today": 0
}

response_no_location = requests.post(url, json=payload_no_location)
print(f"Status Code: {response_no_location.status_code}")
print(f"Response: {json.dumps(response_no_location.json(), indent=2)}")
