import React, { useState, useRef, useEffect } from 'react';

const TOUR_OPTIONS = [
  { id: 1, name: "Senderismo por el Desierto", price: 30000 },
  { id: 2, name: "Desierto más Bicicleta", price: 125000 },
  { id: 3, name: "Desierto más Relajación", price: 152000 },
  { id: 4, name: "Escápate a Nemocón", price: 352000 },
  { id: 5, name: "Plan Buggy Extremo", price: 76000 },
  { id: 6, name: "Retiro de Parejas", price: 155000 },
  { id: 7, name: "Noche mágica en el Desierto", price: 150000 },
];

const TourSelectionSection = ({ onSelect, selectedTourId, errors, sectionRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedTour = TOUR_OPTIONS.find(tour => tour.id.toString() === selectedTourId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tourId) => {
    const tour = TOUR_OPTIONS.find(t => t.id === tourId);
    onSelect(tour);
    setIsOpen(false);
  };

  return (
    <div 
      ref={sectionRef}
      className={`w-full max-w-xl bg-white rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border transition-all duration-300 relative ${
        errors.tour ? 'border-red-400 ring-2 ring-red-50' : 'border-brand-border'
      }`}
    >
      {/* Visual Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] ${errors.tour ? 'bg-red-400' : 'bg-brand-primary'}`}></div>
      
      <div className="px-5 py-6 md:p-10 space-y-6">
        <div>
          <h3 className="text-base md:text-lg font-bold text-brand-text-main flex items-center gap-2">
            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${
              errors.tour ? 'bg-red-100 text-red-600' : 'bg-brand-light text-brand-dark'
            }`}>2</span>
            Tipo de tour y lugar de la reserva
            <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
          </h3>
          <p className="text-sm md:text-base text-brand-text-secondary mt-1.5 ml-0 md:ml-9">
            Selecciona el plan que deseas reservar.
          </p>
        </div>

        <div className="space-y-4" ref={dropdownRef}>
          {/* Custom Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              className={`w-full px-6 py-3.5 bg-white border-2 rounded-full text-left transition-all duration-300 flex items-center justify-between group ${
                isOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-brand-border'
              }`}
            >
              <span className={`font-medium text-sm md:text-base ${selectedTour ? 'text-brand-text-main' : 'text-brand-text-secondary/60'}`}>
                {selectedTour ? selectedTour.name : 'Selecciona un plan turístico'}
              </span>
              <svg 
                className={`w-4 h-4 text-brand-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Custom Dropdown List */}
            {isOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-white border border-brand-border rounded-2xl shadow-2xl shadow-brand-dark/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-64 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-brand-primary/20 scrollbar-track-transparent">
                  {TOUR_OPTIONS.map((tour) => (
                    <button
                      key={tour.id}
                      type="button"
                      onClick={() => handleSelect(tour.id)}
                      className={`w-full px-6 py-3 text-left hover:bg-brand-light/50 transition-colors flex flex-col gap-0.5 ${
                        selectedTourId === tour.id.toString() ? 'bg-brand-light/80' : ''
                      }`}
                    >
                      <span className="font-bold text-brand-text-main text-sm md:text-base">{tour.name}</span>
                      <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
                        ${tour.price.toLocaleString('es-CO')} COP / persona
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hidden input for backend compatibility */}
          <input 
            type="hidden" 
            name="tour_reserva" 
            value={selectedTour ? selectedTour.name : ''} 
          />
          {errors.tour && <p className="text-[10px] text-red-500 mt-1 ml-4 font-bold uppercase tracking-wider">{errors.tour}</p>}

          {/* Selection Summary Card */}
          {selectedTour && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-brand-light/50 border border-brand-primary/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">Plan Seleccionado</p>
                  <p className="text-brand-text-main font-bold text-sm md:text-base">{selectedTour.name}</p>
                </div>
                <div className="md:text-right border-t md:border-t-0 md:border-l border-brand-primary/10 pt-2 md:pt-0 md:pl-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">Precio por Persona</p>
                  <p className="text-brand-dark font-black text-lg">
                    ${selectedTour.price.toLocaleString('es-CO')}
                    <span className="text-[10px] ml-1 font-bold text-brand-text-secondary uppercase">COP</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourSelectionSection;
