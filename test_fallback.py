from backend_logic import handle_assistance_request

def test_fallback():
    print("Testing Fallback Logic (Keyword-based)...")
    
    # Test Normal Case
    normal_input = {
        "user_text": "I have a flat tire",
        "request_count_last_10_min": 0,
        "cancel_count_today": 0,
        "user_location": {"lat": 10.05, "lon": 10.05}
    }
    result_normal = handle_assistance_request(normal_input)
    print(f"\nNormal Case Result: {result_normal}")
    assert result_normal["priority"] == "normal"
    assert "Help is on the way" in result_normal["message"]
    
    # Test Emergency Case
    emergency_input = {
        "user_text": "Major accident fire people hurt",
        "request_count_last_10_min": 0,
        "cancel_count_today": 0,
        "user_location": {"lat": 10.05, "lon": 10.05}
    }
    result_emergency = handle_assistance_request(emergency_input)
    print(f"Emergency Case Result: {result_emergency}")
    assert result_emergency["priority"] == "emergency"
    assert "Emergency services" in result_emergency["message"]
    
    print("\nFallback Logic Verification Passed!")

if __name__ == "__main__":
    test_fallback()
