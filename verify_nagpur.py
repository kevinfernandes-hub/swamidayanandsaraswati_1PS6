from backend_logic import handle_assistance_request
import json

def verify_nagpur_integration():
    print("Verifying Nagpur Real Assistance Integration...")
    
    # Nagpur, Maharashtra Coordinates
    nagpur_coords = {"lat": 21.1458, "lon": 79.0882}
    
    # Test Case 1: Car Breakdown (Mechanic)
    print("\nCase 1: Car Breakdown near Nagpur Civil Lines")
    request_data = {
        "user_text": "My car engine is overheating near Zero Mile Nagpur",
        "user_location": nagpur_coords,
        "request_count_last_10_min": 0,
        "cancel_count_today": 0
    }
    
    result = handle_assistance_request(request_data)
    print(f"Status: {result.get('status')}")
    print(f"Assigned: {result.get('mechanic_name')}")
    print(f"Phone: {result.get('mechanic_phone')}")
    print(f"Coordinates: {result.get('mechanic_lat')}, {result.get('mechanic_lon')}")
    print(f"Message: {result.get('message')}")
    
    assert result['status'] == 'assigned'
    assert result['mechanic_name'] is not None
    
    # Test Case 2: Accident Emergency (Hospital/Police)
    print("\nCase 2: Major Accident Emergency")
    emergency_data = {
        "user_text": "HELP! Major accident on Wardha Road, people injured!",
        "user_location": nagpur_coords,
        "request_count_last_10_min": 0,
        "cancel_count_today": 0
    }
    
    emergency_result = handle_assistance_request(emergency_data)
    print(f"Priority: {emergency_result.get('priority')}")
    print(f"Assigned Emergency Service: {emergency_result.get('mechanic_name')}")
    print(f"Message: {emergency_result.get('message')}")
    
    assert emergency_result['priority'] == 'emergency'
    
    print("\nNagpur Integration Verification Passed!")

if __name__ == "__main__":
    verify_nagpur_integration()
