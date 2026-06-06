import { supabase } from '../lib/supabase'
export const getTours = async () => {
  try {
    const { data, error } = await supabase
      .from('plan')
      .select('id_plan, nombre_plan, precio_plan, descripcion_basica')
      .order('id_plan', { ascending: true })

    if (error) {
      console.error('--- ERROR DE SUPABASE ---', error.message);
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Mapeamos los nombres de la DB a los nombres que usa el Frontend
    return data.map(item => ({
      id: item.id_plan,
      name: item.nombre_plan,
      price: item.precio_plan,
      description: item.descripcion_basica
    }))
  } catch (err) {
    console.error('--- ERROR INESPERADO ---', err);
    return []
  }
}

/**
 * Obtiene los horarios disponibles desde la base de datos
 * @returns {Promise<Array>}
 */
export const getSchedules = async () => {
  try {
    const { data, error } = await supabase
      .from('horario')
      .select('id_horario, hora, periodo')
      .order('hora', { ascending: true })

    if (error) {
      console.error('--- ERROR AL CARGAR HORARIOS ---', error.message);
      return []
    }

    return data.map(item => ({
      id: item.id_horario,
      label: item.hora,
      value: item.hora, // Podría ser un formato HH:mm
      period: item.periodo // 'mañana' o 'tarde'
    }))
  } catch (err) {
    console.error('--- ERROR INESPERADO EN HORARIOS ---', err);
    return []
  }
}
