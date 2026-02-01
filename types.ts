
export type Language = 'en' | 'hi' | 'mr';

export enum AssistanceStatus {
  IDLE = 'IDLE',
  PERMISSION_WAIT = 'PERMISSION_WAIT',
  DETECTING_LOCATION = 'DETECTING_LOCATION',
  LOCATION_DETECTED = 'LOCATION_DETECTED',
  ANALYZING_ISSUE = 'ANALYZING_ISSUE',
  FILTERING_MECHANICS = 'FILTERING_MECHANICS',
  CALCULATING_ETA = 'CALCULATING_ETA',
  EXPANDING_SEARCH = 'EXPANDING_SEARCH',
  MECHANIC_ASSIGNED = 'MECHANIC_ASSIGNED',
  ERROR = 'ERROR'
}

export interface MechanicInfo {
  name: string;
  distance: string;
  eta: string;
  phone: string;
  rating: number;
  capability: string;
}

export interface AssistanceRequest {
  issueType: string;
  description: string;
  severity: string;
  location?: {
    lat: number;
    lng: number;
  };
  mechanic?: MechanicInfo;
}

export interface GeminiResponse {
  issueType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  suggestedAction: string;
}
