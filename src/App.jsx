import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getTours } from './services/tourService';
import HomePage from './pages/HomePage';

function App() {
  const { t } = useTranslation();
  
  // --- ESTADO DEL TEMA ---
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
      correo_contacto: '',
      tipo_documento: '',
      numero_documento: '',
      rh: '',
      peso_kg: '',
      estatura_m: ''
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
    },
    companions: []
  });

  // --- ESTADO DE VALIDACIÓN ---
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showCompanionsSection, setShowCompanionsSection] = useState(false);

  // --- REFS PARA SCROLL ---
  const contactRef = useRef(null);
  const tourRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);

  // --- MANEJADORES DE CAMBIOS ---
  const handleContactChange = (field, value) => {
    let finalValue = value;
    
    // Normalización de Peso y Estatura: convertir coma a punto
    if (field === 'peso_kg' || field === 'estatura_m') {
      if (typeof value === 'string') {
        finalValue = value.replace(',', '.');
      }
    }

    setReservationData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: finalValue }
    }));
    
    if (errors[field] || errors.contact) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        const contactFields = ['nombre_jefe_reserva', 'telefono_cliente', 'correo_contacto', 'tipo_documento', 'numero_documento', 'rh', 'peso_kg', 'estatura_m'];
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

  const handleCompanionChange = (index, field, value) => {
    setReservationData(prev => {
      const newCompanions = [...prev.companions];
      newCompanions[index] = { ...newCompanions[index], [field]: value };
      return { ...prev, companions: newCompanions };
    });

    // Limpiar errores del acompañante específico
    const errorKey = `companion_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addCompanion = () => {
    setReservationData(prev => ({
      ...prev,
      companions: [
        ...prev.companions,
        {
          nombre: '',
          tipo_documento: '',
          numero_documento: '',
          telefono: '',
          correo: '',
          rh: '',
          peso_kg: '',
          estatura_m: ''
        }
      ]
    }));
    setShowCompanionsSection(true);
  };

  const removeCompanion = (index) => {
    setReservationData(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index)
    }));
    // Limpiar errores asociados a este acompañante
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`companion_${index}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // --- VALIDACIÓN Y ENVÍO ---
  const validateForm = () => {
    const newErrors = {};
    const { contact, tour, date, time } = reservationData;

    if (!contact.nombre_jefe_reserva.trim()) {
      newErrors.nombre_jefe_reserva = t('errors.required_name');
      newErrors.nombre_jefe_reserva_key = 'required_name';
      newErrors.contact = true;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(contact.nombre_jefe_reserva)) {
      newErrors.nombre_jefe_reserva = t('errors.only_letters');
      newErrors.nombre_jefe_reserva_key = 'only_letters';
      newErrors.contact = true;
    }

    if (!contact.telefono_cliente.trim()) {
      newErrors.telefono_cliente = t('errors.required_phone');
      newErrors.telefono_cliente_key = 'required_phone';
      newErrors.contact = true;
    } else if (!/^\+?\d+$/.test(contact.telefono_cliente)) {
      newErrors.telefono_cliente = t('errors.invalid_phone');
      newErrors.telefono_cliente_key = 'invalid_phone';
      newErrors.contact = true;
    }

    if (!contact.correo_contacto.trim()) {
      newErrors.correo_contacto = t('errors.required_email');
      newErrors.correo_contacto_key = 'required_email';
      newErrors.contact = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.correo_contacto)) {
      newErrors.correo_contacto = t('errors.invalid_email');
      newErrors.correo_contacto_key = 'invalid_email';
      newErrors.contact = true;
    }

    if (!contact.tipo_documento) {
      newErrors.tipo_documento = t('errors.required_doc_type');
      newErrors.tipo_documento_key = 'required_doc_type';
      newErrors.contact = true;
    }

    if (!contact.numero_documento) {
      newErrors.numero_documento = t('errors.required_doc_number');
      newErrors.numero_documento_key = 'required_doc_number';
      newErrors.contact = true;
    }

    if (!contact.rh) {
      newErrors.rh = t('errors.required_rh');
      newErrors.rh_key = 'required_rh';
      newErrors.contact = true;
    }

    if (!contact.peso_kg) {
      newErrors.peso_kg = t('errors.required_weight');
      newErrors.peso_kg_key = 'required_weight';
      newErrors.contact = true;
    } else if (isNaN(contact.peso_kg) || parseFloat(contact.peso_kg) <= 0) {
      newErrors.peso_kg = t('errors.invalid_weight');
      newErrors.peso_kg_key = 'invalid_weight';
      newErrors.contact = true;
    }

    if (!contact.estatura_m) {
      newErrors.estatura_m = t('errors.required_height');
      newErrors.estatura_m_key = 'required_height';
      newErrors.contact = true;
    } else if (isNaN(contact.estatura_m) || parseFloat(contact.estatura_m) <= 0) {
      newErrors.estatura_m = t('errors.invalid_height');
      newErrors.estatura_m_key = 'invalid_height';
      newErrors.contact = true;
    }

    if (!tour.tour_reserva) {
      newErrors.tour = t('errors.required_tour');
      newErrors.tour_key = 'required_tour';
    }
    if (!date.fecha_reserva) {
      newErrors.date = t('errors.required_date');
      newErrors.date_key = 'required_date';
    }
    if (!time.hora_reserva) {
      newErrors.time = t('errors.required_time');
      newErrors.time_key = 'required_time';
    }

    // Validar acompañantes
    reservationData.companions.forEach((companion, index) => {
      if (!companion.nombre.trim()) {
        newErrors[`companion_${index}_nombre`] = t('errors.required_name');
      }
      if (!companion.tipo_documento) {
        newErrors[`companion_${index}_tipo_documento`] = t('errors.required_doc_type');
      }
      if (!companion.numero_documento) {
        newErrors[`companion_${index}_numero_documento`] = t('errors.required_doc_number');
      }
      if (!companion.telefono.trim()) {
        newErrors[`companion_${index}_telefono`] = t('errors.required_phone');
      } else if (!/^\+?\d+$/.test(companion.telefono)) {
        newErrors[`companion_${index}_telefono`] = t('errors.invalid_phone');
      }
      if (companion.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companion.correo)) {
        newErrors[`companion_${index}_correo`] = t('errors.invalid_email');
      }
      if (!companion.rh) {
        newErrors[`companion_${index}_rh`] = t('errors.required_rh');
      }
      if (!companion.peso_kg) {
        newErrors[`companion_${index}_peso_kg`] = t('errors.required_weight');
      } else if (isNaN(companion.peso_kg) || parseFloat(companion.peso_kg) <= 0) {
        newErrors[`companion_${index}_peso_kg`] = t('errors.invalid_weight');
      }
      if (!companion.estatura_m) {
        newErrors[`companion_${index}_estatura_m`] = t('errors.required_height');
      } else if (isNaN(companion.estatura_m) || parseFloat(companion.estatura_m) <= 0) {
        newErrors[`companion_${index}_estatura_m`] = t('errors.invalid_height');
      }
    });

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
    setShowCompanionsSection(false);
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAddCompanions = () => {
    addCompanion();
    setTimeout(() => {
      document.getElementById('companions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        tour_reserva: data.tour.name || '',
        precio_por_persona: data.tour.price || null,
        id_plan: data.tour.id ? data.tour.id.toString() : null
      }
    }));
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
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
              onCloseModal={handleCloseModal}
              onOpenModal={handleOpenModal}
              theme={theme}
              toggleTheme={toggleTheme}
              tours={tours}
              loadingTours={loadingTours}
              reservationData={reservationData}
              setReservationData={setReservationData}
              handleContactChange={handleContactChange}
              handleTourSelect={handleTourSelect}
              handleDateSelect={handleDateSelect}
              handleTimeSelect={handleTimeSelect}
              handleContinue={handleContinue}
              showSummary={showSummary}
              handleEditInformation={handleEditInformation}
              handleAddCompanions={handleAddCompanions}
              showCompanionsSection={showCompanionsSection}
              addCompanion={addCompanion}
              removeCompanion={removeCompanion}
              handleCompanionChange={handleCompanionChange}
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
