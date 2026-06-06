import React from 'react';
import { useTranslation } from 'react-i18next';

const TimeSelectionSection = ({ onSelect, selectedTime, schedules = [], loading = false, errors, sectionRef, tipoHora = 'varias_horas' }) => {
  const { t } = useTranslation();
  
  // Si tipoHora es 'sin_hora', no renderizamos nada
  if (tipoHora === 'sin_hora') return null;

  const morningSchedules = schedules.filter(s => s.period === 'mañana');
  const afternoonSchedules = schedules.filter(s => s.period === 'tarde');

  const handleTimeSelect = (time) => {
    if (tipoHora === 'hora_fija') return; // No permitir cambios si es hora fija
    onSelect(time);
  };

  return (
    <div 
      ref={sectionRef}
      className={`card-premium ${errors.time ? 'border-red-400 ring-2 ring-red-50' : ''}`}
    >
      <div className={`card-accent-line ${errors.time ? 'bg-red-400' : ''}`}></div>
      
      <div className="px-6 py-8 md:px-10 md:py-10 space-y-6">
        <div className="space-y-8">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-brand-text-secondary font-medium italic uppercase tracking-widest opacity-60">Cargando horarios...</p>
            </div>
          ) : schedules.length > 0 ? (
            <>
              {/* Morning Section */}
              {morningSchedules.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary/60 dark:text-dark-text-secondary/60 whitespace-nowrap">{t('sections.morning')}</span>
                    <div className="h-[1px] flex-1 bg-brand-border/60 dark:bg-dark-border/60"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
                    {morningSchedules.map((time) => (
                      <button
                        key={time.id || time.value}
                        type="button"
                        disabled={tipoHora === 'hora_fija'}
                        onClick={() => handleTimeSelect(time)}
                        className={`py-4 px-2 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 w-full flex items-center justify-center ${
                          selectedTime?.hora_reserva === time.value || selectedTime?.value === time.value
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                            : tipoHora === 'hora_fija' 
                              ? 'bg-gray-100 dark:bg-dark-bg-main/30 border-brand-border dark:border-dark-border text-gray-400 cursor-not-allowed'
                              : 'bg-brand-light/20 dark:bg-dark-bg-main/50 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main hover:border-brand-primary/50'
                        }`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon Section */}
              {afternoonSchedules.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary/60 dark:text-dark-text-secondary/60 whitespace-nowrap">{t('sections.afternoon')}</span>
                    <div className="h-[1px] flex-1 bg-brand-border/60 dark:bg-dark-border/60"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
                    {afternoonSchedules.map((time) => (
                      <button
                        key={time.id || time.value}
                        type="button"
                        disabled={tipoHora === 'hora_fija'}
                        onClick={() => handleTimeSelect(time)}
                        className={`py-4 px-2 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 w-full flex items-center justify-center ${
                          selectedTime?.hora_reserva === time.value || selectedTime?.value === time.value
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                            : tipoHora === 'hora_fija' 
                              ? 'bg-gray-100 dark:bg-dark-bg-main/30 border-brand-border dark:border-dark-border text-gray-400 cursor-not-allowed'
                              : 'bg-brand-light/20 dark:bg-dark-bg-main/50 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main hover:border-brand-primary/50'
                        }`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center bg-gray-50 dark:bg-dark-bg-main/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-border">
              <p className="text-sm text-brand-text-secondary font-medium italic">No hay horarios disponibles para esta fecha.</p>
            </div>
          )}

          {/* Selection Summary Card */}
          <div className="space-y-4">
            {selectedTime ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 max-w-sm mx-auto w-full">
                <div className="bg-brand-light/30 dark:bg-dark-bg-main/40 border border-brand-primary/20 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-dark-bg-card rounded-2xl border border-brand-primary/10 shadow-sm flex items-center justify-center text-brand-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">Hora seleccionada</p>
                      <p className="text-brand-text-main dark:text-dark-text-main font-bold text-sm md:text-base">
                        {selectedTime.label} 
                        <span className="ml-2 text-xs font-medium text-brand-text-secondary/60 italic">
                          ({selectedTime.period})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-brand-light/10 dark:bg-dark-bg-main/30 border-2 border-dashed border-brand-border dark:border-dark-border rounded-[2.5rem] p-8 text-center max-w-sm mx-auto w-full">
                <p className="text-sm text-brand-text-secondary/60 dark:text-dark-text-secondary/60 font-medium italic">
                  No se ha seleccionado hora aún
                </p>
              </div>
            )}
            {errors.time && <p className="text-[10px] text-red-500 mt-1 ml-6 font-bold uppercase tracking-wider text-center">{errors.time}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionSection;
