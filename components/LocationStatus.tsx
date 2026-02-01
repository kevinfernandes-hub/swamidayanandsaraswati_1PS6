
import React from 'react';
import { AssistanceStatus, Language } from '../types';
import { translations } from '../translations';

interface LocationStatusProps { 
  status: AssistanceStatus; 
  error: string | null; 
  lang: Language;
}

const LocationStatus: React.FC<LocationStatusProps> = ({ status, error, lang }) => {
  const t = translations[lang];

  const getStatusConfig = () => {
    if (error) {
      return {
        icon: 'fa-triangle-exclamation text-red-500',
        text: t.errorTitle,
        color: 'bg-red-50 border-red-100',
        pulse: false,
        subtext: t.errorSub
      };
    }

    switch (status) {
      case AssistanceStatus.PERMISSION_WAIT:
        return {
          icon: 'fa-hand text-orange-500',
          text: t.permissionWait,
          color: 'bg-orange-50 border-orange-100',
          pulse: true,
          subtext: t.permissionSub
        };
      case AssistanceStatus.DETECTING_LOCATION:
        return {
          icon: 'fa-location-crosshairs text-blue-500',
          text: t.detectingLoc,
          color: 'bg-blue-50 border-blue-100',
          pulse: true,
          subtext: t.gpsSync
        };
      case AssistanceStatus.LOCATION_DETECTED:
      case AssistanceStatus.ANALYZING_ISSUE:
      case AssistanceStatus.FILTERING_MECHANICS:
      case AssistanceStatus.CALCULATING_ETA:
      case AssistanceStatus.EXPANDING_SEARCH:
      case AssistanceStatus.MECHANIC_ASSIGNED:
        return {
          icon: 'fa-circle-check text-india-green',
          text: t.locDetected,
          color: 'bg-green-50 border-green-100',
          pulse: false,
          subtext: t.locConfirmed
        };
      default:
        return {
          icon: 'fa-location-dot text-slate-300',
          text: t.waitingRequest,
          color: 'bg-white border-slate-100',
          pulse: false,
          subtext: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex flex-col gap-1 w-full p-4 rounded-2xl border ${config.color} transition-colors duration-300 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`text-xl ${config.pulse ? 'pulse' : ''}`}>
          <i className={`fa-solid ${config.icon}`}></i>
        </div>
        <span className={`font-bold text-slate-800 tracking-tight`}>
          {config.text}
        </span>
      </div>
      {config.subtext && (
        <p className="text-xs text-slate-500 ml-8 font-medium">
          {config.subtext}
        </p>
      )}
    </div>
  );
};

export default LocationStatus;
