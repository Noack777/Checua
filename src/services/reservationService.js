import { supabase } from '../lib/supabase'

export const createReservation = async (reservation) => {
  try {
    const { data, error } = await supabase
      .from('reserva')
      .insert(reservation)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error in createReservation service:', err)
    return { data: null, error: err }
  }
}
