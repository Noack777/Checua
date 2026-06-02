import { supabase } from '../lib/supabase'
import { TOUR_OPTIONS as STATIC_TOURS } from '../constants/tours'

export const getTours = async () => {
  // Si no hay credenciales reales, devolvemos el fallback inmediatamente sin intentar conectar
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return STATIC_TOURS
  }

  try {
    const { data, error } = await supabase
      .from('plan')
      .select('id_plan, nombre_plan, precio_plan, descripcion_basica')
      .order('id_plan', { ascending: true })

    if (error) {
      console.error('Error al obtener planes de Supabase:', error.message)
      return STATIC_TOURS
    }

    if (!data || data.length === 0) {
      return STATIC_TOURS
    }

    // Mapeamos los nombres de la DB a los nombres que usa el Frontend
    return data.map(item => ({
      id: item.id_plan,
      name: item.nombre_plan,
      price: item.precio_plan,
      description: item.descripcion_basica
    }))
  } catch (err) {
    console.error('Error inesperado al conectar con Supabase:', err)
    return STATIC_TOURS
  }
}
