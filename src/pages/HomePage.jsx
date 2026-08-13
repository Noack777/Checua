import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationContactSection from '../components/ReservationContactSection';
import TourSelectionSection from '../components/TourSelectionSection';
import DateSelectionSection from '../components/DateSelectionSection';
import TimeSelectionSection from '../components/TimeSelectionSection';
import CompanionFormSection from '../components/CompanionFormSection';
import PaymentModal from '../components/PaymentModal';
import WelcomeModal from '../components/WelcomeModal';
import { saveParticipantsForReservation } from '../services/participantService';
import { createReservation } from '../services/reservationService';
import { getCountryName } from '../utils/countries';
import { CountryFlagImg } from '../utils/CountryFlagImg.jsx';

const HomePage = ({
  isModalOpen,
  onModalComplete,
  onCloseModal,
  onOpenModal,
  theme,
  toggleTheme,
  tours,
  loadingData,
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
  const [isSaving, setIsSaving] = useState(false);

  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const handleProceedToPayment = async () => {
    setIsSaving(true);
    try {
      const normalizePhoneForParticipant = (phone) => {
        if (!phone) return ''
        return phone.toString().replace(/\s+/g, '').replace(/^\+/, '')
      }

      const totalParticipants = 1 + (reservationData.companions?.length || 0);
      const totalPrice = (reservationData.tour.precio_por_persona || 0) * totalParticipants;

      const reservationPayload = {
        id_plan: reservationData.tour.id_plan,
        telefono_cliente: reservationData.contact.telefono_cliente,
        cantidad_personas: totalParticipants,
        aprobado: false,
        fecha_solicitud: new Date().toISOString(),
        fecha_aprobacion: null
      };

      const { data: reservationCreated, error: reservationError } = await createReservation(reservationPayload);

      if (reservationError) {
        console.error('Error al crear la reserva en Supabase:', reservationError);
        alert('Hubo un error al crear la reserva. Por favor intenta de nuevo.');
        return;
      }

      const reservationId = reservationCreated?.id_reserva
      if (!reservationId) {
        console.error('Reserva creada sin id_reserva:', reservationCreated);
        alert('No se pudo obtener el identificador de la reserva. Por favor intenta de nuevo.');
        return;
      }

      const headParticipant = {
        telefono_cliente: reservationData.contact.telefono_cliente,
        nombre: reservationData.contact.nombre_jefe_reserva,
        tipo_documento: reservationData.contact.tipo_documento,
        numero_documento: reservationData.contact.numero_documento,
        telefono_participante: normalizePhoneForParticipant(reservationData.contact.telefono_cliente),
        correo: reservationData.contact.correo_contacto,
        nacionalidad: reservationData.contact.nacionalidad,
        edad: calculateAge(reservationData.contact.fecha_nacimiento)
      };

      const companionsParticipants = (reservationData.companions || []).map(companion => ({
        telefono_cliente: reservationData.contact.telefono_cliente,
        nombre: companion.nombre,
        tipo_documento: companion.tipo_documento,
        numero_documento: companion.numero_documento,
        telefono_participante: companion.telefono,
        correo: companion.correo,
        nacionalidad: companion.nacionalidad,
        edad: calculateAge(companion.fecha_nacimiento)
      }));

      const participantsToSave = [headParticipant, ...companionsParticipants];

      const { data, error } = await saveParticipantsForReservation(participantsToSave, reservationId);

      if (error) {
        console.error('Error al guardar participantes en Supabase:', error);
        alert('Hubo un error al guardar la información de los participantes. Por favor intenta de nuevo.');
        return;
      }

      console.log('Reserva creada:', reservationCreated);
      console.log('Participantes guardados:', data);
      console.log('Total:', totalPrice);

      setIsPaymentModalOpen(true);
    } catch (err) {
      console.error('Error inesperado al procesar participantes:', err);
      alert('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalParticipants = 1 + (reservationData.companions?.length || 0);
  const totalPrice = (reservationData.tour.precio_por_persona || 0) * totalParticipants;
  const depositAmount = Math.round(totalPrice * 0.3);
  const remainingAmount = totalPrice - depositAmount;

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('COP', '').trim();
  };

  const formatCOP = (amount) => {
    const safeAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
    return `$${safeAmount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`;
  };

  const getTimeParts = (timeStr) => {
    if (!timeStr) return null;
    const raw = String(timeStr).trim();
    const [h, m] = raw.split(':');
    const hour = Number.parseInt(h, 10);
    const minute = Number.parseInt(m ?? '0', 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return { hour, minute };
  };

  const formatTime12h = (timeStr) => {
    const parts = getTimeParts(timeStr);
    if (!parts) return '';
    const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
    const mm = String(parts.minute).padStart(2, '0');
    return `${hour12}:${mm}`;
  };

  const getMeridiem = (timeStr) => {
    const parts = getTimeParts(timeStr);
    if (!parts) return '';
    return parts.hour < 12 ? 'AM' : 'PM';
  };

  const getPlanEmoji = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('sender')) return '🌵';
    if (name.includes('desiert')) return '🏜️';
    if (name.includes('atv') || name.includes('cuatrimoto')) return '🏍️';
    if (name.includes('cabalg')) return '🐎';
    if (name.includes('camin') || name.includes('trek')) return '🥾';
    return '✨';
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-brand-light/40 dark:from-dark-bg-main dark:to-dark-bg-main py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300 ${isModalOpen ? 'overflow-hidden h-screen' : ''}`}>
      {isModalOpen ? (
        <WelcomeModal 
          isOpen={isModalOpen} 
          onComplete={onModalComplete} 
          onClose={onCloseModal}
          tours={tours}
          loading={loadingData}
          initialPhone={reservationData.contact.telefono_cliente}
          initialTourId={reservationData.tour.id_plan}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : null}
      
      {/* Contenido principal condicional: activar/desactivar ventana principal */}
      {!isModalOpen && (
        <>
          {/* Header Titles */}
          <div className="w-full max-w-xl text-center mb-10 pt-16 md:pt-20 relative">
        {/* Theme & Language Selectors */}
        <div className="flex items-center justify-center gap-3 flex-wrap sm:absolute sm:top-0 sm:right-0">
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
            loading={loadingData}
          />
        </div>
        
        <div className="section-container">
          <label className="section-title-premium">{t('sections.date')}</label>
          <DateSelectionSection 
            sectionRef={dateRef}
            selectedDate={reservationData.date.rawDate}
            onSelect={handleDateSelect}
            errors={errors}
            availableDates={reservationData.tour.availableDates}
            tipoFecha={reservationData.tour.tipo_fecha}
          />
        </div>
        
        <div className="section-container">
          <label className="section-title-premium">{t('sections.time')}</label>
          <TimeSelectionSection 
            sectionRef={timeRef}
            selectedTime={reservationData.time}
            onSelect={handleTimeSelect}
            schedules={reservationData.tour.availableHours}
            loading={loadingData}
            errors={errors}
            tipoHora={reservationData.tour.tipo_hora}
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
                    <p className="text-brand-text-main dark:text-dark-text-main font-black text-lg md:text-xl mb-3 break-words whitespace-normal">
                      {reservationData.contact.nombre_jefe_reserva}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm flex items-start gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 shrink-0"></span>
                          <span className="font-bold shrink-0">{reservationData.contact.tipo_documento}:</span>
                          <span className="min-w-0 break-all">{reservationData.contact.numero_documento}</span>
                        </p>
                        <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm flex items-start gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 shrink-0"></span>
                          <span className="font-bold shrink-0">{t('welcome.phone_label').replace('*', '')}:</span>
                          <span className="min-w-0 break-all">{reservationData.contact.telefono_cliente}</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm flex items-start gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 shrink-0"></span>
                          <span className="font-bold shrink-0">{t('sections.email')}:</span>
                          <span className="min-w-0 break-all">{reservationData.contact.correo_contacto}</span>
                        </p>
                        <div className="flex gap-3 sm:gap-4 pt-1 flex-wrap">
                          {calculateAge(reservationData.contact.fecha_nacimiento) !== null && (
                            <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 shrink-0"></span>
                              <span className="font-black text-brand-primary/70 mr-1">{t('sections.age').toUpperCase()}:</span>
                              <span className="font-black text-brand-dark dark:text-brand-primary">
                                {calculateAge(reservationData.contact.fecha_nacimiento)} {t('sections.age_suffix')}
                              </span>
                            </p>
                          )}
                          {reservationData.contact.nacionalidad && (
                            <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 shrink-0"></span>
                              <span className="font-black text-brand-primary/70 mr-1">{t('sections.nationality').toUpperCase()}:</span>
                              <CountryFlagImg value={reservationData.contact.nacionalidad} size="w40" alt="" className="!w-5 !h-5 rounded-full" />
                              <span className="font-black text-brand-dark dark:text-brand-primary ml-1">
                                {getCountryName(reservationData.contact.nacionalidad)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles de la Experiencia y Fecha */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
                  <div className="space-y-4">
                    <p className="section-title-premium !ml-0">{t('summary.experience')}</p>
                    <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10 h-full space-y-4">
                      <div className="space-y-1">
                        <p className="text-brand-text-main dark:text-dark-text-main font-black text-base sm:text-lg md:text-xl leading-snug break-words whitespace-normal">
                          <span className="mr-2">{getPlanEmoji(reservationData.tour.tour_reserva)}</span>
                          <span className="uppercase">{reservationData.tour.tour_reserva}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-primary font-black text-lg">
                            {formatCurrency(reservationData.tour.precio_por_persona)}
                          </span>
                          <span className="text-[10px] font-bold text-brand-text-secondary/60 dark:text-dark-text-secondary/60 uppercase tracking-wider">
                            PRECIO POR PERSONA
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-brand-primary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
                            PARTICIPANTES
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-black text-brand-text-main dark:text-dark-text-main">
                              {totalParticipants} Persona(s)
                            </p>
                            <p className="text-[9px] font-bold text-brand-text-secondary/50 dark:text-dark-text-secondary/50 italic">
                              ({totalParticipants} responsable(s))
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t-2 border-dashed border-brand-primary/20">
                          <div className="text-center text-brand-primary/60 font-black tracking-[0.2em] text-[10px] select-none whitespace-nowrap overflow-hidden">
                            ──────────────────────────
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-black text-brand-primary uppercase tracking-[0.2em]">
                              TOTAL ESTIMADO
                            </span>
                            <div className="text-right">
                              <p className="text-xl md:text-2xl font-black text-brand-primary leading-none">
                                {formatCOP(totalPrice)}
                              </p>
                            </div>
                          </div>
                          <div className="text-center text-brand-primary/60 font-black tracking-[0.2em] text-[10px] select-none pt-2 whitespace-nowrap overflow-hidden">
                            ──────────────────────────
                          </div>

                          <div className="pt-5 space-y-4">
                            <p className="text-xs font-black text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
                              INFORMACION DE PAGO
                            </p>

                            <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-medium leading-relaxed">
                              Tu reserva se puede confirmar pagando desde el 30% del valor total.
                            </p>

                            <div className="space-y-2">
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                                <span className="text-[10px] sm:text-[11px] font-black text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider break-words leading-snug">
                                  VALOR TOTAL DE LA RESERVA:
                                </span>
                                <span className="text-[11px] font-black text-brand-text-main dark:text-dark-text-main whitespace-nowrap">
                                  {formatCOP(totalPrice)}
                                </span>
                              </div>
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                                <span className="text-[10px] sm:text-[11px] font-black text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider break-words leading-snug">
                                  ABONO MINIMO PARA CONFIRMAR:
                                </span>
                                <span className="text-[11px] font-black text-brand-primary whitespace-nowrap">
                                  {formatCOP(depositAmount)}
                                </span>
                              </div>
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                                <span className="text-[10px] sm:text-[11px] font-black text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider break-words leading-snug">
                                  SALDO RESTANTE EL DIA DEL EVENTO:
                                </span>
                                <span className="text-[11px] font-black text-brand-text-main dark:text-dark-text-main whitespace-nowrap">
                                  {formatCOP(remainingAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-brand-text-secondary dark:text-dark-text-secondary font-medium leading-relaxed">
                              <p>El abono del 30% garantiza tu cupo.</p>
                              <p>El saldo restante se cancela el dia de la actividad.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="section-title-premium !ml-0">{t('summary.date_time')}</p>
                    <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10 space-y-3 self-start">
                      <p className="text-brand-text-main dark:text-dark-text-main font-black text-sm sm:text-base md:text-lg capitalize leading-snug break-words whitespace-normal">
                        {reservationData.date.rawDate?.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      {reservationData.time?.label ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="text-brand-primary font-black text-xl md:text-2xl leading-none">
                            {formatTime12h(reservationData.time.label)}
                          </p>
                          <span className="text-[10px] font-black uppercase text-brand-text-secondary/50 dark:text-dark-text-secondary/50 tracking-widest">
                            {getMeridiem(reservationData.time.label)}
                          </span>
                        </div>
                      ) : null}
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
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-start gap-2 min-w-0">
                                <span className="w-1 h-1 bg-brand-primary/40 rounded-full mt-1.5 shrink-0"></span>
                                <span className="font-bold shrink-0">{comp.tipo_documento}:</span>
                                <span className="min-w-0 break-all">{comp.numero_documento}</span>
                              </p>
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-start gap-2 min-w-0">
                                <span className="w-1 h-1 bg-brand-primary/40 rounded-full mt-1.5 shrink-0"></span>
                                <span className="font-bold shrink-0">Tel:</span>
                                <span className="min-w-0 break-all">{comp.telefono}</span>
                              </p>
                              <p className="text-brand-text-secondary dark:text-dark-text-secondary text-xs flex items-start gap-2 sm:col-span-2 min-w-0">
                                <span className="w-1 h-1 bg-brand-primary/40 rounded-full mt-1.5 shrink-0"></span>
                                <span className="font-bold shrink-0">Email:</span>
                                <span className="min-w-0 break-all">{comp.correo || '---'}</span>
                              </p>
                            </div>

                            <div className="flex gap-3 sm:gap-4 pt-3 mt-3 border-t border-brand-primary/5 flex-wrap">
                              {calculateAge(comp.fecha_nacimiento) !== null && (
                                <p className="text-brand-text-secondary dark:text-dark-text-secondary text-[10px] flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-brand-primary/30 shrink-0"></span>
                                  <span className="font-black text-brand-primary/50 mr-1 uppercase">{t('sections.age')}:</span>
                                  <span className="font-black text-brand-dark/80 dark:text-brand-primary/90">
                                    {calculateAge(comp.fecha_nacimiento)} {t('sections.age_suffix')}
                                  </span>
                                </p>
                              )}
                              {comp.nacionalidad && (
                                <p className="text-brand-text-secondary dark:text-dark-text-secondary text-[10px] flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-brand-primary/30 shrink-0"></span>
                                  <span className="font-black text-brand-primary/50 mr-1 uppercase">{t('sections.nationality')}:</span>
                                  <CountryFlagImg value={comp.nacionalidad} size="w40" alt="" className="!w-4 !h-4 rounded-full" />
                                  <span className="font-black text-brand-dark/80 dark:text-brand-primary/90 ml-1">
                                    {getCountryName(comp.nacionalidad)}
                                  </span>
                                </p>
                              )}
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

              <div className="pt-6 text-center">
                <p className="text-sm text-brand-text-main dark:text-dark-text-main font-black">
                  Deseas proceder con la reserva o tienes alguna duda?
                </p>
              </div>

              {/* Botón Proceder al Pago */}
              <div className="pt-6 border-t border-brand-light dark:border-dark-border mt-8">
                <button
                  onClick={handleProceedToPayment}
                  disabled={isSaving}
                  className={`btn-animate-continue w-full !bg-brand-primary group relative overflow-hidden ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="dots_border !border-white/30"></div>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <svg
                    className={`sparkle ${isSaving ? 'animate-spin' : ''}`}
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
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {t('summary.proceed_to_payment')}
                      </>
                    )}
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
