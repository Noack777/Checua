import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getTours } from './services/tourService';
import HomePage from './pages/HomePage';

function App() {
  // --- ESTADO DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);

  // --- CARGAR TOURS ---
  useEffect(() => {
    const fetchTours = async () => {
      setLoadingTours(true);
      const data = await getTours();
      setTours(data);
      setLoadingTours(false);
    };
    fetchTours();
  }, []);

  // --- ESTADO GLOBAL DEL FORMULARIO ---
  const [reservationData, setReservationData] = useState({
    contact: {
      nombre_jefe_reserva: '',
      telefono_cliente: '',
      correo_contacto: ''
    },
    tour: {
      tour_reserva: '',
      precio_por_persona: null,
      id_plan: null
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
    if (errors[field] || errors.contact) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        const contactFields = ['nombre_jefe_reserva', 'telefono_cliente', 'correo_contacto'];
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
        id_plan: tour.id.toString()
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

    if (!contact.nombre_jefe_reserva.trim()) {
      newErrors.nombre_jefe_reserva = "El nombre es obligatorio";
      newErrors.contact = true;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(contact.nombre_jefe_reserva)) {
      newErrors.nombre_jefe_reserva = "Solo se permiten letras";
      newErrors.contact = true;
    }

    if (!contact.telefono_cliente.trim()) {
      newErrors.telefono_cliente = "El teléfono es obligatorio";
      newErrors.contact = true;
    } else if (!/^\+?\d+$/.test(contact.telefono_cliente)) {
      newErrors.telefono_cliente = "Formato de teléfono inválido";
      newErrors.contact = true;
    }

    if (!contact.correo_contacto.trim()) {
      newErrors.correo_contacto = "El correo es obligatorio";
      newErrors.contact = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.correo_contacto)) {
      newErrors.correo_contacto = "Formato de correo inválido";
      newErrors.contact = true;
    }

    if (!tour.tour_reserva) newErrors.tour = "Debes seleccionar un plan";
    if (!date.fecha_reserva) newErrors.date = "Debes seleccionar una fecha";
    if (!time.hora_reserva) newErrors.time = "Debes seleccionar una hora";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.contact) contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (newErrors.tour) tourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (newErrors.date) dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (newErrors.time) timeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    setTimeout(() => {
      document.getElementById('companions-notice')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleContinue = () => {
    if (validateForm()) {
      setShowSummary(true);
      setTimeout(() => {
        document.getElementById('reservation-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setShowSummary(false);
    }
  };

  const onModalComplete = (data) => {
    // Actualizamos los datos del contacto con lo que viene del modal
    setReservationData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        telefono_cliente: data.phone,
        // Si el cliente ya tenía nombre en la DB, lo podemos pre-cargar aquí en el futuro
        nombre_jefe_reserva: data.client?.nombre_cliente || prev.contact.nombre_jefe_reserva
      },
      tour: {
        tour_reserva: data.tour.name,
        precio_por_persona: data.tour.price,
        id_plan: data.tour.id.toString()
      }
    }));
    setIsModalOpen(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              isModalOpen={isModalOpen}
              onModalComplete={onModalComplete}
              tours={tours}
              loadingTours={loadingTours}
              reservationData={reservationData}
              handleContactChange={handleContactChange}
              handleTourSelect={handleTourSelect}
              handleDateSelect={handleDateSelect}
              handleTimeSelect={handleTimeSelect}
              handleContinue={handleContinue}
              showSummary={showSummary}
              handleEditInformation={handleEditInformation}
              handleAddCompanions={handleAddCompanions}
              showCompanionsNotice={showCompanionsNotice}
              errors={errors}
              contactRef={contactRef}
              tourRef={tourRef}
              dateRef={dateRef}
              timeRef={timeRef}
            />
          } 
        />
        {/* Fallback para cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
