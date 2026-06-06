import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CompanionFormSection = ({ 
  companions, 
  onCompanionChange, 
  onRemoveCompanion, 
  onAddCompanion, 
  errors 
}) => {
  const { t } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState(null); // { index: number, type: 'doc' | 'rh' }
  const [dropdownPosition, setDropdownPosition] = useState('down');
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

  const RH_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (index, type, event) => {
    if (activeDropdown?.index === index && activeDropdown?.type === type) {
      setActiveDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 250 ? 'up' : 'down');
      setActiveDropdown({ index, type });
    }
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (index, field, value) => {
    let cleanValue = value;
    
    if (field === 'numero_documento' || field === 'telefono') {
      cleanValue = value.replace(/\D/g, '');
    }
    
    if (field === 'nombre' || field === 'parentesco') {
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    
    if (field === 'peso_kg') {
      // Solo números y máximo 3 caracteres
      cleanValue = value.replace(/\D/g, '').slice(0, 3);
    }

    if (field === 'estatura_m') {
      // Solo números y máximo 3 caracteres
      let digits = value.replace(/\D/g, '').slice(0, 3);
      // El punto aparece únicamente con el tercer carácter, después del primero
      if (digits.length === 3) {
        cleanValue = `${digits[0]}.${digits.slice(1)}`;
      } else {
        cleanValue = digits;
      }
    }
    
    onCompanionChange(index, field, cleanValue);
  };

  return (
    <div id="companions-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {companions.map((companion, index) => (
        <div key={index} className="card-premium relative overflow-visible">
          <div className="card-accent-line bg-brand-primary/40"></div>
          
          {/* Header del Acompañante */}
          <div className="px-6 pt-6 md:px-10 flex justify-between items-center">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] shadow-sm">
                {index + 1}
              </span>
              Acompañante {index + 1}
            </h3>
            <button
              onClick={() => onRemoveCompanion(index)}
              className="p-2 text-brand-text-secondary/40 hover:text-red-500 transition-colors duration-300 rounded-full hover:bg-red-50"
              title="Eliminar acompañante"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-8 md:px-10 md:pb-10 space-y-4">
            {/* Nombre Completo */}
            <div className="relative group">
              <input
                type="text"
                placeholder={t('sections.full_name')}
                value={companion.nombre}
                onChange={(e) => handleInputChange(index, 'nombre', e.target.value)}
                className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_nombre`] ? 'border-red-200 focus:border-red-400' : ''}`}
              />
              {errors[`companion_${index}_nombre`] && (
                <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                  {errors[`companion_${index}_nombre`]}
                </p>
              )}
            </div>

            {/* Fila: Tipo y Número de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <div className="relative" ref={activeDropdown?.index === index && activeDropdown?.type === 'doc' ? dropdownRef : null}>
                <button
                  type="button"
                  onClick={(e) => handleDropdownToggle(index, 'doc', e)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base text-left flex items-center justify-between group ${
                    activeDropdown?.index === index && activeDropdown?.type === 'doc' ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors[`companion_${index}_tipo_documento`] ? 'border-red-200' : ''
                  }`}
                >
                  <span className={`truncate ${companion.tipo_documento ? '' : 'text-brand-text-secondary/40'}`}>
                    {companion.tipo_documento || t('sections.doc_type')}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${activeDropdown?.index === index && activeDropdown?.type === 'doc' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown?.index === index && activeDropdown?.type === 'doc' && (
                  <div className={`absolute left-0 right-0 ${dropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {DOCUMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            onCompanionChange(index, 'tipo_documento', type);
                            setActiveDropdown(null);
                          }}
                          className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                            companion.tipo_documento === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors[`companion_${index}_tipo_documento`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_tipo_documento`]}
                  </p>
                )}
              </div>

              {/* Número de Documento */}
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('sections.doc_number')}
                  value={formatNumber(companion.numero_documento)}
                  onChange={(e) => handleInputChange(index, 'numero_documento', e.target.value)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_numero_documento`] ? 'border-red-200 focus:border-red-400' : ''}`}
                />
                {errors[`companion_${index}_numero_documento`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_numero_documento`]}
                  </p>
                )}
              </div>
            </div>

            {/* Fila: Teléfono y Correo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teléfono */}
              <div className="relative group">
                <input
                  type="text"
                  inputMode="tel"
                  placeholder="Teléfono"
                  value={companion.telefono}
                  onChange={(e) => handleInputChange(index, 'telefono', e.target.value)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_telefono`] ? 'border-red-200 focus:border-red-400' : ''}`}
                />
                {errors[`companion_${index}_telefono`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_telefono`]}
                  </p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div className="relative group">
                <input
                  type="email"
                  placeholder={t('sections.email')}
                  value={companion.correo}
                  onChange={(e) => handleInputChange(index, 'correo', e.target.value)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_correo`] ? 'border-red-200 focus:border-red-400' : ''}`}
                />
                {errors[`companion_${index}_correo`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_correo`]}
                  </p>
                )}
              </div>
            </div>

            {/* Fila: RH, Peso y Estatura (Unificada con Responsable) */}
            <div className="grid grid-cols-12 gap-2 sm:gap-3 items-start">
              {/* RH */}
              <div className="col-span-3 relative" ref={activeDropdown?.index === index && activeDropdown?.type === 'rh' ? dropdownRef : null}>
                <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 block opacity-70 whitespace-nowrap text-center w-full">
                  {t('sections.rh')}
                </label>
                <button
                  type="button"
                  onClick={(e) => handleDropdownToggle(index, 'rh', e)}
                  className={`input-premium !px-2 sm:!px-4 text-left flex items-center justify-between group h-[52px] sm:h-[58px] ${
                    activeDropdown?.index === index && activeDropdown?.type === 'rh' ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors[`companion_${index}_rh`] ? 'border-red-200' : ''
                  }`}
                >
                  <span className={`truncate text-xs sm:text-base ${companion.rh ? '' : 'text-brand-text-secondary/40'}`}>
                    {companion.rh || 'RH'}
                  </span>
                  <svg 
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-brand-primary transition-transform duration-300 ${activeDropdown?.index === index && activeDropdown?.type === 'rh' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown?.index === index && activeDropdown?.type === 'rh' && (
                  <div className={`absolute left-0 right-0 min-w-[70px] sm:min-w-[80px] ${dropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {RH_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            onCompanionChange(index, 'rh', type);
                            setActiveDropdown(null);
                          }}
                          className={`w-full px-2 py-3 sm:py-4 text-center text-xs sm:text-base font-bold transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                            companion.rh === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors[`companion_${index}_rh`] && (
                  <p className="text-[8px] text-red-500 mt-1 ml-1 font-bold uppercase tracking-tight leading-tight">
                    {errors[`companion_${index}_rh`]}
                  </p>
                )}
              </div>

              {/* Peso */}
              <div className="col-span-4 relative group">
                <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 block opacity-70 whitespace-nowrap text-center w-full">
                  {t('sections.weight')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="70"
                    maxLength={3}
                    value={companion.peso_kg}
                    onChange={(e) => handleInputChange(index, 'peso_kg', e.target.value)}
                    className={`input-premium !px-2 sm:!px-4 text-center h-[52px] sm:h-[58px] text-xs sm:text-base !pr-8 sm:!pr-12 ${
                      errors[`companion_${index}_peso_kg`] ? 'border-red-200 focus:border-red-400' : ''
                    }`}
                  />
                  <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[8px] sm:text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">kg</span>
                  </div>
                </div>
                {errors[`companion_${index}_peso_kg`] && (
                  <p className="text-[8px] text-red-500 mt-1 ml-1 font-bold uppercase tracking-tight leading-tight">
                    {errors[`companion_${index}_peso_kg`]}
                  </p>
                )}
              </div>

              {/* Estatura */}
              <div className="col-span-5 relative group">
                <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 block opacity-70 whitespace-nowrap text-center w-full">
                  {t('sections.height')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1.75"
                    maxLength={4}
                    value={companion.estatura_m}
                    onChange={(e) => handleInputChange(index, 'estatura_m', e.target.value)}
                    className={`input-premium !px-2 sm:!px-4 text-center h-[52px] sm:h-[58px] text-xs sm:text-base !pr-6 sm:!pr-10 ${
                      errors[`companion_${index}_estatura_m`] ? 'border-red-200 focus:border-red-400' : ''
                    }`}
                  />
                  <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[8px] sm:text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">m</span>
                  </div>
                </div>
                {errors[`companion_${index}_estatura_m`] && (
                  <p className="text-[8px] text-red-500 mt-1 ml-1 font-bold uppercase tracking-tight leading-tight">
                    {errors[`companion_${index}_estatura_m`]}
                  </p>
                )}
              </div>
            </div>

            {/* Parentesco */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Parentesco (Ej: Hermano, Esposa, Amigo)"
                value={companion.parentesco}
                onChange={(e) => handleInputChange(index, 'parentesco', e.target.value)}
                className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_parentesco`] ? 'border-red-200 focus:border-red-400' : ''}`}
              />
              {errors[`companion_${index}_parentesco`] && (
                <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                  {errors[`companion_${index}_parentesco`]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Botón para añadir otro acompañante más */}
      <button
        onClick={onAddCompanion}
        className="w-full py-6 border-2 border-dashed border-brand-primary/30 rounded-[2.5rem] flex items-center justify-center gap-3 text-brand-primary font-black uppercase tracking-widest hover:bg-brand-primary/5 hover:border-brand-primary transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        Añadir otro acompañante
      </button>
    </div>
  );
};

export default CompanionFormSection;
