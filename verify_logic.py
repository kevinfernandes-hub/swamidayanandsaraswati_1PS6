import math
from backend_logic import handle_assistance_request, get_live_status

def test_logic():
    print("Starting verification tests...")

    # Scenario 1: Emergency (Accident + Keywords)
    print("Testing Scenario 1: Emergency Accident...")
    data_1 = {
        "user_text": "I had a massive accident and there is fire!",
        "user_location": {"lat": 10.05, "lon": 10.05},
        "request_count_last_10_min": 0,
        "cancel_count_today": 0
    }
    res_1 = handle_assistance_request(data_1)
    assert res_1["priority"] == "emergency"
    assert "Emergency services" in res_1["message"]
    assert res_1["status"] == "assigned"
    print("Scenario 1 passed.")

    # Scenario 2: Emergency (Only Keywords reaching 70)
    # Score = 15 * 5 = 75
    print("Testing Scenario 2: Emergency via keywords...")
    data_2 = {
        "user_text": "help emergency danger crash fire",
        "user_location": {"lat": 10.05, "lon": 10.05},
        "request_count_last_10_min": 0,
        "cancel_count_today": 0
    }
    res_2 = handle_assistance_request(data_2)
    assert res_2["priority"] == "emergency"
    print("Scenario 2 passed.")

    # Scenario 3: Misuse (Many requests)
    print("Testing Scenario 3: Misuse detection...")
    data_3 = {
        "user_text": "flat tyre",
        "user_location": {"lat": 10.05, "lon": 10.05},
        "request_count_last_10_min": 5,
        "cancel_count_today": 0
    }
    res_3 = handle_assistance_request(data_3)
    assert res_3["priority"] == "low"
    assert "Help is on the way" in res_3["message"]
    print("Scenario 3 passed.")

    # Scenario 4: Missing Location
    print("Testing Scenario 4: Missing location...")
    data_4 = {
        "user_text": "battery dead",
        "user_location": None,
        "request_count_last_10_min": 0,
        "cancel_count_today": 0
    }
    res_4 = handle_assistance_request(data_4)
    assert res_4["status"] == "waiting_for_location"
    assert "landmark" in res_4["message"]
    print("Scenario 4 passed.")

    # Scenario 5: Normal Case
    print("Testing Scenario 5: Normal request...")
    data_5 = {
        "user_text": "engine motor problem",
        "user_location": {"lat": 10.05, "lon": 10.05},
        "request_count_last_10_min": 0,
        "cancel_count_today": 0
    }
    res_5 = handle_assistance_request(data_5)
    assert res_5["priority"] == "normal"
    assert res_5["mechanic_id"] is not None
    print("Scenario 5 passed.")

    # Scenario 6: Live Status
    print("Testing Scenario 6: Live status updates...")
    assert get_live_status(6000) == "assigned"
    assert get_live_status(600) == "on_the_way"
    assert get_live_status(60) == "arriving"
    assert get_live_status(10) == "arrived"
    print("Scenario 6 passed.")

    print("\nAll verification tests passed successfully!")

if __name__ == "__main__":
    test_logic()
