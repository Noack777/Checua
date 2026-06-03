import React from 'react';
import { useTranslation } from 'react-i18next';
import ReservationContactSection from '../components/ReservationContactSection';
import TourSelectionSection from '../components/TourSelectionSection';
import DateSelectionSection from '../components/DateSelectionSection';
import TimeSelectionSection from '../components/TimeSelectionSection';
import WelcomeModal from '../components/WelcomeModal';

const HomePage = ({
  isModalOpen,
  onModalComplete,
  onCloseModal,
  onOpenModal,
  theme,
  toggleTheme,
  tours,
  loadingTours,
  reservationData,
  handleContactChange,
  handleTourSelect,
  handleDateSelect,
  handleTimeSelect,
  handleContinue,
  showSummary,
  handleEditInformation,
  handleAddCompanions,
  showCompanionsNotice,
  errors,
  contactRef,
  tourRef,
  dateRef,
  timeRef
}) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-brand-light/40 dark:from-dark-bg-main dark:to-dark-bg-main py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300 ${isModalOpen ? 'overflow-hidden h-screen' : ''}`}>
      <WelcomeModal 
        isOpen={isModalOpen} 
        onComplete={onModalComplete} 
        onClose={onCloseModal}
        tours={tours}
        loading={loadingTours}
        initialPhone={reservationData.contact.telefono_cliente}
        initialTourId={reservationData.tour.id_plan}
      />
      
      {/* Header Titles */}
      <div className="w-full max-w-xl text-center mb-8 relative">
        {/* Theme & Language Selectors */}
        <div className="absolute -top-4 right-0 flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-dark-bg-card border border-brand-border dark:border-dark-border text-brand-primary transition-all shadow-sm hover:scale-110"
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.05 7.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => changeLanguage('es')}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${i18n.language.startsWith('es') ? 'bg-brand-primary text-white shadow-md' : 'bg-white dark:bg-dark-bg-card text-brand-text-secondary dark:text-dark-text-secondary border border-brand-border dark:border-dark-border hover:border-brand-primary'}`}
            >
              ES
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${i18n.language.startsWith('en') ? 'bg-brand-primary text-white shadow-md' : 'bg-white dark:bg-dark-bg-card text-brand-text-secondary dark:text-dark-text-secondary border border-brand-border dark:border-dark-border hover:border-brand-primary'}`}
            >
              EN
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-brand-text-main dark:text-dark-text-main uppercase leading-none">
          {t('home.title')}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="h-[1px] w-6 bg-brand-primary opacity-60"></div>
          <h2 className="text-base md:text-lg font-bold tracking-[0.2em] text-brand-dark dark:text-brand-primary uppercase">
            {t('home.subtitle')}
          </h2>
          <div className="h-[1px] w-6 bg-brand-primary opacity-60"></div>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-6">
        {/* Botón para volver al Welcome Modal */}
        {!isModalOpen && (
          <div className="flex justify-start">
            <button
              onClick={onOpenModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors group"
            >
              <svg 
                className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
               </svg>
               {t('welcome.change_plan')}
             </button>
           </div>
        )}

        <ReservationContactSection 
          sectionRef={contactRef}
          data={reservationData.contact}
          onChange={handleContactChange}
          errors={errors}
        />
        
        <TourSelectionSection 
          sectionRef={tourRef}
          selectedTourId={reservationData.tour.id_plan}
          onSelect={handleTourSelect}
          errors={errors}
          tours={tours}
          loading={loadingTours}
        />
        
        <DateSelectionSection 
          sectionRef={dateRef}
          selectedDate={reservationData.date.rawDate}
          onSelect={handleDateSelect}
          errors={errors}
        />
        
        <TimeSelectionSection 
          sectionRef={timeRef}
          selectedTime={reservationData.time.hora_reserva ? { value: reservationData.time.hora_reserva, label: reservationData.time.label, period: reservationData.time.period } : null}
          onSelect={handleTimeSelect}
          errors={errors}
        />

        {/* Botón Continuar */}
        <div className="pt-4">
          <button
            onClick={handleContinue}
            className="w-full py-4 px-8 bg-brand-primary hover:bg-brand-dark text-white font-black text-lg rounded-full shadow-lg shadow-brand-primary/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
          >
            {t('welcome.continue')}
          </button>
        </div>

        {/* Resumen Final */}
        {showSummary && (
          <div 
            id="reservation-summary"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6"
          >
            <div className="bg-brand-light/30 border-2 border-brand-primary/20 rounded-[2rem] p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16"></div>
              
              <div className="text-center relative">
                <h3 className="text-xl md:text-2xl font-black text-brand-text-main uppercase tracking-tight">
                  {t('summary.title')}
                </h3>
                <div className="h-1 w-12 bg-brand-primary mx-auto mt-2 rounded-full"></div>
              </div>

              <div className="grid gap-6">
                {/* Datos de Contacto */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t('summary.responsible')}</p>
                  <div className="bg-white/60 rounded-2xl p-4 border border-brand-border/50">
                    <p className="text-brand-text-main font-bold text-base">{reservationData.contact.nombre_jefe_reserva}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-brand-text-secondary text-sm flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
                        {reservationData.contact.telefono_cliente}
                      </p>
                      <p className="text-brand-text-secondary text-sm flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
                        {reservationData.contact.correo_contacto}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles de la Experiencia */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t('summary.experience')}</p>
                    <div className="bg-white/60 rounded-2xl p-4 border border-brand-border/50 h-full">
                      <p className="text-brand-text-main font-bold text-sm leading-tight">{reservationData.tour.tour_reserva}</p>
                      <p className="text-brand-primary font-black text-lg mt-1">
                        ${reservationData.tour.precio_por_persona?.toLocaleString('es-CO')}
                        <span className="text-[10px] ml-1 font-bold text-brand-text-secondary uppercase">COP</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t('summary.date_time')}</p>
                    <div className="bg-white/60 rounded-2xl p-4 border border-brand-border/50 h-full">
                      <p className="text-brand-text-main font-bold text-sm capitalize">
                        {reservationData.date.rawDate?.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-brand-dark font-black text-base mt-0.5">
                        {reservationData.time.label}
                      </p>
                      <p className="text-[10px] text-brand-text-secondary font-bold uppercase mt-1">
                        {reservationData.date.puede_variar_precio ? "⚠️ " + t('summary.subject_to_availability') : "✅ " + t('summary.confirmed')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción del Resumen */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleEditInformation}
                  className="flex-1 py-3 px-6 border-2 border-brand-border hover:border-brand-primary/40 text-brand-text-secondary hover:text-brand-dark font-bold text-sm rounded-full transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('summary.edit')}
                </button>
                <button
                  onClick={handleAddCompanions}
                  className="flex-1 py-3 px-6 bg-brand-light border-2 border-brand-primary/20 hover:border-brand-primary text-brand-dark font-bold text-sm rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {t('summary.add_companions')}
                </button>
              </div>

              {/* Aviso Temporal de Acompañantes */}
              {showCompanionsNotice && (
                <div 
                  id="companions-notice"
                  className="animate-in fade-in zoom-in-95 duration-300 bg-white/80 border border-brand-primary/30 rounded-2xl p-4 text-center shadow-sm"
                >
                  <p className="text-xs md:text-sm font-medium text-brand-dark">
                    <span className="mr-2">✨</span>
                    {t('summary.companions_notice')}
                  </p>
                </div>
              )}

              <div className="pt-4 text-center">
                <p className="text-[11px] text-brand-text-secondary font-medium italic">
                  {t('summary.verify_data_hint')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <p className="mt-10 text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold opacity-40">
        {t('home.experience_adrenaline')}
      </p>
    </div>
  );
};

export default HomePage;
