import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationContactSection from '../components/ReservationContactSection';
import TourSelectionSection from '../components/TourSelectionSection';
import DateSelectionSection from '../components/DateSelectionSection';
import TimeSelectionSection from '../components/TimeSelectionSection';
import CompanionFormSection from '../components/CompanionFormSection';
import PaymentModal from '../components/PaymentModal';
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
  showCompanionsSection,
  addCompanion,
  removeCompanion,
  handleCompanionChange,
  errors,
  contactRef,
  tourRef,
  dateRef,
  timeRef
}) => {
  const { t, i18n } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const totalParticipants = 1 + (reservationData.companions?.length || 0);
  const totalPrice = (reservationData.tour.precio_por_persona || 0) * totalParticipants;

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('COP', '').trim();
  };

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
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* Contenido principal condicional: activar/desactivar ventana principal */}
      {!isModalOpen && (
        <>
          {/* Header Titles */}
          <div className="w-full max-w-xl text-center mb-10 pt-16 md:pt-20 relative">
        {/* Theme & Language Selectors */}
        <div className="absolute top-0 right-0 flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm border-2 ${
              theme === 'light' 
                ? 'bg-white border-brand-border text-amber-500 hover:border-amber-400 hover:bg-amber-50/50' 
                : 'bg-dark-bg-card border-dark-border text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/10'
            }`}
            title={theme === 'light' ? t('welcome.switch_dark') || 'Cambiar a modo oscuro' : t('welcome.switch_light') || 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.05 7.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="flex bg-white/50 dark:bg-dark-bg-card/50 p-1.5 rounded-2xl border-2 border-brand-border dark:border-dark-border gap-1.5">
            <button 
              onClick={() => changeLanguage('es')}
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                i18n.language.startsWith('es') 
                  ? 'bg-brand-primary text-white shadow-lg scale-105' 
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary'
              }`}
            >
              ES
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                i18n.language.startsWith('en') 
                  ? 'bg-brand-primary text-white shadow-lg scale-105' 
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary'
              }`}
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

        <div className="section-container">
          <label className="section-title-premium">{t('sections.responsible_info')}</label>
          <ReservationContactSection 
            sectionRef={contactRef}
            data={reservationData.contact}
            onChange={handleContactChange}
            errors={errors}
          />
        </div>
        
        <div className="section-container">
          <label className="section-title-premium">{t('sections.tour')}</label>
          <TourSelectionSection 
            sectionRef={tourRef}
            selectedTourId={reservationData.tour.id_plan}
            onSelect={handleTourSelect}
            errors={errors}
            tours={tours}
            loading={loadingTours}
          />
        </div>
        
        <div className="section-container">
          <label className="section-title-premium">{t('sections.date')}</label>
          <DateSelectionSection 
            sectionRef={dateRef}
            selectedDate={reservationData.date.rawDate}
            onSelect={handleDateSelect}
            errors={errors}
          />
        </div>
        
        <div className="section-container">
          <label className="section-title-premium">{t('sections.time')}</label>
          <TimeSelectionSection 
            sectionRef={timeRef}
            selectedTime={reservationData.time.hora_reserva ? { value: reservationData.time.hora_reserva, label: reservationData.time.label, period: reservationData.time.period } : null}
            onSelect={handleTimeSelect}
            errors={errors}
          />
        </div>

        {/* Sección de Acompañantes */}
        {showCompanionsSection && (
          <div className="section-container">
            <label className="section-title-premium">{t('summary.companions_info') || 'Información de los acompañantes'}</label>
            <CompanionFormSection 
              companions={reservationData.companions}
              onCompanionChange={handleCompanionChange}
              onRemoveCompanion={removeCompanion}
              onAddCompanion={addCompanion}
              errors={errors}
            />
          </div>
        )}

        {/* Botón Continuar */}
        <div className="pt-4">
          <button
            onClick={handleContinue}
            className="btn-animate-continue w-full"
          >
            <div className="dots_border"></div>
            <svg
              className="sparkle"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="path"
                d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z"
              ></path>
            </svg>
            <span className="text_button">{t('welcome.continue')}</span>
            <svg
              className="sparkle"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="path"
                d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z"
              ></path>
            </svg>
          </button>
        </div>

        {/* Resumen Final */}
        {showSummary && (
          <div 
            id="reservation-summary"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10"
          >
            <div className="card-premium p-6 md:p-10 space-y-8">
              <div className="card-accent-line"></div>
              
              <div className="text-center relative pt-4">
                <h3 className="text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight">
                  {t('summary.title')}
                </h3>
                <div className="h-1.5 w-16 bg-brand-primary mx-auto mt-3 rounded-full"></div>
              </div>

              <div className="grid gap-8">
                {/* Datos de Contacto */}
                <div className="space-y-4">
                  <p className="section-title-premium !ml-0">{t('summary.responsible')}</p>
                  <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10">
                    <p className="text-brand-text-main dark:text-dark-text-main font-black text-lg md:text-xl mb-3">{reservationData.contact.nombre_jefe_reserva}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                          <span className="font-bold">{reservationData.contact.tipo_documento}:</span> {reservationData.contact.numero_documento}
                        </p>
                        <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                          <span className="font-bold">{t('welcome.phone_label').replace('*', '')}:</span> {reservationData.contact.telefono_cliente}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                          <span className="font-bold">{t('sections.email')}:</span> {reservationData.contact.correo_contacto}
                        </p>
                        <div className="flex gap-4 pt-1">
                          <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs">
                            <span className="font-black text-brand-primary/60 mr-1">RH:</span> {reservationData.contact.rh}
                          </p>
                          <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs">
                            <span className="font-black text-brand-primary/60 mr-1">PESO:</span> {reservationData.contact.peso_kg}kg
                          </p>
                          <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs">
                            <span className="font-black text-brand-primary/60 mr-1">ALTURA:</span> {reservationData.contact.estatura_m}m
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles de la Experiencia y Fecha */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-4">
                    <p className="section-title-premium !ml-0">{t('summary.experience')}</p>
                    <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10 h-full space-y-4">
                      <div className="space-y-1">
                        <p className="text-brand-text-main dark:text-dark-text-main font-black text-lg md:text-xl leading-tight">
                          {reservationData.tour.tour_reserva}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-primary font-black text-lg">
                            {formatCurrency(reservationData.tour.precio_por_persona)}
                          </span>
                          <span className="text-[10px] font-bold text-brand-text-secondary/60 dark:text-dark-text-secondary/60 uppercase tracking-wider">
                            {t('welcome.price_per_person')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-brand-primary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
                            {t('summary.participants')}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-black text-brand-text-main dark:text-dark-text-main">
                              {totalParticipants} {totalParticipants === 1 ? t('summary.person') : t('summary.people')}
                            </p>
                            <p className="text-[9px] font-bold text-brand-text-secondary/50 dark:text-dark-text-secondary/50 italic">
                              (1 {t('summary.responsible').toLowerCase()} {reservationData.companions.length > 0 ? `+ ${reservationData.companions.length} ${t('summary.companions')}` : ''})
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t-2 border-dashed border-brand-primary/20">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-brand-primary uppercase tracking-[0.2em]">
                              {t('summary.estimated_total')}
                            </span>
                            <div className="text-right">
                              <p className="text-2xl md:text-3xl font-black text-brand-primary leading-none">
                                {formatCurrency(totalPrice)}
                              </p>
                              <span className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                                COP
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 md:pt-0">
                    <p className="section-title-premium !ml-0">{t('summary.date_time')}</p>
                    <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10 h-full flex flex-col justify-center">
                      <p className="text-brand-text-main dark:text-dark-text-main font-black text-base md:text-lg capitalize mb-1">
                        {reservationData.date.rawDate?.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-brand-primary font-black text-xl">
                        {reservationData.time.label}
                      </p>
                      <p className="text-[10px] text-brand-text-secondary/60 dark:text-dark-text-secondary/60 font-black uppercase mt-2 tracking-widest">
                        {reservationData.date.puede_variar_precio ? "⚠️ " + t('summary.subject_to_availability') : "✅ " + t('summary.confirmed')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción del Resumen */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleEditInformation}
                  className="flex-1 py-4 px-6 border-2 border-brand-border dark:border-dark-border hover:border-brand-primary/40 text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('summary.edit')}
                </button>
                <button
                  onClick={handleAddCompanions}
                  className="flex-1 py-4 px-6 bg-brand-light dark:bg-dark-bg-main border-2 border-brand-primary/20 hover:border-brand-primary text-brand-dark dark:text-brand-primary font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                  </svg>
                  {t('summary.add_companions')}
                </button>
              </div>

              {/* Lista de Acompañantes en el Resumen */}
              {reservationData.companions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-brand-light dark:border-dark-border">
                  <p className="section-title-premium !ml-0">
                    {t('summary.registered_companions')} ({reservationData.companions.length})
                  </p>
                  <div className="grid gap-4">
                    {reservationData.companions.map((comp, idx) => (
                      <div key={idx} className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[1.5rem] p-6 border border-brand-primary/10 group hover:border-brand-primary/30 transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-brand-text-main dark:text-dark-text-main font-black text-base uppercase truncate pr-2">{comp.nombre}</p>
                              <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                                {comp.parentesco}
                              </span>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-center gap-2">
                                <span className="w-1 h-1 bg-brand-primary/40 rounded-full"></span>
                                <span className="font-bold">{comp.tipo_documento}:</span> {comp.numero_documento}
                              </p>
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-center gap-2">
                                <span className="w-1 h-1 bg-brand-primary/40 rounded-full"></span>
                                <span className="font-bold">Tel:</span> {comp.telefono}
                              </p>
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-center gap-2 sm:col-span-2 truncate">
                                <span className="w-1 h-1 bg-brand-primary/40 rounded-full"></span>
                                <span className="font-bold">Email:</span> {comp.correo || '---'}
                              </p>
                            </div>

                            <div className="flex gap-4 pt-3 mt-3 border-t border-brand-primary/5">
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-[10px]">
                                <span className="font-black text-brand-primary/40 mr-1 uppercase">RH:</span> {comp.rh}
                              </p>
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-[10px]">
                                <span className="font-black text-brand-primary/40 mr-1 uppercase">PESO:</span> {comp.peso_kg}kg
                              </p>
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-[10px]">
                                <span className="font-black text-brand-primary/40 mr-1 uppercase">ALTURA:</span> {comp.estatura_m}m
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 text-center">
                <p className="text-[11px] text-brand-text-secondary/40 dark:text-dark-text-secondary/40 font-bold uppercase tracking-[0.2em] italic">
                  {t('summary.verify_data_hint')}
                </p>
              </div>

              {/* Botón Proceder al Pago */}
              <div className="pt-6 border-t border-brand-light dark:border-dark-border mt-8">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="btn-animate-continue w-full !bg-brand-primary group relative overflow-hidden"
                >
                  <div className="dots_border !border-white/30"></div>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <svg
                    className="sparkle"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="path !stroke-white"
                      d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z"
                    ></path>
                  </svg>
                  <span className="text_button !text-white flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t('summary.proceed_to_payment')}
                  </span>
                  <svg
                    className="sparkle"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="path !stroke-white"
                      d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        experience={reservationData.tour.tour_reserva}
        participants={totalParticipants}
        totalAmount={totalPrice}
        formatCurrency={formatCurrency}
      />
    </>
  )}

      {/* Footer Info */}
      <p className="mt-10 text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold opacity-40">
        {t('home.experience_adrenaline')}
      </p>
    </div>
  );
};

export default HomePage;
