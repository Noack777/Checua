import React, { useState, useRef } from 'react'
import ReservationContactSection from './components/ReservationContactSection'
import TourSelectionSection from './components/TourSelectionSection'
import DateSelectionSection from './components/DateSelectionSection'
import TimeSelectionSection from './components/TimeSelectionSection'
import WelcomeModal from './components/WelcomeModal'

function App() {
  // --- ESTADO DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(true);

  // --- ESTADO GLOBAL DEL FORMULARIO ---
  const [reservationData, setReservationData] = useState({
    contact: {
      nombre_jefe_reserva: '',
      telefono_contacto: '',
      correo_contacto: ''
    },
    tour: {
      tour_reserva: '',
      precio_por_persona: null,
      id: null
    },
    date: {
      fecha_reserva: '',
      es_fin_de_semana: false,
      es_festivo_colombia: false,
      puede_variar_precio: false,
      rawDate: null
    },
    time: {
      hora_reserva: '',
      periodo: '',
      label: ''
    }
  });

  // --- ESTADO DE VALIDACIÓN ---
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showCompanionsNotice, setShowCompanionsNotice] = useState(false);

  // --- REFS PARA SCROLL ---
  const contactRef = useRef(null);
  const tourRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);

  // --- MANEJADORES DE CAMBIOS ---
  const handleContactChange = (field, value) => {
    setReservationData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
    // Limpiar error al escribir
    if (errors[field] || errors.contact) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        // Si no hay más errores de contacto, quitar el flag general
        const contactFields = ['nombre_jefe_reserva', 'telefono_contacto', 'correo_contacto'];
        const hasMoreContactErrors = contactFields.some(f => f !== field && newErrors[f]);
        if (!hasMoreContactErrors) delete newErrors.contact;
        return newErrors;
      });
    }
  };

  const handleTourSelect = (tour) => {
    setReservationData(prev => ({
      ...prev,
      tour: {
        tour_reserva: tour.name,
        precio_por_persona: tour.price,
        id: tour.id.toString()
      }
    }));
    if (errors.tour) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.tour;
      return newErrors;
    });
  };

  const handleDateSelect = (date, meta) => {
    setReservationData(prev => ({
      ...prev,
      date: {
        ...meta,
        rawDate: date
      }
    }));
    if (errors.date) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.date;
      return newErrors;
    });
  };

  const handleTimeSelect = (time) => {
    setReservationData(prev => ({
      ...prev,
      time: {
        hora_reserva: time.value,
        periodo: time.period,
        label: time.label
      }
    }));
    if (errors.time) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.time;
      return newErrors;
    });
  };

  // --- VALIDACIÓN Y ENVÍO ---
  const validateForm = () => {
    const newErrors = {};
    const { contact, tour, date, time } = reservationData;

    // 1. Contacto
    if (!contact.nombre_jefe_reserva.trim()) {
      newErrors.nombre_jefe_reserva = "El nombre es obligatorio";
      newErrors.contact = true;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(contact.nombre_jefe_reserva)) {
      newErrors.nombre_jefe_reserva = "Solo se permiten letras";
      newErrors.contact = true;
    }

    if (!contact.telefono_contacto.trim()) {
      newErrors.telefono_contacto = "El teléfono es obligatorio";
      newErrors.contact = true;
    } else if (!/^\+?\d+$/.test(contact.telefono_contacto)) {
      newErrors.telefono_contacto = "Formato de teléfono inválido";
      newErrors.contact = true;
    }

    if (!contact.correo_contacto.trim()) {
      newErrors.correo_contacto = "El correo es obligatorio";
      newErrors.contact = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.correo_contacto)) {
      newErrors.correo_contacto = "Formato de correo inválido";
      newErrors.contact = true;
    }

    // 2. Tour
    if (!tour.tour_reserva) {
      newErrors.tour = "Debes seleccionar un plan";
    }

    // 3. Fecha
    if (!date.fecha_reserva) {
      newErrors.date = "Debes seleccionar una fecha";
    }

    // 4. Hora
    if (!time.hora_reserva) {
      newErrors.time = "Debes seleccionar una hora";
    }

    setErrors(newErrors);

    // Scroll al primer error
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.contact) {
        contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.tour) {
        tourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.date) {
        dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.time) {
        timeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleEditInformation = () => {
    setShowSummary(false);
    setShowCompanionsNotice(false);
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAddCompanions = () => {
    setShowCompanionsNotice(true);
    // Opcional: auto-ocultar después de unos segundos
    setTimeout(() => {
      const noticeElement = document.getElementById('companions-notice');
      noticeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleContinue = () => {
    if (validateForm()) {
      setShowSummary(true);
      // Scroll al resumen
      setTimeout(() => {
        const summaryElement = document.getElementById('reservation-summary');
        summaryElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setShowSummary(false);
    }
  };

  const handleModalComplete = ({ phone, tour }) => {
    setReservationData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        telefono_contacto: phone
      },
      tour: {
        tour_reserva: tour.name,
        precio_por_persona: tour.price,
        id: tour.id.toString()
      }
    }));
    setIsModalOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-brand-light/40 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center ${isModalOpen ? 'overflow-hidden h-screen' : ''}`}>
      <WelcomeModal 
        isOpen={isModalOpen} 
        onComplete={handleModalComplete} 
      />
      
      {/* Header Titles */}
      <div className="w-full max-w-xl text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-brand-text-main uppercase leading-none">
          Formulario de Reservas
        </h1>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="h-[1px] w-6 bg-brand-primary opacity-60"></div>
          <h2 className="text-base md:text-lg font-bold tracking-[0.2em] text-brand-dark uppercase">
            Desierto de Checua
          </h2>
          <div className="h-[1px] w-6 bg-brand-primary opacity-60"></div>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-6">
        <ReservationContactSection 
          sectionRef={contactRef}
          data={reservationData.contact}
          onChange={handleContactChange}
          errors={errors}
        />
        
        <TourSelectionSection 
          sectionRef={tourRef}
          selectedTourId={reservationData.tour.id}
          onSelect={handleTourSelect}
          errors={errors}
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
            Continuar
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
                  Resumen de tu reserva
                </h3>
                <div className="h-1 w-12 bg-brand-primary mx-auto mt-2 rounded-full"></div>
              </div>

              <div className="grid gap-6">
                {/* Datos de Contacto */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Responsable</p>
                  <div className="bg-white/60 rounded-2xl p-4 border border-brand-border/50">
                    <p className="text-brand-text-main font-bold text-base">{reservationData.contact.nombre_jefe_reserva}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-brand-text-secondary text-sm flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
                        {reservationData.contact.telefono_contacto}
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
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Experiencia</p>
                    <div className="bg-white/60 rounded-2xl p-4 border border-brand-border/50 h-full">
                      <p className="text-brand-text-main font-bold text-sm leading-tight">{reservationData.tour.tour_reserva}</p>
                      <p className="text-brand-primary font-black text-lg mt-1">
                        ${reservationData.tour.precio_por_persona?.toLocaleString('es-CO')}
                        <span className="text-[10px] ml-1 font-bold text-brand-text-secondary uppercase">COP</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Fecha y Hora</p>
                    <div className="bg-white/60 rounded-2xl p-4 border border-brand-border/50 h-full">
                      <p className="text-brand-text-main font-bold text-sm capitalize">
                        {reservationData.date.rawDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-brand-dark font-black text-base mt-0.5">
                        {reservationData.time.label}
                      </p>
                      <p className="text-[10px] text-brand-text-secondary font-bold uppercase mt-1">
                        {reservationData.date.puede_variar_precio ? "⚠️ Sujeto a disponibilidad" : "✅ Confirmado"}
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
                  Editar información
                </button>
                <button
                  onClick={handleAddCompanions}
                  className="flex-1 py-3 px-6 bg-brand-light border-2 border-brand-primary/20 hover:border-brand-primary text-brand-dark font-bold text-sm rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir acompañantes
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
                    Pronto podrás registrar los acompañantes de la reserva.
                  </p>
                </div>
              )}

              <div className="pt-4 text-center">
                <p className="text-[11px] text-brand-text-secondary font-medium italic">
                  * Por favor verifica que todos los datos sean correctos antes de proceder.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <p className="mt-10 text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold opacity-40">
        Experiencia Adrenaline Colombia
      </p>
    </div>
  )
}

export default App
