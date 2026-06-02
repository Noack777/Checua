import React, { useState, useEffect, useRef } from 'react';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { TOUR_OPTIONS } from '../constants/tours';

const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;

const WelcomeModal = ({ isOpen, onComplete }) => {
  const [phone, setPhone] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTourDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // libphonenumber-js needs the + prefix for validation
    const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}`;
    setIsValid(phone ? isValidPhoneNumber(phoneWithPlus) : false);
  }, [phone]);

  const canContinue = acceptedTerms && isValid && selectedTourId;

  const handleContinue = () => {
    if (canContinue) {
      const tour = TOUR_OPTIONS.find(t => t.id.toString() === selectedTourId);
      const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}`;
      onComplete({
        phone: phoneWithPlus,
        tour
      });
    }
  };

  const selectedTour = TOUR_OPTIONS.find(t => t.id.toString() === selectedTourId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-brand-border animate-in zoom-in-95 duration-300">
        {/* Header Accent */}
        <div className="h-2 w-full bg-brand-primary"></div>
        
        <div className="px-6 py-8 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-brand-text-main uppercase tracking-tight">
              Bienvenido a Checua
            </h2>
            <p className="text-sm md:text-base text-brand-text-secondary font-medium">
              Por favor completa estos datos para iniciar tu reserva.
            </p>
          </div>

          <div className="space-y-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-4">
                Teléfono de contacto *
              </label>
              <div className="relative welcome-phone-input-v2">
                <PhoneInput
                  country={'co'}
                  value={phone}
                  onChange={setPhone}
                  enableSearch={true}
                  searchPlaceholder="Buscar país..."
                  searchNotFound="País no encontrado"
                  placeholder="Número de WhatsApp"
                  containerClass="!w-full !font-sans"
                  inputClass="!w-full !h-auto !py-4 !pl-[70px] !pr-5 !bg-brand-light/30 !border-2 !border-brand-border !rounded-full !text-brand-text-main !font-bold !text-base focus:!border-brand-primary focus:!ring-4 focus:!ring-brand-primary/5 !transition-all !duration-300"
                  buttonClass="!bg-transparent !border-none !rounded-l-full !pl-4 hover:!bg-brand-primary/5 !transition-colors"
                  dropdownClass="welcome-phone-dropdown"
                  searchClass="welcome-phone-search"
                />
              </div>
              <div className="flex justify-between items-center px-4">
                <p className="text-[10px] text-brand-text-secondary/70 font-medium italic">
                  Usa tu número de WhatsApp.
                </p>
                {phone && (
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isValid ? 'text-brand-primary' : 'text-red-400'}`}>
                    {isValid ? 'Número válido' : 'Número incompleto'}
                  </span>
                )}
              </div>
            </div>

            {/* Tour Selection Field */}
            <div className="space-y-2" ref={dropdownRef}>
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-4">
                ¿Qué experiencia buscas? *
              </label>
              
              <div className="relative">
                {/* Custom Trigger */}
                <button
                  type="button"
                  onClick={() => setIsTourDropdownOpen(!isTourDropdownOpen)}
                  className={`w-full px-6 py-4 bg-brand-light/30 border-2 rounded-full text-left transition-all duration-300 flex items-center justify-between group ${
                    isTourDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-brand-border hover:border-brand-primary/50'
                  }`}
                >
                  {selectedTour ? (
                    <div className="flex flex-col">
                      <span className="text-brand-text-main font-bold text-sm md:text-base leading-tight">
                        {selectedTour.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-primary font-black text-sm">
                          ${selectedTour.price.toLocaleString('es-CO')}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-brand-text-secondary/60">
                          Precio por persona
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-brand-text-secondary/60 font-bold text-sm md:text-base">
                      Selecciona un plan turístico
                    </span>
                  )}
                  <svg 
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isTourDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Custom Dropdown Options */}
                {isTourDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-3 bg-white border-2 border-brand-border rounded-[1.5rem] shadow-2xl z-[1001] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] overflow-y-auto welcome-tour-list">
                      {TOUR_OPTIONS.map((tour) => (
                        <button
                          key={tour.id}
                          type="button"
                          onClick={() => {
                            setSelectedTourId(tour.id.toString());
                            setIsTourDropdownOpen(false);
                          }}
                          className={`w-full px-6 py-4 text-left transition-all duration-200 border-b border-brand-light last:border-0 flex flex-col gap-1 group ${
                            selectedTourId === tour.id.toString() 
                              ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary pl-5' 
                              : 'hover:bg-brand-light/50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <span className={`font-bold text-sm md:text-base transition-colors ${
                            selectedTourId === tour.id.toString() ? 'text-brand-primary' : 'text-brand-text-main'
                          }`}>
                            {tour.name}
                          </span>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-brand-primary font-black text-base md:text-lg">
                                ${tour.price.toLocaleString('es-CO')}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-brand-text-secondary/60 tracking-wider">
                                Precio por persona
                              </span>
                            </div>
                            {selectedTourId === tour.id.toString() && (
                              <div className="bg-brand-primary text-white p-1 rounded-full">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-4 pt-2">
              <p className="text-[11px] text-brand-text-secondary leading-relaxed ml-1">
                Autorizo el tratamiento de mis datos personales de acuerdo con la política de tratamiento de datos de la empresa.
              </p>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-brand-border transition-all checked:border-brand-primary checked:bg-brand-primary"
                  />
                  <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-text-main group-hover:text-brand-primary transition-colors">
                  He leído y acepto la política de tratamiento de datos.
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 rounded-full font-black text-lg uppercase tracking-widest transition-all duration-300 shadow-lg ${
              canContinue 
                ? 'bg-brand-primary text-white hover:bg-brand-dark shadow-brand-primary/20 scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Contenedor del Dropdown */
        .welcome-phone-dropdown {
          background-color: white !important;
          border-radius: 1.5rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          border: 2px solid #E5E7EB !important;
          overflow: hidden !important;
          margin-top: 0.75rem !important;
          z-index: 1000 !important;
          width: 320px !important;
          max-height: 350px !important;
          left: 0 !important;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive para móviles */
        @media (max-width: 480px) {
          .welcome-phone-dropdown {
            width: calc(90vw - 2rem) !important;
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-height: 60vh !important;
            margin-top: 0 !important;
          }
        }

        /* Buscador */
        .welcome-phone-search {
          padding: 1rem !important;
          background: white !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 10 !important;
          border-bottom: 1px solid #F3F4F6 !important;
        }

        .welcome-phone-search input {
          width: 100% !important;
          height: 45px !important;
          padding: 0 1.25rem !important;
          background-color: #F9FAFB !important;
          border: 2px solid #E5E7EB !important;
          border-radius: 1rem !important;
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #172033 !important;
          transition: all 0.2s !important;
        }

        .welcome-phone-search input:focus {
          border-color: #8CC915 !important;
          background-color: white !important;
          outline: none !important;
          box-shadow: 0 0 0 4px rgba(140, 201, 21, 0.1) !important;
        }

        /* Lista de países */
        .react-tel-input .country-list {
          width: 100% !important;
          scrollbar-width: thin;
          scrollbar-color: #8CC915 #F3F4F6;
          padding-top: 0 !important;
        }

        .react-tel-input .country-list::-webkit-scrollbar {
          width: 6px;
        }

        .react-tel-input .country-list::-webkit-scrollbar-track {
          background: #F3F4F6;
        }

        .react-tel-input .country-list::-webkit-scrollbar-thumb {
          background-color: #8CC915;
          border-radius: 20px;
        }

        /* Opción individual */
        .react-tel-input .country {
          padding: 0.875rem 1.25rem !important;
          display: flex !important;
          align-items: center !important;
          transition: background-color 0.2s !important;
          border-bottom: 1px solid #F9FAFB !important;
        }

        .react-tel-input .country:hover {
          background-color: #F7FBEF !important;
        }

        .react-tel-input .country.highlight {
          background-color: #F0F9E6 !important;
        }

        .react-tel-input .country .flag {
          margin-right: 1rem !important;
          transform: scale(1.2) !important;
        }

        .react-tel-input .country .country-name {
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #172033 !important;
          margin-right: 0.5rem !important;
          white-space: normal !important;
          line-height: 1.2 !important;
        }

        .react-tel-input .country .dial-code {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: #8CC915 !important;
        }

        /* Formatear indicativo con paréntesis */
        .react-tel-input .country .dial-code::before {
          content: "(";
        }
        .react-tel-input .country .dial-code::after {
          content: ")";
        }

        /* Ajuste de la bandera en el botón principal */
        .react-tel-input .selected-flag {
          width: 55px !important;
          padding-left: 1rem !important;
          background: transparent !important;
        }

        .react-tel-input .selected-flag .arrow {
          left: 35px !important;
          border-top-color: #8CC915 !important;
        }

        .react-tel-input .selected-flag .arrow.up {
          border-bottom-color: #8CC915 !important;
        }

        /* Estilos para el scrollbar del selector de tours */
        .welcome-tour-list::-webkit-scrollbar {
          width: 6px;
        }

        .welcome-tour-list::-webkit-scrollbar-track {
          background: #F9FAFB;
        }

        .welcome-tour-list::-webkit-scrollbar-thumb {
          background-color: #8CC915;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
};

export default WelcomeModal;
