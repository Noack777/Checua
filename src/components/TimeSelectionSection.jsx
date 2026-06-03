import React from 'react';
import { useTranslation } from 'react-i18next';

const MORNING_HOURS = [
  { label: '9:30 AM', value: '09:30', period: 'mañana' },
  { label: '10:30 AM', value: '10:30', period: 'mañana' },
];

const AFTERNOON_HOURS = [
  { label: '1:30 PM', value: '13:30', period: 'tarde' },
  { label: '2:30 PM', value: '14:30', period: 'tarde' },
];

const TimeSelectionSection = ({ onSelect, selectedTime, errors, sectionRef }) => {
  const { t } = useTranslation();
  const handleTimeSelect = (time) => {
    onSelect(time);
  };

  return (
    <div 
      ref={sectionRef}
      className={`w-full max-w-xl bg-white dark:bg-dark-bg-card rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border transition-all duration-300 relative ${
        errors.time ? 'border-red-400 ring-2 ring-red-50' : 'border-brand-border dark:border-dark-border'
      }`}
    >
      {/* Visual Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] ${errors.time ? 'bg-red-400' : 'bg-brand-primary'}`}></div>
      
      <div className="px-5 py-6 md:p-10 space-y-6">
        <div>
          <h3 className="text-base md:text-lg font-bold text-brand-text-main dark:text-dark-text-main flex items-center gap-2">
            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${
              errors.time ? 'bg-red-100 text-red-600' : 'bg-brand-light dark:bg-dark-bg-main text-brand-dark dark:text-brand-primary'
            }`}>4</span>
            {t('sections.time_selection_title')}
            <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
          </h3>
          <p className="text-sm md:text-base text-brand-text-secondary dark:text-dark-text-secondary mt-1.5 ml-0 md:ml-9">
            {t('sections.time_selection_desc')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Morning Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary/60 dark:text-dark-text-secondary/60 whitespace-nowrap">{t('sections.morning')}</span>
              <div className="h-[1px] flex-1 bg-brand-border/60 dark:bg-dark-border/60"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
              {MORNING_HOURS.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`py-3.5 px-2 rounded-full text-xs sm:text-sm md:text-base font-bold transition-all duration-300 border-2 w-full flex items-center justify-center ${
                    selectedTime?.value === time.value
                      ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]'
                      : 'bg-white dark:bg-dark-bg-main/50 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main hover:border-brand-primary/50'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Afternoon Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary/60 dark:text-dark-text-secondary/60 whitespace-nowrap">{t('sections.afternoon')}</span>
              <div className="h-[1px] flex-1 bg-brand-border/60 dark:bg-dark-border/60"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
              {AFTERNOON_HOURS.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`py-3.5 px-2 rounded-full text-xs sm:text-sm md:text-base font-bold transition-all duration-300 border-2 w-full flex items-center justify-center ${
                    selectedTime?.value === time.value
                      ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]'
                      : 'bg-white dark:bg-dark-bg-main/50 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main hover:border-brand-primary/50'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hidden input for backend compatibility */}
          <input 
            type="hidden" 
            name="hora_reserva" 
            value={selectedTime ? selectedTime.value : ''} 
          />

          {/* Selection Summary Card */}
          {selectedTime && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 max-w-sm mx-auto w-full">
              <div className="bg-brand-light/50 border border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">Hora seleccionada</p>
                  <p className="text-brand-text-main font-bold text-sm md:text-base">
                    {selectedTime.label} 
                    <span className="ml-2 text-xs font-medium text-brand-text-secondary italic">
                      ({selectedTime.period})
                    </span>
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-brand-primary/10">
                  <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          {errors.time && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider text-center">{errors.time}</p>}
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionSection;
