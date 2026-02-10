
import React, { useState, useCallback } from 'react';
import { AssistanceStatus, AssistanceRequest, MechanicInfo, Language } from './types';
import Header from './components/Header';
import RequestForm from './components/RequestForm';
import LocationStatus from './components/LocationStatus';
import DashboardCard from './components/DashboardCard';
import { analyzeBreakdown } from './services/geminiService';
import { translations } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [userLoc, setUserLoc] = useState<{ lat: number, lng: number }>({ lat: 21.1458, lng: 79.0882 }); // Default Nagpur
  const [status, setStatus] = useState<AssistanceStatus>(AssistanceStatus.IDLE);
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState<boolean | null>(null); // null = checking, true = ok, false = down


  const t = translations[lang];

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const { apiClient } = await import('./services/api');
        const health = await apiClient.get('/api/health');
        console.log('✅ Backend Connection Verified:', health);
        setBackendReady(true);
      } catch (err) {
        console.error('❌ Backend Connection Failed:', err);
        setBackendReady(false);
      }
    };
    checkConnection();
    // Re-check periodically
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);


  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location support unavailable"));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, []);

  const handleRequestHelp = async (description: string, isPanic: boolean = false) => {
    setError(null);
    setStatus(AssistanceStatus.PERMISSION_WAIT);

    try {
      await delay(800);
      setStatus(AssistanceStatus.DETECTING_LOCATION);

      let location;
      const mockLoc = (window as any).__MOCK_LOCATION;

      if (mockLoc) {
        location = mockLoc;
        console.log('✅ Using cached mock location:', location);
      } else {
        try {
          location = await getLocation();
        } catch (locationError) {
          // Location permission denied or unavailable
          setError("Location access is required. Please enable location permissions or use the 'USE MOCK GPS' button above.");
          setStatus(AssistanceStatus.ERROR);
          return;
        }
      }

      setStatus(AssistanceStatus.LOCATION_DETECTED);
      await delay(500);

      setStatus(AssistanceStatus.ANALYZING_ISSUE);
      const analysis = await analyzeBreakdown(isPanic ? "ACCIDENT EMERGENCY PANIC" : (description || "Roadside assistance required"), lang);

      const newRequest: AssistanceRequest = {
        issueType: analysis.issueType,
        description: description || (isPanic ? "Emergency Help" : "General Help"),
        severity: analysis.severity,
        location,
      };
      setRequest(newRequest);
      await delay(1200);

      setStatus(AssistanceStatus.FILTERING_MECHANICS);
      await delay(800);

      // Call backend API
      const { submitAssistanceRequest } = await import('./services/api');
      const text = isPanic ? "ACCIDENT EMERGENCY PANIC" : (description || "Roadside assistance required");
      const payload = {
        user_text: text,
        user_location: { lat: userLoc.lat, lon: userLoc.lng },
        request_count_last_10_min: 0,
        cancel_count_today: 0
      };
      const backendResponse = await submitAssistanceRequest(payload);

      // Handle "waiting_for_location" response (shouldn't happen now, but keep as fallback)
      if (backendResponse.status === "waiting_for_location") {
        setError(backendResponse.message);
        setStatus(AssistanceStatus.ERROR);
        return;
      }

      setStatus(AssistanceStatus.CALCULATING_ETA);
      await delay(800);

      const assignedMechanic: MechanicInfo = {
        name: backendResponse.mechanic_name || "Independent Service",
        distance: "Nearby",
        eta: backendResponse.eta_minutes ? `${backendResponse.eta_minutes} mins` : "15 mins",
        phone: backendResponse.mechanic_phone || "+91 0000000000",
        rating: 4.5,
        capability: (backendResponse.priority === 'emergency' || backendResponse.issue_type === 'accident') ? t.emergency : "Verified Mechanic",
        lat: backendResponse.mechanic_lat,
        lon: backendResponse.mechanic_lon
      };

      setRequest(prev => prev ? { ...prev, mechanic: assignedMechanic } : null);
      setStatus(AssistanceStatus.MECHANIC_ASSIGNED);

    } catch (err: any) {
      console.error(err);
      if (!backendReady) {
        setError("Backend server is not responding. Please make sure to start it using 'npm run start-backend' or 'start.bat'.");
      } else {
        setError(t.errorTitle);
      }
      setStatus(AssistanceStatus.ERROR);
    }
  };


  const handleReset = () => {
    setStatus(AssistanceStatus.IDLE);
    setRequest(null);
    setError(null);
  };

  const setMockLocation = () => {
    // Mock location (Nagpur - Zero Mile Stone)
    const mockLoc = { lat: 21.1458, lng: 79.0882 };
    setUserLoc(mockLoc);
    console.log('📍 Using Mock Location (Nagpur):', mockLoc);
    alert('Mock location set: Nagpur (Zero Mile). Now try requesting help!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fcfaf7] p-4 max-w-lg mx-auto overflow-x-hidden font-sans">
      <Header lang={lang} onLangChange={setLang} />

      {/* Dev Tools - Only for debugging */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-slate-100 rounded-xl mb-4 text-[10px] font-mono text-slate-500 border border-slate-200">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendReady === true ? 'bg-green-500' : backendReady === false ? 'bg-red-500' : 'bg-yellow-500'} ${backendReady !== false ? 'animate-pulse' : ''}`}></span>
          <span>
            {backendReady === true ? 'Backend: Connected (Port 9000)' :
              backendReady === false ? 'Backend: DISCONNECTED (Run start.bat)' :
                'Backend: Checking connection...'}
          </span>
        </div>
        <button
          onClick={setMockLocation}
          className="bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded-md text-slate-700 font-bold transition-colors"
        >
          USE MOCK GPS
        </button>
      </div>


      <main className="w-full space-y-6 mt-4 pb-20">
        {status === AssistanceStatus.IDLE && (
          <RequestForm onSubmit={handleRequestHelp} lang={lang} />
        )}

        {(status !== AssistanceStatus.IDLE) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <LocationStatus status={status} error={error} lang={lang} />

            {request && (
              <DashboardCard
                request={request}
                status={status}
                onCancel={handleReset}
                lang={lang}
                userLocation={userLoc}
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-8 rounded-[2.5rem] text-center shadow-lg">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <i className="fa-solid fa-phone-volume text-3xl"></i>
                </div>
                <p className="text-red-900 font-black text-lg mb-2">{t.errorTitle}</p>
                <p className="text-red-800 font-medium mb-6 text-sm">{error}</p>
                <a href="tel:112" className="block w-full bg-red-600 text-white py-4 rounded-2xl font-bold mb-3 shadow-xl">{t.callEmergency}</a>
                <button
                  onClick={handleReset}
                  className="text-slate-400 font-bold text-sm"
                >
                  {t.tryAgain}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {status === AssistanceStatus.IDLE && (
        <div className="mt-auto py-6 text-center text-slate-400 text-xs">
          <p className="font-bold text-slate-500 mb-1">{t.safetyFirst}</p>
          <p>{t.availableIndia}</p>
        </div>
      )}
    </div>
  );
};

export default App;
