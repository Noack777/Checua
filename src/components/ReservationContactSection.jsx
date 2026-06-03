import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;

const ReservationContactSection = ({ data, onChange, errors, sectionRef }) => {
  const { t } = useTranslation();
  const [isDocTypeOpen, setIsDocTypeOpen] = useState(false);
  const dropdownRef = useRef(null);

  const DOCUMENT_TYPES = [
    t('doc_types.cc'),
    t('doc_types.ti'),
    t('doc_types.ce'),
    t('doc_types.pas'),
    t('doc_types.ppt'),
    t('doc_types.dni'),
    t('doc_types.other')
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDocTypeOpen(false);
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
      // Solo permitir números y eliminar cualquier otro caracter
      cleanValue = value.replace(/\D/g, '');
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

  return (
    <div 
      ref={sectionRef}
      className={`w-full max-w-xl bg-white dark:bg-dark-bg-card rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border transition-all duration-300 relative ${
        errors.contact ? 'border-red-400 ring-2 ring-red-50' : 'border-brand-border dark:border-dark-border'
      }`}
    >
      {/* Visual Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] ${errors.contact ? 'bg-red-400' : 'bg-brand-primary'}`}></div>
      
      <div className="px-5 py-6 md:p-10 space-y-8">
          <div>
            <h3 className="text-base md:text-lg font-bold text-brand-text-main dark:text-dark-text-main flex items-center gap-2">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${
                errors.contact ? 'bg-red-100 text-red-600' : 'bg-brand-light dark:bg-dark-bg-main text-brand-dark dark:text-brand-primary'
              }`}>1</span>
              {t('sections.responsible_info')}
              <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
            </h3>
            <p className="text-sm md:text-base text-brand-text-secondary dark:text-dark-text-secondary mt-1.5 ml-0 md:ml-9">
              {t('sections.responsible_data')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group ml-0 md:ml-9">
              <input
                type="text"
                name="nombre_jefe_reserva"
                placeholder={t('sections.full_name')}
                value={data.nombre_jefe_reserva}
                onChange={handleChange}
                className={`w-full px-5 py-3.5 bg-white dark:bg-dark-bg-main/50 border-2 rounded-full text-brand-text-main dark:text-dark-text-main placeholder-brand-text-secondary/40 focus:outline-none focus:ring-4 transition-all duration-300 font-medium text-sm md:text-base ${
                  errors.nombre_jefe_reserva ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : 'border-brand-border dark:border-dark-border focus:border-brand-primary focus:ring-brand-primary/5'
                }`}
              />
              {errors.nombre_jefe_reserva && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{t(`errors.${errors.nombre_jefe_reserva_key || 'required_name'}`)}</p>}
            </div>

            {/* Fila para Tipo y Número de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-9">
              {/* Tipo de Documento */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDocTypeOpen(!isDocTypeOpen)}
                  className={`w-full px-5 py-3.5 bg-white dark:bg-dark-bg-main/50 border-2 rounded-full text-left transition-all duration-300 flex items-center justify-between group ${
                    isDocTypeOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors.tipo_documento ? 'border-red-200' : 'border-brand-border dark:border-dark-border hover:border-brand-primary/50'
                  }`}
                >
                  <span className={`text-sm md:text-base font-medium truncate ${data.tipo_documento ? 'text-brand-text-main dark:text-dark-text-main' : 'text-brand-text-secondary/40'}`}>
                    {data.tipo_documento || t('sections.doc_type')}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-brand-primary transition-transform duration-300 ${isDocTypeOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDocTypeOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.2rem] shadow-xl z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {DOCUMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleDocTypeSelect(type)}
                          className={`w-full px-5 py-3 text-left text-sm font-medium transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 ${
                            data.tipo_documento === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.tipo_documento && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{errors.tipo_documento}</p>}
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
                  className={`w-full px-5 py-3.5 bg-white dark:bg-dark-bg-main/50 border-2 rounded-full text-brand-text-main dark:text-dark-text-main placeholder-brand-text-secondary/40 focus:outline-none focus:ring-4 transition-all duration-300 font-medium text-sm md:text-base ${
                    errors.numero_documento ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : 'border-brand-border dark:border-dark-border focus:border-brand-primary focus:ring-brand-primary/5'
                  }`}
                />
                {errors.numero_documento && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{errors.numero_documento}</p>}
              </div>
            </div>

            <div className="relative group ml-0 md:ml-9 verified-phone-display">
              <div className="relative">
                <PhoneInput
                  country={'co'}
                  value={data.telefono_cliente}
                  disabled={true}
                  containerClass="!w-full !opacity-100"
                  inputClass="!w-full !h-auto !py-3.5 !pl-[70px] !pr-24 !bg-brand-light/50 dark:!bg-dark-bg-main/30 !border-2 !border-brand-border dark:!border-dark-border !rounded-full !text-brand-text-secondary/70 dark:!text-dark-text-secondary/70 !font-bold !text-sm md:!text-base !cursor-not-allowed"
                  buttonClass="!bg-transparent !border-none !rounded-l-full !pl-4 !cursor-not-allowed"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="hidden sm:inline-block text-[10px] font-black text-brand-primary uppercase tracking-widest bg-white dark:bg-dark-bg-card px-2 py-1 rounded-md border border-brand-primary/20 shadow-sm">{t('sections.verified')}</span>
                  <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-secondary/50 dark:text-dark-text-secondary/50 mt-1.5 ml-4 font-medium italic">{t('sections.verified_hint')}</p>
            </div>

            <div className="relative group ml-0 md:ml-9">
              <input
                type="email"
                name="correo_contacto"
                placeholder={t('sections.email')}
                value={data.correo_contacto}
                onChange={handleChange}
                className={`w-full px-5 py-3.5 bg-white dark:bg-dark-bg-main/50 border-2 rounded-full text-brand-text-main dark:text-dark-text-main placeholder-brand-text-secondary/40 focus:outline-none focus:ring-4 transition-all duration-300 font-medium text-sm md:text-base ${
                  errors.correo_contacto ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : 'border-brand-border dark:border-dark-border focus:border-brand-primary focus:ring-brand-primary/5'
                }`}
              />
              {errors.correo_contacto && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{errors.correo_contacto}</p>}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ReservationContactSection;
