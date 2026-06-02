import React from 'react';

const TOUR_OPTIONS = [
  { id: 1, name: "Senderismo por el Desierto", price: 30000 },
  { id: 2, name: "Desierto más Bicicleta", price: 125000 },
  { id: 3, name: "Desierto más Relajación", price: 152000 },
  { id: 4, name: "Escápate a Nemocón", price: 352000 },
  { id: 5, name: "Plan Buggy Extremo", price: 76000 },
  { id: 6, name: "Retiro de Parejas", price: 155000 },
  { id: 7, name: "Noche mágica en el Desierto", price: 150000 },
];

const TourSelectionSection = ({ selectedTourId, sectionRef }) => {
  const selectedTour = TOUR_OPTIONS.find(tour => tour.id.toString() === selectedTourId);

  return (
    <div 
      ref={sectionRef}
      className="w-full max-w-xl bg-white rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border border-brand-border transition-all duration-300 relative"
    >
      {/* Visual Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] bg-brand-primary"></div>
      
      <div className="px-5 py-6 md:p-10 space-y-6">
        <div>
          <h3 className="text-base md:text-lg font-bold text-brand-text-main flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black bg-brand-light text-brand-dark">2</span>
            Confirmación de tu experiencia
            <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
          </h3>
          <p className="text-sm md:text-base text-brand-text-secondary mt-1.5 ml-0 md:ml-9">
            Has seleccionado el siguiente plan para tu reserva.
          </p>
        </div>

        <div className="space-y-4">
          {/* Read-only Selection Display */}
          {selectedTour ? (
            <div className="animate-in fade-in duration-300 ml-0 md:ml-9">
              <div className="bg-brand-light/40 border-2 border-brand-primary/20 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">Plan Seleccionado</p>
                  <p className="text-brand-text-main font-black text-lg md:text-xl leading-tight">{selectedTour.name}</p>
                </div>
                
                <div className="relative md:text-right border-t md:border-t-0 md:border-l border-brand-primary/10 pt-4 md:pt-0 md:pl-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">Precio por Persona</p>
                  <p className="text-brand-dark font-black text-2xl">
                    ${selectedTour.price.toLocaleString('es-CO')}
                    <span className="text-xs ml-1.5 font-bold text-brand-text-secondary uppercase">COP</span>
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-secondary/50 mt-3 font-medium italic text-center md:text-left">
                * Para cambiar el tour, por favor recarga la página.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center ml-0 md:ml-9">
              <p className="text-sm text-gray-400 font-medium italic">No se ha seleccionado ningún tour aún.</p>
            </div>
          )}

          {/* Hidden input for backend compatibility */}
          <input 
            type="hidden" 
            name="tour_reserva" 
            value={selectedTour ? selectedTour.name : ''} 
          />
        </div>
      </div>
    </div>
  );
};

export default TourSelectionSection;
