import { supabase } from '../lib/supabase'
import { TOUR_OPTIONS as STATIC_TOURS } from '../constants/tours'

export const getTours = async () => {
  // Si no hay credenciales reales, devolvemos el fallback inmediatamente
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
    console.log('--- MODO FALLBACK: No se detectó URL de Supabase ---');
    return STATIC_TOURS
  }

  try {
    console.log('--- Intentando conectar a Supabase... ---');
    const { data, error } = await supabase
      .from('plan')
      .select('id_plan, nombre_plan, precio_plan, descripcion_basica')
      .order('id_plan', { ascending: true })

    if (error) {
      console.error('--- ERROR DE SUPABASE ---', error.message);
      if (error.message.includes('secret API key')) {
        console.error('ATENCIÓN: Estás usando la "service_role" key. Debes usar la "anon" key en tu .env.local');
      }
      return STATIC_TOURS
    }

    if (!data || data.length === 0) {
      console.warn('--- AVISO: La tabla "plan" está vacía o RLS bloquea el acceso ---');
      console.log('Sugerencia: Revisa en Supabase que RLS tenga una política que permita SELECT a usuarios anon.');
      return STATIC_TOURS
    }

    console.log(`--- ÉXITO: Se cargaron ${data.length} planes desde la DB ---`);
    
    // Mapeamos los nombres de la DB a los nombres que usa el Frontend
    return data.map(item => ({
      id: item.id_plan,
      name: item.nombre_plan,
      price: item.precio_plan,
      description: item.descripcion_basica
    }))
  } catch (err) {
    console.error('--- ERROR INESPERADO ---', err);
    return STATIC_TOURS
  }
}
