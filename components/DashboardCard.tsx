
import React from 'react';
import { AssistanceStatus, AssistanceRequest, Language } from '../types';
import { translations } from '../translations';
import MapDisplay from './MapDisplay';

interface DashboardCardProps {
  request: AssistanceRequest;
  status: AssistanceStatus;
  onCancel: () => void;
  lang: Language;
  userLocation: { lat: number; lng: number };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ request, status, onCancel, lang, userLocation }) => {
  const t = translations[lang];
  const isAssigned = status === AssistanceStatus.MECHANIC_ASSIGNED;

  const steps = [
    { key: AssistanceStatus.ANALYZING_ISSUE, label: t.steps.analyze, icon: 'fa-magnifying-glass' },
    { key: AssistanceStatus.FILTERING_MECHANICS, label: t.steps.filter, icon: 'fa-user-gear' },
    { key: AssistanceStatus.CALCULATING_ETA, label: t.steps.route, icon: 'fa-road' },
  ];

  const getStepStatus = (stepKey: AssistanceStatus) => {
    const statusOrder = [
      AssistanceStatus.ANALYZING_ISSUE,
      AssistanceStatus.FILTERING_MECHANICS,
      AssistanceStatus.CALCULATING_ETA,
      AssistanceStatus.MECHANIC_ASSIGNED
    ];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepKey);
    if (currentIndex > stepIndex) return 'complete';
    if (currentIndex === stepIndex) return 'loading';
    return 'pending';
  };

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
      <div className={`p-6 transition-colors duration-500 ${isAssigned ? 'bg-green-50' : 'bg-orange-50'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${isAssigned ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
            {status === AssistanceStatus.EXPANDING_SEARCH ? t.expanding :
              isAssigned ? t.assigned : 'Processing...'}
          </span>
          {status === AssistanceStatus.EXPANDING_SEARCH && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-100 rounded-lg text-yellow-800 text-[10px] font-bold">
              <i className="fa-solid fa-expand animate-pulse"></i>
              {t.expanding}
            </div>
          )}
        </div>
        <h3 className="text-2xl font-black text-slate-800 leading-tight">
          {isAssigned ? t.assigned : t.connecting}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {!isAssigned && (
          <div className="space-y-4">
            {steps.map((step) => {
              const stepStatus = getStepStatus(step.key);
              return (
                <div key={step.key} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${stepStatus === 'complete' ? 'bg-green-600 text-white' :
                    stepStatus === 'loading' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100 pulse' : 'bg-slate-100 text-slate-300'
                    }`}>
                    <i className={`fa-solid ${stepStatus === 'complete' ? 'fa-check' : step.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold transition-colors ${stepStatus === 'pending' ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                      {step.label}
                    </p>
                    {stepStatus === 'loading' && (
                      <div className="h-1 w-24 bg-orange-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-orange-500 w-1/2 animate-[progress_1.5s_infinite]"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isAssigned && request.mechanic && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            {request.mechanic.lat && request.mechanic.lon && (
              <MapDisplay
                userLoc={userLocation}
                mechanicLoc={{ lat: request.mechanic.lat, lng: request.mechanic.lon }}
                mechanicName={request.mechanic.name}
              />
            )}

            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.mechanic.name}`} alt="Avatar" className="w-full h-full bg-orange-100" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
                  <i className="fa-solid fa-check"></i>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-black text-xl leading-tight">{request.mechanic.name}</p>
                <p className="text-orange-600 text-[10px] font-black uppercase tracking-wider">{request.mechanic.capability}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex text-yellow-400 text-[10px]">
                    {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{t.verified}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-2">{t.distance}</p>
                <i className="fa-solid fa-truck-pickup text-slate-300 mb-1 text-lg"></i>
                <p className="text-slate-800 font-black text-lg">{request.mechanic.distance}</p>
              </div>
              <div className="bg-orange-500 p-5 rounded-3xl text-white flex flex-col items-center text-center shadow-xl shadow-orange-100">
                <p className="text-orange-100 text-[10px] font-black uppercase mb-2">{t.eta}</p>
                <i className="fa-solid fa-motorcycle mb-1 text-lg text-orange-200"></i>
                <p className="font-black text-lg">{request.mechanic.eta}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <a
                  href={`tel:${request.mechanic.phone}`}
                  className="flex-[2] bg-green-600 hover:bg-green-700 active:scale-95 text-white font-black py-5 rounded-3xl text-center shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all"
                >
                  <i className="fa-solid fa-phone-flip text-xl"></i>
                  {t.callBtn}
                </a>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 font-bold py-5 rounded-3xl transition-all"
                >
                  {t.cancelBtn}
                </button>
              </div>

              {request.location && (
                <a
                  href={`https://wa.me/${request.mechanic.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(
                    `HELP! I am stuck and need assistance. \nIssue: ${request.issueType}\nMy Location: https://www.google.com/maps?q=${request.location.lat},${request.location.lng}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] active:scale-95 text-white font-black py-4 rounded-3xl text-center shadow-lg flex items-center justify-center gap-3 transition-all"
                >
                  <i className="fa-brands fa-whatsapp text-2xl"></i>
                  SEND LOCATION VIA WHATSAPP
                </a>
              )}
            </div>
          </div>
        )}

        {request.issueType && (
          <div className="pt-4 border-t border-dashed border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.loggedProb}</p>
                <p className="text-slate-700 font-bold">{request.issueType}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.priority}</p>
                <p className={`font-bold ${request.severity === 'Critical' ? 'text-red-600' : 'text-orange-500'}`}>
                  {request.severity === 'Critical' ? t.emergency : 'Priority'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
