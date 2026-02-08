import requests
import logging

logger = logging.getLogger(__name__)

OSRM_API_BASE_URL = "https://router.project-osrm.org/route/v1/driving"

def get_route(start_loc, end_loc):
    """
    Fetch route distance and duration from OSRM.
    start_loc and end_loc are dicts with 'lat' and 'lon'.
    """
    if not start_loc or not end_loc:
        return None

    # OSRM expects {longitude},{latitude}
    coords = f"{start_loc['lon']},{start_loc['lat']};{end_loc['lon']},{end_loc['lat']}"
    url = f"{OSRM_API_BASE_URL}/{coords}?overview=false"

    try:
        logger.info(f"Querying OSRM for route: {coords}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("code") == "Ok" and data.get("routes"):
            route = data["routes"][0]
            # distance in meters, duration in seconds
            return {
                "distance_km": round(route["distance"] / 1000, 2),
                "duration_min": round(route["duration"] / 60)
            }
        return None
    except Exception as e:
        logger.error(f"OSRM request failed: {e}")
        return None

if __name__ == "__main__":
    # Test with Nagpur coordinates
    start = {"lat": 21.1458, "lon": 79.0882} # Zero Mile
    end = {"lat": 21.1407, "lon": 79.0887} # Nearby mechanic
    print(f"Testing OSRM for Nagpur points...")
    route = get_route(start, end)
    if route:
        print(f"Distance: {route['distance_km']} km")
        print(f"Duration: {route['duration_min']} min")
    else:
        print("Failed to get route.")
