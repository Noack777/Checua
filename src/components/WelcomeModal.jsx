import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { findOrCreateClient, updateClientPlan } from '../services/clientService';

const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;

const WelcomeModal = ({ isOpen, onComplete, onClose, tours = [], loading = false, initialPhone = '', initialTourId = '', theme, toggleTheme }) => {
  const { t, i18n } = useTranslation();
  const [phone, setPhone] = useState(initialPhone);
  const [selectedTourId, setSelectedTourId] = useState(initialTourId);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Estados para la verificación del cliente
  const [clientStatus, setClientStatus] = useState('idle'); // idle, checking, found, created, error
  const [clientData, setClientData] = useState(null);
  const [clientError, setClientError] = useState(null);
  const debounceTimer = useRef(null);

  // Sincronizar estados locales con props cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      if (initialPhone) {
        setPhone(initialPhone);
        const phoneWithPlus = initialPhone.startsWith('+') ? initialPhone : `+${initialPhone}`;
        setIsValid(isValidPhoneNumber(phoneWithPlus));
        setClientStatus('found'); // Asumimos found porque ya pasó por aquí
      }
      if (initialTourId) setSelectedTourId(initialTourId);
    }
  }, [isOpen, initialPhone, initialTourId]);

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
    const valid = phone ? isValidPhoneNumber(phoneWithPlus) : false;
    setIsValid(valid);

    // Lógica de Debounce para búsqueda en Supabase
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (valid) {
      setClientStatus('checking');
      debounceTimer.current = setTimeout(async () => {
        const { data, status, error } = await findOrCreateClient(phoneWithPlus);
        if (status === 'error') {
          setClientStatus('error');
          setClientError(error.message);
        } else {
          setClientStatus(status);
          setClientData(data);
          setClientError(null);

          // Si el cliente ya tiene un plan asignado, lo precargamos
          if (data && data.id_plan) {
            setSelectedTourId(data.id_plan.toString());
          }
        }
      }, 800);
    } else {
      setClientStatus('idle');
      setClientData(null);
    }
  }, [phone]);

  const canContinue = acceptedTerms && isValid && selectedTourId && (clientStatus === 'found' || clientStatus === 'created');

  const handleContinue = async () => {
    if (canContinue) {
      const tour = tours.find(t => t.id.toString() === selectedTourId);
      const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}`;

      // Actualizar el plan del cliente en la base de datos si es necesario
      // Lo hacemos antes de completar para asegurar que la DB esté sincronizada
      try {
        await updateClientPlan(phoneWithPlus, selectedTourId);
      } catch (err) {
        console.error("Error al actualizar el plan del cliente:", err);
      }

      onComplete({
        phone: phoneWithPlus,
        tour,
        client: clientData
      });
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const selectedTour = tours.find(t => t.id.toString() === selectedTourId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-dark/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-dark-bg-card rounded-[2.5rem] shadow-2xl relative border border-brand-border dark:border-dark-border animate-in zoom-in-95 duration-300 my-auto">
        {/* Header Accent */}
        <div className="h-2 w-full bg-brand-primary rounded-t-[2.5rem] shrink-0"></div>
        
        {/* Selectors and Close Button Container */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm border-2 ${
              theme === 'light' 
                ? 'bg-white border-brand-border text-amber-500 hover:border-amber-400 hover:bg-amber-50/50' 
                : 'bg-dark-bg-main border-dark-border text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/10'
            }`}
            title={theme === 'light' ? t('welcome.switch_dark') || 'Cambiar a modo oscuro' : t('welcome.switch_light') || 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              // Icono Sol para modo claro
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.05 7.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              // Icono Luna para modo oscuro
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex bg-brand-light/50 dark:bg-dark-bg-main/50 p-1.5 rounded-2xl border-2 border-brand-border dark:border-dark-border gap-1.5">
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

          {/* Close Button (only if already has data) */}
          {initialPhone && (
            <button 
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-brand-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 pt-20 pb-8 md:pt-24 md:pb-10 md:px-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight">
              {t('welcome.title')}
            </h2>
            <p className="text-sm md:text-base text-brand-text-secondary dark:text-dark-text-secondary font-medium">
              {t('welcome.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-4">
                {t('welcome.phone_label')}
              </label>
              <div className="relative welcome-phone-input-v2">
                <PhoneInput
                  country={'co'}
                  value={phone}
                  onChange={setPhone}
                  enableSearch={true}
                  searchPlaceholder={t('welcome.search_placeholder') || "Buscar país..."}
                  searchNotFound={t('welcome.search_not_found') || "País no encontrado"}
                  placeholder={t('welcome.phone_placeholder')}
                  containerClass="!w-full !font-sans"
                  inputClass="!w-full !h-auto !py-4 !pl-[70px] !pr-5 !bg-brand-light/30 dark:!bg-dark-bg-main/50 !border-2 !border-brand-border dark:!border-dark-border !rounded-full !text-brand-text-main dark:!text-dark-text-main !font-bold !text-base focus:!border-brand-primary focus:!ring-4 focus:!ring-brand-primary/5 !transition-all !duration-300"
                  buttonClass="!bg-transparent !border-none !rounded-l-full !pl-4 hover:!bg-brand-primary/5 !transition-colors"
                  dropdownClass="welcome-phone-dropdown"
                  searchClass="welcome-phone-search"
                />
              </div>
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-brand-text-secondary/70 dark:text-dark-text-secondary font-medium italic">
                    {t('welcome.phone_hint')}
                  </p>
                  {/* Estados Visuales de Verificación */}
                  {phone && isValid && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                      {clientStatus === 'checking' && (
                        <>
                          <div className="w-2 h-2 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">{t('welcome.verifying')}</span>
                        </>
                      )}
                      {clientStatus === 'found' && (
                        <>
                          <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider">{t('welcome.client_found')}</span>
                        </>
                      )}
                      {clientStatus === 'created' && (
                        <>
                          <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider text-balance">{t('welcome.client_created')}</span>
                        </>
                      )}
                      {clientStatus === 'error' && (
                        <>
                          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">{t('welcome.client_error')}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {phone && (
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isValid ? 'text-brand-primary' : 'text-red-400'}`}>
                    {isValid ? t('welcome.phone_valid') : t('welcome.phone_invalid')}
                  </span>
                )}
              </div>
            </div>

            {/* Tour Selection Field */}
            <div className={`space-y-2 transition-all duration-500 ease-in-out ${isTourDropdownOpen ? 'pb-[320px]' : 'pb-0'}`} ref={dropdownRef}>
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-4">
                {t('welcome.experience_label')}
              </label>
              
              <div className="relative">
                {/* Custom Trigger */}
                <button
                  type="button"
                  onClick={() => setIsTourDropdownOpen(!isTourDropdownOpen)}
                  className={`w-full px-6 py-4 bg-brand-light/30 dark:bg-dark-bg-main/50 border-2 rounded-full text-left transition-all duration-300 flex items-center justify-between group ${
                    isTourDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-brand-border dark:border-dark-border hover:border-brand-primary/50'
                  }`}
                >
                  {selectedTour ? (
                    <div className="flex flex-col">
                      <span className="text-brand-text-main dark:text-dark-text-main font-bold text-sm md:text-base leading-tight">
                        {selectedTour.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-primary font-black text-sm">
                          ${selectedTour.price.toLocaleString('es-CO')}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-brand-text-secondary/60 dark:text-dark-text-secondary/60">
                          {t('welcome.price_per_person')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-brand-text-secondary/60 dark:text-dark-text-secondary/60 font-bold text-sm md:text-base">
                      {t('welcome.experience_placeholder')}
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
                  <div className="absolute left-0 right-0 mt-3 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[1001] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] md:max-h-[350px] overflow-y-auto welcome-tour-list">
                      {loading ? (
                        <div className="p-10 text-center">
                          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">{t('welcome.loading_tours')}</p>
                        </div>
                      ) : tours.length > 0 ? (
                        tours.map((tour) => (
                          <button
                            key={tour.id}
                            type="button"
                            onClick={() => {
                              setSelectedTourId(tour.id.toString());
                              setIsTourDropdownOpen(false);
                            }}
                            className={`w-full px-6 py-4 text-left transition-all duration-200 border-b border-brand-light dark:border-dark-border last:border-0 flex flex-col gap-1 group ${
                              selectedTourId === tour.id.toString() 
                                ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary pl-5' 
                                : 'hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-l-4 border-l-transparent'
                            }`}
                          >
                            <span className={`font-bold text-sm md:text-base transition-colors ${
                              selectedTourId === tour.id.toString() ? 'text-brand-primary' : 'text-brand-text-main dark:text-dark-text-main'
                            }`}>
                              {tour.name}
                            </span>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-brand-primary font-black text-base md:text-lg">
                                  ${tour.price.toLocaleString('es-CO')}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-brand-text-secondary/60 dark:text-dark-text-secondary/60 tracking-wider">
                                  {t('welcome.price_per_person')}
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
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm font-bold text-brand-text-secondary italic">{t('welcome.no_tours')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-4 pt-2">
              <p className="text-[11px] text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed ml-1">
                {t('welcome.terms_authorize')}
              </p>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-brand-border dark:border-dark-border transition-all checked:border-brand-primary checked:bg-brand-primary"
                  />
                  <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-text-main dark:text-dark-text-main group-hover:text-brand-primary transition-colors">
                  {t('welcome.terms_accept')}
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
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
