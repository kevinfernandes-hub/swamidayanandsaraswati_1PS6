/**
 * Generic API Client
 * Use this to connect to your backend on the different PC.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

export const apiClient = {
    // Example GET request
    get: async (endpoint: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Example POST request
    post: async (endpoint: string, data: any) => {
        try {
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Typed assistance request
export interface AssistanceRequestPayload {
    user_text: string;
    user_location?: { lat: number; lon: number } | null;
    request_count_last_10_min?: number;
    cancel_count_today?: number;
}

export interface AssistanceResponsePayload {
    message: string;
    status: string;
    priority?: string;
    mechanic_id?: string;
    mechanic_name?: string;
    mechanic_phone?: string;
    mechanic_lat?: number;
    mechanic_lon?: number;
    eta_minutes?: number;
    issue_type?: string;
}

export const submitAssistanceRequest = async (
    payload: AssistanceRequestPayload
): Promise<AssistanceResponsePayload> => {
    return apiClient.post('/api/request-assistance', payload);
};

