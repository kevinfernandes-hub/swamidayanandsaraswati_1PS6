/**
 * OSRM Routing Service
 * Utilities for calculating route distance and duration between coordinates.
 */

// Types for coordinates
export interface Coordinates {
    lat: number;
    lng: number;
}

// Types for routing result
export interface RouteResult {
    distance: number; // in kilometers
    duration: number; // in minutes
}

// OSRM Public API endpoint
// Note: This is a demo server. For production, consider hosting your own OSRM instance.
const OSRM_API_BASE_URL = 'http://router.project-osrm.org/route/v1/driving';

/**
 * Calculates the driving route between two points using OSRM.
 * 
 * @param start - Starting coordinates (User)
 * @param end - Destination coordinates (Mechanic)
 * @returns Promise containing distance in km and duration in minutes
 * @throws Error if API call fails or no route is found
 */
export const calculateRoute = async (
    start: Coordinates,
    end: Coordinates
): Promise<RouteResult> => {
    try {
        // Format coordinates as "longitude,latitude" (OSRM standard)
        const startCoord = `${start.lng},${start.lat}`;
        const endCoord = `${end.lng},${end.lat}`;

        // Construct the API URL
        const url = `${OSRM_API_BASE_URL}/${startCoord};${endCoord}?overview=false`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OSRM API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('No route found or invalid response from OSRM API');
        }

        const route = data.routes[0];

        // OSRM returns distance in meters, duration in seconds
        const distanceKm = route.distance / 1000;
        const durationMin = route.duration / 60;

        return {
            distance: parseFloat(distanceKm.toFixed(2)),
            duration: parseFloat(durationMin.toFixed(0)), // Rounded to nearest minute
        };

    } catch (error) {
        console.error('Error calculating route:', error);
        // Re-throw to allow caller to handle the error (e.g., show a notification)
        throw error;
    }
};
