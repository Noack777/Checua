import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Utilidades para el cálculo de festivos en Colombia
 */
const getEasterDate = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const moveToNextMonday = (date) => {
  const day = date.getDay(); // 0: Sunday, 1: Monday...
  if (day === 1) return date;
  const diff = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + diff);
  return nextMonday;
};

const getColombianHolidays = (year) => {
  const holidays = [];

  // Festivos Fijos
  const fixedHolidays = [
    { day: 1, month: 0, name: "Año Nuevo" },
    { day: 1, month: 4, name: "Día del Trabajo" },
    { day: 20, month: 6, name: "Independencia de Colombia" },
    { day: 7, month: 7, name: "Batalla de Boyacá" },
    { day: 8, month: 11, name: "Inmaculada Concepción" },
    { day: 25, month: 11, name: "Navidad" },
  ];

  fixedHolidays.forEach(h => {
    holidays.push(new Date(year, h.month, h.day).toDateString());
  });

  // Festivos Ley Emiliani (Se trasladan al siguiente lunes)
  const emilianiHolidays = [
    new Date(year, 0, 6),   // Reyes Magos
    new Date(year, 2, 19),  // San José
    new Date(year, 5, 29),  // San Pedro y San Pablo
    new Date(year, 7, 15),  // Asunción de la Virgen
    new Date(year, 9, 12),  // Día de la Raza
    new Date(year, 10, 1),  // Todos los Santos
    new Date(year, 10, 11), // Independencia de Cartagena
  ];

  emilianiHolidays.forEach(date => {
    holidays.push(moveToNextMonday(date).toDateString());
  });

  // Festivos basados en Pascua
  const easter = getEasterDate(year);
  
  // Jueves y Viernes Santo
  const thursday = new Date(easter);
  thursday.setDate(easter.getDate() - 3);
  const friday = new Date(easter);
  friday.setDate(easter.getDate() - 2);
  
  holidays.push(thursday.toDateString());
  holidays.push(friday.toDateString());

  // Otros festivos móviles basados en Pascua (se trasladan al lunes)
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  
  const corpus = new Date(easter);
  corpus.setDate(easter.getDate() + 60);
  
  const sagradoCorazon = new Date(easter);
  sagradoCorazon.setDate(easter.getDate() + 68);

  holidays.push(moveToNextMonday(ascension).toDateString());
  holidays.push(moveToNextMonday(corpus).toDateString());
  holidays.push(moveToNextMonday(sagradoCorazon).toDateString());

  return holidays;
};

const DateSelectionSection = ({ onSelect, selectedDate, errors, sectionRef }) => {
  const { t, i18n } = useTranslation();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const scrollRef = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /**
   * Identifica si hoy es el último día del mes
   */
  const isLastDayOfMonth = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay.getMonth() !== date.getMonth();
  };

  /**
   * Calcula los meses visibles (3 o 4 dependiendo de si es fin de mes)
   */
  const monthsToDisplay = useMemo(() => {
    const months = [];
    const monthsCount = isLastDayOfMonth(today) ? 4 : 3;
    
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push(d);
    }
    return months;
  }, [today]);

  const holidays = useMemo(() => {
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;
    return [
      ...getColombianHolidays(currentYear),
      ...getColombianHolidays(nextYear)
    ];
  }, [today]);

  const isHoliday = (date) => holidays.includes(date.toDateString());
  const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isPast = (date) => date < today;

  const handleDateClick = (date) => {
    if (isPast(date)) return;
    
    // Lógica para backend
    const dateSelectionData = {
      fecha_reserva: formatDateISO(date),
      es_fin_de_semana: isWeekend(date),
      es_festivo_colombia: isHoliday(date),
      puede_variar_precio: !isWeekend(date) && !isHoliday(date)
    };
    
    onSelect(date, dateSelectionData);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentMonthIndex(index);
    }
  };

  const scrollToMonth = (index) => {
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const formatDateISO = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateLegible = (date) => {
    if (!date) return "";
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Lógica para backend
  const dateSelectionData = selectedDate ? {
    fecha_reserva: formatDateISO(selectedDate),
    es_fin_de_semana: isWeekend(selectedDate),
    es_festivo_colombia: isHoliday(selectedDate),
    puede_variar_precio: !isWeekend(selectedDate) && !isHoliday(selectedDate)
  } : null;

  const renderMonth = (monthDate, monthIdx) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthName = monthDate.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: 'long' });
    
    // Calcular días del mes
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon...
    // Ajustar para que Lunes sea 0
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding inicial
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${year}-${month}-${i}`} className="h-10 w-10 md:h-11 md:w-11"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const past = isPast(date);
      const holiday = isHoliday(date);
      const weekend = isWeekend(date);
      const selected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const current = isToday(date);

      days.push(
        <button
          key={`day-${year}-${month}-${day}`}
          type="button"
          disabled={past}
          onClick={() => handleDateClick(date)}
          className={`relative h-10 w-10 md:h-11 md:w-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
            ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-brand-light cursor-pointer'}
            ${selected ? 'bg-brand-primary text-white hover:bg-brand-primary shadow-md scale-110 z-10' : ''}
            ${!selected && holiday ? 'text-red-500 bg-red-50' : ''}
            ${!selected && !holiday && weekend ? 'text-brand-dark' : ''}
            ${!selected && !holiday && !weekend && !past ? 'text-brand-text-main' : ''}
            ${current && !selected ? 'border-2 border-brand-primary' : ''}
          `}
        >
          {day}
          {holiday && !selected && (
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></span>
          )}
        </button>
      );
    }

    return (
      <div 
        key={`month-${year}-${month}`} 
        className="min-w-full snap-center px-1 pb-1"
      >
        <div className="bg-white rounded-2xl p-3 md:p-6 border border-brand-border/50 shadow-sm">
          <h4 className="text-sm font-black text-brand-text-main uppercase tracking-widest mb-6 text-center">
            {monthName} {year}
          </h4>
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center justify-items-center">
            {(i18n.language === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'J', 'V', 'S', 'D']).map((d, i) => (
              <div key={`weekday-${d}-${monthIdx}-${i}`} className="text-[10px] md:text-xs font-black text-brand-text-secondary/50 py-2">{d}</div>
            ))}
            {days}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={sectionRef}
      className={`w-full max-w-xl bg-white rounded-[1.5rem] shadow-lg shadow-brand-dark/5 border transition-all duration-300 relative ${
        errors.date ? 'border-red-400 ring-2 ring-red-50' : 'border-brand-border'
      }`}
    >
      {/* Visual Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[1.5rem] ${errors.date ? 'bg-red-400' : 'bg-brand-primary'}`}></div>
      
      <div className="px-5 py-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-brand-text-main flex items-center gap-2">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${
                errors.date ? 'bg-red-100 text-red-600' : 'bg-brand-light text-brand-dark'
              }`}>3</span>
              {t('sections.select_day')}
              <span className="text-brand-primary ml-1 text-xl leading-none">*</span>
            </h3>
            <p className="text-sm md:text-base text-brand-text-secondary mt-1.5 ml-0 md:ml-9">
              {t('sections.availability_next_months')}
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              disabled={currentMonthIndex === 0}
              onClick={() => scrollToMonth(currentMonthIndex - 1)}
              className={`p-2 rounded-full border border-brand-border transition-all duration-300 ${
                currentMonthIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-brand-light text-brand-primary'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              disabled={currentMonthIndex === monthsToDisplay.length - 1}
              onClick={() => scrollToMonth(currentMonthIndex + 1)}
              className={`p-2 rounded-full border border-brand-border transition-all duration-300 ${
                currentMonthIndex === monthsToDisplay.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-brand-light text-brand-primary'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Carousel Container */}
          <div className="relative">
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {monthsToDisplay.map((month, idx) => renderMonth(month, idx))}
            </div>
          </div>

          {/* Indicators & Legend */}
          <div className="flex flex-col items-center gap-6 pt-2">
            {/* Carousel Dots */}
            <div className="flex items-center gap-2">
              {monthsToDisplay.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  onClick={() => scrollToMonth(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentMonthIndex === idx ? 'w-6 bg-brand-primary' : 'w-2 bg-brand-border hover:bg-brand-primary/30'
                  }`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                {t('sections.holiday')}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border-2 border-brand-primary"></span>
                {t('sections.today')}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                {t('sections.selected')}
              </div>
            </div>
          </div>

          <input type="hidden" name="fecha_reserva" value={formatDateISO(selectedDate)} />

          {/* Selection Summary & Price Warning */}
          {selectedDate && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Date Summary */}
              <div className="bg-brand-light/50 border border-brand-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-brand-primary/10 shadow-sm">
                  <span className="text-[10px] font-black text-brand-primary uppercase leading-none mb-1">
                    {selectedDate.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-xl font-black text-brand-text-main leading-none">
                    {selectedDate.getDate()}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">{t('sections.date_confirmation')}</p>
                  <p className="text-brand-text-main font-bold text-sm md:text-base capitalize">
                    {formatDateLegible(selectedDate)}
                  </p>
                  {isHoliday(selectedDate) && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase rounded-full">
                      {t('sections.holiday_tag')}
                    </span>
                  )}
                </div>
              </div>

              {/* Weekday Price Notice */}
              {dateSelectionData.puede_variar_precio && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 animate-in zoom-in-95 duration-300">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center">
                      <span className="text-amber-700 text-[10px] font-black">!</span>
                    </div>
                  </div>
                  <p className="text-amber-800 text-xs md:text-sm font-medium leading-relaxed">
                    {t('sections.price_variation_notice')}
                  </p>
                </div>
              )}
            </div>
          )}
          {errors.date && <p className="text-[10px] text-red-500 mt-1 ml-4 md:ml-13 font-bold uppercase tracking-wider">{errors.date}</p>}
        </div>
      </div>
    </div>
  );
};

export default DateSelectionSection;
