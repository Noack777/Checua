import React from 'react';

const ReservationContactSection = ({ data, onChange, errors, sectionRef }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones inmediatas
    let cleanValue = value;
    
    if (name === 'nombre_jefe_reserva') {
      // Solo letras, espacios y caracteres especiales de español (tildes, ñ)
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'telefono_contacto') {
      // Solo números
      cleanValue = value.replace(/\D/g, '');
    }

    onChange(name, cleanValue);
  };

  return (
    <div 
      ref={sectionRef}
      className={`w-full max-w-xl bg-white rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border transition-all duration-300 relative ${
        errors.contact ? 'border-red-400 ring-2 ring-red-50' : 'border-brand-border'
      }`}
    >
      {/* Visual Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] ${errors.contact ? 'bg-red-400' : 'bg-brand-primary'}`}></div>
      
      <div className="px-5 py-6 md:p-10 space-y-8">
          <div>
            <h3 className="text-base md:text-lg font-bold text-brand-text-main flex items-center gap-2">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${
                errors.contact ? 'bg-red-100 text-red-600' : 'bg-brand-light text-brand-dark'
              }`}>1</span>
              Información del jefe de la reserva
              <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
            </h3>
            <p className="text-sm md:text-base text-brand-text-secondary mt-1.5 ml-0 md:ml-9">
              Datos de la persona responsable.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group ml-0 md:ml-9">
              <input
                type="text"
                name="nombre_jefe_reserva"
                placeholder="Nombre completo"
                value={data.nombre_jefe_reserva}
                onChange={handleChange}
                className={`w-full px-5 py-3.5 bg-white border-2 rounded-full text-brand-text-main placeholder-brand-text-secondary/40 focus:outline-none focus:ring-4 transition-all duration-300 font-medium text-sm md:text-base ${
                  errors.nombre_jefe_reserva ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : 'border-brand-border focus:border-brand-primary focus:ring-brand-primary/5'
                }`}
              />
              {errors.nombre_jefe_reserva && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{errors.nombre_jefe_reserva}</p>}
            </div>

            <div className="relative group ml-0 md:ml-9">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                name="telefono_contacto"
                placeholder="Teléfono de contacto"
                value={data.telefono_contacto}
                onChange={handleChange}
                className={`w-full px-5 py-3.5 bg-white border-2 rounded-full text-brand-text-main placeholder-brand-text-secondary/40 focus:outline-none focus:ring-4 transition-all duration-300 font-medium text-sm md:text-base ${
                  errors.telefono_contacto ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : 'border-brand-border focus:border-brand-primary focus:ring-brand-primary/5'
                }`}
              />
              {errors.telefono_contacto && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{errors.telefono_contacto}</p>}
            </div>

            <div className="relative group ml-0 md:ml-9">
              <input
                type="email"
                name="correo_contacto"
                placeholder="Correo electrónico"
                value={data.correo_contacto}
                onChange={handleChange}
                className={`w-full px-5 py-3.5 bg-white border-2 rounded-full text-brand-text-main placeholder-brand-text-secondary/40 focus:outline-none focus:ring-4 transition-all duration-300 font-medium text-sm md:text-base ${
                  errors.correo_contacto ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : 'border-brand-border focus:border-brand-primary focus:ring-brand-primary/5'
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
