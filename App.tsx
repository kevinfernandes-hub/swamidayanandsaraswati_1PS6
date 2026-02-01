
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
  const [status, setStatus] = useState<AssistanceStatus>(AssistanceStatus.IDLE);
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

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
      const location = await getLocation().catch(() => {
        return { lat: 0, lng: 0 }; 
      });
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
      await delay(1500);
      
      if (Math.random() > 0.6) {
        setStatus(AssistanceStatus.EXPANDING_SEARCH);
        await delay(2000);
      }

      setStatus(AssistanceStatus.CALCULATING_ETA);
      await delay(1200);

      const mockMechanicNames = {
        en: "Reliable Auto Care",
        hi: "भरोसेमंद ऑटो केयर",
        mr: "विश्वासू ऑटो केअर"
      };

      const mockMechanic: MechanicInfo = {
        name: mockMechanicNames[lang],
        distance: "2.5 km",
        eta: "12 mins",
        phone: "+91 9876543210",
        rating: 4.8,
        capability: analysis.severity === 'Critical' ? t.emergency : "Expert Mechanic"
      };
      
      setRequest(prev => prev ? { ...prev, mechanic: mockMechanic } : null);
      setStatus(AssistanceStatus.MECHANIC_ASSIGNED);

    } catch (err: any) {
      console.error(err);
      setError(t.errorTitle);
      setStatus(AssistanceStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AssistanceStatus.IDLE);
    setRequest(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fcfaf7] p-4 max-w-lg mx-auto overflow-x-hidden font-sans">
      <Header lang={lang} onLangChange={setLang} />
      
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
