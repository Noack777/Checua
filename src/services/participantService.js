import { supabase } from '../lib/supabase'

/**
 * Inserta múltiples participantes en la tabla 'participante'
 * @param {Array<Object>} participants Lista de participantes formateados para Supabase
 * @returns {Promise<{data: any, error: any}>}
 */
export const createParticipants = async (participants) => {
  try {
    const { data, error } = await supabase
      .from('participante')
      .insert(participants)
      .select()

    return { data, error }
  } catch (err) {
    console.error('Error in createParticipants service:', err)
    return { data: null, error: err }
  }
}
