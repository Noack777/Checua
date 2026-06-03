import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;

const ReservationContactSection = ({ data, onChange, errors, sectionRef }) => {
  const { t } = useTranslation();
  const [isDocTypeOpen, setIsDocTypeOpen] = useState(false);
  const [isRHOpen, setIsRHOpen] = useState(false);
  const [rhDropdownPosition, setRhDropdownPosition] = useState('down');
  const [docDropdownPosition, setDocDropdownPosition] = useState('down');
  const dropdownRef = useRef(null);
  const rhDropdownRef = useRef(null);

  useEffect(() => {
    if (isRHOpen && rhDropdownRef.current) {
      const rect = rhDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setRhDropdownPosition('up');
      } else {
        setRhDropdownPosition('down');
      }
    }
  }, [isRHOpen]);

  useEffect(() => {
    if (isDocTypeOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setDocDropdownPosition('up');
      } else {
        setDocDropdownPosition('down');
      }
    }
  }, [isDocTypeOpen]);

  const DOCUMENT_TYPES = [
    t('doc_types.cc'),
    t('doc_types.ti'),
    t('doc_types.ce'),
    t('doc_types.pas'),
    t('doc_types.ppt'),
    t('doc_types.dni'),
    t('doc_types.other')
  ];

  const RH_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDocTypeOpen(false);
      }
      if (rhDropdownRef.current && !rhDropdownRef.current.contains(event.target)) {
        setIsRHOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;
    
    if (name === 'nombre_jefe_reserva') {
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    if (name === 'numero_documento') {
      cleanValue = value.replace(/\D/g, '');
    }

    if (name === 'peso_kg') {
      // Solo números y máximo 3 caracteres
      cleanValue = value.replace(/\D/g, '').slice(0, 3);
    }

    if (name === 'estatura_m') {
      // Solo números y máximo 3 caracteres
      let digits = value.replace(/\D/g, '').slice(0, 3);
      // El punto aparece únicamente con el tercer carácter, después del primero
      if (digits.length === 3) {
        cleanValue = `${digits[0]}.${digits.slice(1)}`;
      } else {
        cleanValue = digits;
      }
    }

    onChange(name, cleanValue);
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleDocTypeSelect = (type) => {
    onChange('tipo_documento', type);
    setIsDocTypeOpen(false);
  };

  const handleRHSelect = (type) => {
    onChange('rh', type);
    setIsRHOpen(false);
  };

  return (
    <div 
      ref={sectionRef}
      className={`card-premium ${errors.contact ? 'border-red-400 ring-2 ring-red-50' : ''}`}
      style={{ zIndex: isDocTypeOpen || isRHOpen ? 50 : 1 }}
    >
      <div className={`card-accent-line ${errors.contact ? 'bg-red-400' : ''}`}></div>
      
      <div className="px-6 py-8 md:px-10 md:py-10 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                name="nombre_jefe_reserva"
                placeholder={t('sections.full_name')}
                value={data.nombre_jefe_reserva}
                onChange={handleChange}
                className={`input-premium ${errors.nombre_jefe_reserva ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
              />
              {errors.nombre_jefe_reserva && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{t(`errors.${errors.nombre_jefe_reserva_key || 'required_name'}`)}</p>}
            </div>

            {/* Fila para Tipo y Número de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDocTypeOpen(!isDocTypeOpen)}
                  className={`input-premium text-left flex items-center justify-between group ${
                    isDocTypeOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors.tipo_documento ? 'border-red-200' : ''
                  }`}
                >
                  <span className={`truncate ${data.tipo_documento ? '' : 'text-brand-text-secondary/40'}`}>
                    {data.tipo_documento || t('sections.doc_type')}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isDocTypeOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDocTypeOpen && (
                  <div className={`absolute left-0 right-0 ${docDropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                      {DOCUMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleDocTypeSelect(type)}
                          className={`w-full px-6 py-4 text-left text-sm md:text-base font-bold transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                            data.tipo_documento === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.tipo_documento && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.tipo_documento}</p>}
              </div>

              {/* Número de Documento */}
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  name="numero_documento"
                  placeholder={t('sections.doc_number')}
                  value={formatNumber(data.numero_documento)}
                  onChange={handleChange}
                  className={`input-premium ${errors.numero_documento ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
                />
                {errors.numero_documento && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.numero_documento}</p>}
              </div>
            </div>

            <div className="relative group verified-phone-display">
              <div className="relative">
                <PhoneInput
                  country={'co'}
                  value={data.telefono_cliente}
                  disabled={true}
                  containerClass="!w-full !opacity-100"
                  inputClass="!w-full !h-auto !py-4 !pl-[70px] !pr-24 !bg-brand-light/30 dark:!bg-dark-bg-main/30 !border-2 !border-brand-border dark:!border-dark-border !rounded-full !text-brand-text-secondary/70 dark:!text-dark-text-secondary/70 !font-bold !text-base !cursor-not-allowed"
                  buttonClass="!bg-transparent !border-none !rounded-l-full !pl-4 !cursor-not-allowed"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="hidden sm:inline-block text-[9px] font-black text-brand-primary uppercase tracking-widest bg-white dark:bg-dark-bg-card px-2 py-1 rounded-md border border-brand-primary/20 shadow-sm">{t('sections.verified')}</span>
                  <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-secondary/50 dark:text-dark-text-secondary/50 mt-1.5 ml-6 font-medium italic">{t('sections.verified_hint')}</p>
            </div>

            <div className="relative group">
              <input
                type="email"
                name="correo_contacto"
                placeholder={t('sections.email')}
                value={data.correo_contacto}
                onChange={handleChange}
                className={`input-premium ${errors.correo_contacto ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
              />
              {errors.correo_contacto && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.correo_contacto}</p>}
            </div>

            {/* Fila de Salud: RH, Peso, Estatura */}
            <div className="grid grid-cols-3 gap-3">
              {/* RH */}
              <div className="relative" ref={rhDropdownRef}>
                <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 ml-4 block opacity-70">
                  {t('sections.rh')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsRHOpen(!isRHOpen)}
                  className={`input-premium !px-4 text-left flex items-center justify-between group ${
                    isRHOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors.rh ? 'border-red-200' : ''
                  }`}
                >
                  <span className={`truncate ${data.rh ? '' : 'text-brand-text-secondary/40'}`}>
                    {data.rh || 'RH'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-brand-primary transition-transform duration-300 ${isRHOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isRHOpen && (
                  <div className={`absolute left-0 right-0 min-w-[80px] ${rhDropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {RH_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleRHSelect(type)}
                          className={`w-full px-2 py-4 text-center text-sm md:text-base font-bold transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                            data.rh === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.rh && <p className="text-[9px] text-red-500 mt-1.5 ml-2 font-bold uppercase tracking-wider leading-tight">{errors.rh}</p>}
              </div>

              {/* Peso */}
              <div className="relative group">
                <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 ml-4 block opacity-70">
                  {t('sections.weight')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="peso_kg"
                    placeholder="000"
                    maxLength={3}
                    value={data.peso_kg}
                    onChange={handleChange}
                    className={`input-premium !pr-10 md:!pr-12 ${
                      errors.peso_kg ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''
                    }`}
                  />
                  <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] md:text-xs font-black text-brand-primary/60 uppercase tracking-widest">kg</span>
                  </div>
                </div>
                {errors.peso_kg && <p className="text-[9px] text-red-500 mt-1.5 ml-2 font-bold uppercase tracking-wider leading-tight">{errors.peso_kg}</p>}
              </div>

              {/* Estatura */}
              <div className="relative group">
                <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 ml-4 block opacity-70">
                  {t('sections.height')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="estatura_m"
                    placeholder="000"
                    maxLength={4}
                    value={data.estatura_m}
                    onChange={handleChange}
                    className={`input-premium !pr-8 md:!pr-10 ${
                      errors.estatura_m ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''
                    }`}
                  />
                  <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] md:text-xs font-black text-brand-primary/60 uppercase tracking-widest">m</span>
                  </div>
                </div>
                {errors.estatura_m && <p className="text-[9px] text-red-500 mt-1.5 ml-2 font-bold uppercase tracking-wider leading-tight">{errors.estatura_m}</p>}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ReservationContactSection;
