
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, onLangChange }) => {
  const t = translations[lang];

  return (
    <header className="w-full py-4 px-2 relative z-50">
      {/* Antigravity Floating Language Switcher */}
      <div className="flex justify-center mb-8">
        <div className="antigravity flex bg-white/70 backdrop-blur-md p-1.5 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-white/50">
          {(['en', 'hi', 'mr'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`relative px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-500 overflow-hidden ${
                lang === l 
                  ? 'text-white scale-105 z-10' 
                  : 'text-slate-400 hover:text-slate-600 hover:scale-105'
              }`}
            >
              {/* Active Background Slide Effect */}
              {lang === l && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-saffron animate-in fade-in zoom-in duration-300 -z-10 shadow-inner"></div>
              )}
              {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center animate-in slide-in-from-top-4 duration-700 delay-150">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="bg-saffron p-2.5 rounded-2xl text-white shadow-xl shadow-orange-100 rotate-[-3deg] hover:rotate-0 transition-transform">
            <i className="fa-solid fa-car-on text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Smart <span className="text-saffron">Roadside</span>
          </h1>
        </div>
        <p className="text-slate-600 text-sm font-bold opacity-80">
          {t.subtitle}
        </p>
        <div className="mt-3 flex justify-center items-center gap-3">
          <span className="h-[2px] w-6 bg-orange-400 rounded-full"></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.madeFor}</span>
          <span className="h-[2px] w-6 bg-green-600 rounded-full"></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
