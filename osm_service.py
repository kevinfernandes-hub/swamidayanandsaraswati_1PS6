import requests
import logging
import math

logger = logging.getLogger(__name__)

OVERPASS_URL = "http://overpass-api.de/api/interpreter"

def fetch_nearby(lat, lon, types=['car_repair'], radius=10000):
    """
    Fetch nearby points of interest from OpenStreetMap using the Overpass API.
    types can include: 'car_repair', 'hospital', 'police'
    """
    
    # Map types to OSM tags
    tag_map = {
        'car_repair': '["amenity"="car_repair"]',
        'car_repair_shop': '["shop"="car_repair"]',
        'mechanic': '["craft"="mechanic"]',
        'hospital': '["amenity"="hospital"]',
        'police': '["amenity"="police"]'
    }
    
    # Overpass QL query
    queries = ""
    for t in types:
        if t == 'car_repair':
            # Include variations for car repair
            subtypes = ['car_repair', 'car_repair_shop', 'mechanic']
            for st in subtypes:
                tag = tag_map.get(st)
                queries += f'node{tag}(around:{radius},{lat},{lon});'
                queries += f'way{tag}(around:{radius},{lat},{lon});'
        else:
            tag = tag_map.get(t, f'["amenity"="{t}"]')
            queries += f'node{tag}(around:{radius},{lat},{lon});'
            queries += f'way{tag}(around:{radius},{lat},{lon});'

    query = f"""
    [out:json][timeout:25];
    (
        {queries}
    );
    out body;
    >;
    out skel qt;
    """

    try:
        logger.info(f"Querying Overpass API for {types} around {lat}, {lon}")
        response = requests.post(OVERPASS_URL, data={'data': query}, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        elements = data.get('elements', [])
        results = []
        
        for el in elements:
            if el.get('type') == 'node':
                tags = el.get('tags', {})
                results.append({
                    'id': el.get('id'),
                    'name': tags.get('name', tags.get('operator', 'Independent Service')),
                    'lat': el.get('lat'),
                    'lon': el.get('lon'),
                    'phone': tags.get('phone', tags.get('contact:phone', '+91 0000000000')),
                    'type': tags.get('amenity', 'general')
                })
        
        # Sort by distance (Haversine formula isn't strictly necessary for sorting small radii, 
        # but let's do a simple pythagorean for sorting)
        results.sort(key=lambda x: (x['lat'] - lat)**2 + (x['lon'] - lon)**2)
        
        return results
    except Exception as e:
        logger.error(f"Overpass API request failed: {e}")
        return []

def get_real_assistance(lat, lon, issue_type='general'):
    """
    Helper to get the right type of assistance based on issue.
    """
    search_types = ['car_repair']
    if issue_type == 'accident':
        search_types = ['hospital', 'police', 'car_repair']
        
    return fetch_nearby(lat, lon, types=search_types)

if __name__ == "__main__":
    # Test with Nagpur coordinates
    nagpur_lat, nagpur_lon = 21.1458, 79.0882
    print(f"Testing Overpass for Nagpur ({nagpur_lat}, {nagpur_lon})...")
    mechanics = fetch_nearby(nagpur_lat, nagpur_lon)
    print(f"Found {len(mechanics)} mechanics.")
    if mechanics:
        for m in mechanics[:3]:
            print(f"- {m['name']} at {m['lat']}, {m['lon']} (Phone: {m['phone']})")
