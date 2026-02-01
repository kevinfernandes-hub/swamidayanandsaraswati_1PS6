
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface RequestFormProps {
  onSubmit: (description: string, isPanic: boolean) => void;
  lang: Language;
}

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, lang }) => {
  const [description, setDescription] = useState('');
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description, false);
    }
  };

  const handlePanic = () => {
    onSubmit('', true);
  };

  return (
    <section className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between items-end mb-3 px-1">
              <label htmlFor="problem" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                {t.problemLabel}
              </label>
            </div>
            <div className="relative">
              <textarea
                id="problem"
                rows={3}
                className="w-full p-5 rounded-3xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 text-lg font-medium placeholder:text-slate-300 transition-all resize-none shadow-inner"
                placeholder={t.placeholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="absolute right-4 bottom-4 text-slate-300">
                <i className="fa-solid fa-microphone text-orange-400"></i>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!description.trim()}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-6 rounded-3xl text-xl shadow-2xl shadow-slate-200 active:scale-[0.97] transition-all flex items-center justify-center gap-4 group"
          >
            <i className="fa-solid fa-wrench text-orange-400 group-hover:rotate-12 transition-transform"></i>
            {t.requestBtn}
          </button>
        </form>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200"></span>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
          <span className="bg-[#fcfaf7] px-4 text-slate-400 uppercase">{t.emergency}</span>
        </div>
      </div>

      <div className="px-2">
        <button
          onClick={handlePanic}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-3xl text-xl shadow-2xl shadow-red-100 active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-1 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-[-20deg]"></div>
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-red-200 group-hover:animate-bounce"></i>
            {t.panicBtn}
          </div>
          <span className="text-[10px] text-red-100 font-bold uppercase tracking-wider opacity-80">{t.panicSub}</span>
        </button>
        <div className="mt-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 flex gap-3 items-center">
          <i className="fa-solid fa-info-circle text-orange-400"></i>
          <p className="text-[11px] text-orange-900 font-medium leading-tight">
            {t.emergencyNote}
          </p>
        </div>
      </div>
    </section>
  );
};

export default RequestForm;
