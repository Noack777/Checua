import React from 'react';
import { useTranslation } from 'react-i18next';

const TourSelectionSection = ({ selectedTourId, sectionRef, tours = [], loading = false }) => {
  const { t } = useTranslation();
  const selectedTour = tours.find(tour => tour.id.toString() === selectedTourId);

  return (
    <div 
      ref={sectionRef}
      className="w-full max-w-xl bg-white dark:bg-dark-bg-card rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border border-brand-border dark:border-dark-border transition-all duration-300 relative"
    >
      {/* Visual Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] bg-brand-primary"></div>
      
      <div className="px-5 py-6 md:p-10 space-y-6">
        <div>
          <h3 className="text-base md:text-lg font-bold text-brand-text-main dark:text-dark-text-main flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black bg-brand-light dark:bg-dark-bg-main text-brand-dark dark:text-brand-primary">2</span>
            {t('sections.tour_confirmation')}
            <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
          </h3>
          <p className="text-sm md:text-base text-brand-text-secondary dark:text-dark-text-secondary mt-1.5 ml-0 md:ml-9">
            {t('sections.tour_selected_desc')}
          </p>
        </div>

        <div className="space-y-4">
          {/* Read-only Selection Display */}
          {loading ? (
            <div className="bg-brand-light/20 dark:bg-dark-bg-main/30 border-2 border-dashed border-brand-primary/20 rounded-[2rem] p-8 text-center ml-0 md:ml-9 animate-pulse">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-medium">{t('sections.loading_plan_details')}</p>
            </div>
          ) : selectedTour ? (
            <div className="animate-in fade-in duration-300 ml-0 md:ml-9">
              <div className="bg-brand-light/40 dark:bg-dark-bg-main/40 border-2 border-brand-primary/20 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">{t('sections.selected_plan')}</p>
                  <p className="text-brand-text-main dark:text-dark-text-main font-black text-lg md:text-xl leading-tight">{selectedTour.name}</p>
                </div>
                
                <div className="relative md:text-right border-t md:border-t-0 md:border-l border-brand-primary/10 pt-4 md:pt-0 md:pl-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">{t('sections.price_per_person_label')}</p>
                  <p className="text-brand-dark dark:text-brand-primary font-black text-2xl">
                    ${selectedTour.price.toLocaleString('es-CO')}
                    <span className="text-xs ml-1.5 font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase">COP</span>
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-secondary/50 dark:text-dark-text-secondary/50 mt-3 font-medium italic text-center md:text-left">
                {t('sections.change_tour_hint')}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-dark-bg-main border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl p-8 text-center ml-0 md:ml-9">
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium italic">{t('sections.no_tour_selected')}</p>
            </div>
          )}

          {/* Hidden input for backend compatibility */}
          <input 
            type="hidden" 
            name="id_plan" 
            value={selectedTour ? selectedTour.id : ''} 
          />
        </div>
      </div>
    </div>
  );
};

export default TourSelectionSection;
