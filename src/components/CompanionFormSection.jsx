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
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState('down');
  const dropdownRef = useRef(null);

  const DOCUMENT_TYPES = [
    t('doc_types.cc'),
    t('doc_types.ti'),
    t('doc_types.ce'),
    t('doc_types.pas'),
    t('doc_types.ppt')
  ];

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenDropdownIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (index, event) => {
    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 250 ? 'up' : 'down');
      setOpenDropdownIndex(index);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (index, field, value) => {
    let cleanValue = value;
    if (field === 'numero_documento') {
      cleanValue = value.replace(/\D/g, '');
    }
    if (field === 'nombre') {
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
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
                placeholder="Nombre completo"
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
              <div className="relative" ref={openDropdownIndex === index ? dropdownRef : null}>
                <button
                  type="button"
                  onClick={(e) => handleDropdownToggle(index, e)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base text-left flex items-center justify-between group ${
                    openDropdownIndex === index ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors[`companion_${index}_tipo_documento`] ? 'border-red-200' : ''
                  }`}
                >
                  <span className={`truncate ${companion.tipo_documento ? '' : 'text-brand-text-secondary/40'}`}>
                    {companion.tipo_documento || t('sections.doc_type')}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${openDropdownIndex === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdownIndex === index && (
                  <div className={`absolute left-0 right-0 ${dropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {DOCUMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            onCompanionChange(index, 'tipo_documento', type);
                            setOpenDropdownIndex(null);
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
