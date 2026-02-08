import math
import gemini_service
import logging

logger = logging.getLogger(__name__)

def get_live_status(distance_meters):
    """
    Step 10: Live Status Update
    """
    if distance_meters > 5000:
        return "assigned"
    elif distance_meters > 500:
        return "on_the_way"
    elif distance_meters > 50:
        return "arriving"
    else:
        return "arrived"

def handle_assistance_request(data):
    """
    Deterministic backend logic for handling assistance requests following 10 steps.
    """
    
    # --- Internal Helpers (Mocking External Dependencies) ---
    
    def calculate_distance(loc1, loc2):
        if not loc1 or not loc2:
            return float('inf')
        return math.sqrt((loc1['lat'] - loc2['lat'])**2 + (loc1['lon'] - loc2['lon'])**2)

    def extract_issue(text):
        if not isinstance(text, str):
            text = ""
        text_lower = text.lower()
        
        # Step 1: Issue Extraction
        issue_type = "general"
        if "accident" in text_lower:
            issue_type = "accident"
        elif "battery" in text_lower:
            issue_type = "battery"
        elif "tyre" in text_lower or "tire" in text_lower:
            issue_type = "tyre"
        elif "engine" in text_lower or "motor" in text_lower:
            issue_type = "engine"
            
        location_text = None
        if "at" in text_lower:
            parts = text_lower.split("at")
            if len(parts) > 1:
                location_text = parts[1].strip()
        elif "near" in text_lower:
            parts = text_lower.split("near")
            if len(parts) > 1:
                location_text = parts[1].strip()
            
        emergency_keywords_pool = ["help", "emergency", "danger", "crash", "fire", "injury", "blood", "critical", "trap", "stuck"]
        found_keywords = [kw for kw in emergency_keywords_pool if kw in text_lower]
                
        return issue_type, found_keywords, location_text

    def nearest_service_center(user_loc):
        centers = [
            {"id": "center_1", "location": {"lat": 10.0, "lon": 10.0}},
            {"id": "center_2", "location": {"lat": 20.0, "lon": 20.0}}
        ]
        if not user_loc:
            return centers[0]
            
        best = None
        min_dist = float('inf')
        for c in centers:
            d = calculate_distance(user_loc, c["location"])
            if d < min_dist:
                min_dist = d
                best = c
        return best

    def nearest_available_mechanic(center, user_loc):
        mechanics = [
            {"id": "mech_1", "center_id": "center_1", "location": {"lat": 10.1, "lon": 10.1}},
            {"id": "mech_2", "center_id": "center_1", "location": {"lat": 10.2, "lon": 10.2}},
            {"id": "mech_3", "center_id": "center_2", "location": {"lat": 20.1, "lon": 20.1}}
        ]
        candidates = [m for m in mechanics if m["center_id"] == center["id"]]
        if not candidates:
            candidates = mechanics
            
        if not user_loc:
            return candidates[0]
            
        best = None
        min_dist = float('inf')
        for m in candidates:
            d = calculate_distance(user_loc, m["location"])
            if d < min_dist:
                min_dist = d
                best = m
        return best

    def osrm_eta(origin, destination):
        if not origin or not destination:
            return -1
        dist = calculate_distance(origin, destination)
        return int(dist * 10)

    # --- Step 1: Issue Extraction ---
    user_text = data.get("user_text", "")
    
    # Try LLM analysis first
    llm_analysis = gemini_service.analyze_request(user_text)
    
    if llm_analysis:
        logger.info(f"LLM Analysis: {llm_analysis}")
        issue_type = llm_analysis.get("issueType", "general").lower()
        severity = llm_analysis.get("severity", "Medium")
        suggested_action = llm_analysis.get("suggestedAction", "")
        emergency_flag = (severity in ["High", "Critical"])
        # For compatibility with existing logic
        emergency_keywords = [] if not emergency_flag else ["llm_emergency"]
    else:
        # Fallback to Step 1: Rule-based Issue Extraction
        issue_type, emergency_keywords, location_text = extract_issue(user_text)

        # --- Step 2: Emergency Scoring (Fallback) ---
        score = 0
        if issue_type == "accident":
            score += 60
        score += 15 * len(emergency_keywords)
        score = min(score, 100)
        emergency_flag = (score >= 70)
        suggested_action = None

    # --- Step 3: Fake / Misuse Detection ---
    request_count_last_10_min = data.get("request_count_last_10_min", 0)
    cancel_count_today = data.get("cancel_count_today", 0)
    
    if emergency_flag:
        suspicious = False
    elif request_count_last_10_min >= 5 or cancel_count_today >= 3:
        suspicious = True
    else:
        suspicious = False

    # --- Step 4: Dispatch Decision ---
    if emergency_flag:
        priority = "emergency"
        response_type = "ambulance_police_and_mechanic"
    else:
        priority = "low" if suspicious else "normal"
        response_type = "mechanic"

    user_location = data.get("user_location")
    if not user_location or user_location.get("lat") is None:
        response_type = "request_location"

    # --- Step 5: Location Resolution ---
    if response_type == "request_location":
        return {
          "message": "Please share a nearby landmark so we can send help",
          "status": "waiting_for_location"
        }

    # --- Step 6: Service Center Selection ---
    service_center = nearest_service_center(user_location)

    # --- Step 7: Mechanic Selection ---
    mechanic = nearest_available_mechanic(service_center, user_location)

    # --- Step 8: ETA Calculation ---
    eta = osrm_eta(mechanic["location"], user_location)
    final_eta = eta if eta >= 0 else None

    # --- Step 9: Initial Response ---
    res_msg = "Help is on the way"
    if emergency_flag:
        res_msg = "Emergency services have been notified"
    
    # Use LLM suggested action if available
    if suggested_action:
        res_msg = suggested_action

    return {
      "message": res_msg,
      "priority": priority,
      "mechanic_id": mechanic["id"],
      "eta_minutes": final_eta,
      "status": "assigned",
      "issue_type": issue_type # Include for frontend clarity
    }

if __name__ == "__main__":
    # --- Test 1: Normal Case ---
    print("Test 1: Normal Request")
    normal_input = {
        "user_text": "I have a flat tire",
        "request_count_last_10_min": 0,
        "cancel_count_today": 0,
        "user_location": {"lat": 10.05, "lon": 10.05}
    }
    result_normal = handle_assistance_request(normal_input)
    print("Input:", normal_input)
    print("Output:", result_normal)
    assert result_normal["priority"] == "normal"
    assert result_normal["status"] == "assigned"
    assert result_normal["eta_minutes"] is not None
    print("-" * 20)

    # --- Test 2: Edge Case (Emergency Accident) ---
    print("Test 2: Emergency Accident")
    emergency_input = {
        "user_text": "Major accident fire people hurt",
        "request_count_last_10_min": 100, # Should bypass misuse check
        "cancel_count_today": 0,
        "user_location": {"lat": 10.05, "lon": 10.05}
    }
    result_emergency = handle_assistance_request(emergency_input)
    print("Input:", emergency_input)
    print("Output:", result_emergency)
    assert result_emergency["priority"] == "emergency"
    assert "Emergency services" in result_emergency["message"]
    print("-" * 20)

    # --- Test 3: Failure/Invalid Case (Missing Location) ---
    print("Test 3: Missing Location")
    missing_loc_input = {
        "user_text": "Help",
        "user_location": None
    }
    result_missing = handle_assistance_request(missing_loc_input)
    print("Input:", missing_loc_input)
    print("Output:", result_missing)
    assert result_missing["status"] == "waiting_for_location"
    print("-" * 20)
    
    # --- Test 4: Live Status ---
    print("Test 4: Live Status")
    assert get_live_status(6000) == "assigned"
    assert get_live_status(600) == "on_the_way"
    assert get_live_status(60) == "arriving"
    assert get_live_status(10) == "arrived"
    print("Live Status Tests Passed")
