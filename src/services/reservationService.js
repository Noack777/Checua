import { supabase } from '../lib/supabase'

export const createReservation = async (reservation) => {
  try {
    const attempts = [
      {
        planField: 'id_plan',
        phoneField: 'telefono_cliente',
        dateField: 'fecha_reserva',
        timeField: 'hora_reserva'
      },
      {
        planField: 'id_plan',
        phoneField: 'telefono_cliente',
        dateField: 'fecha',
        timeField: 'hora'
      },
      {
        planField: 'plan_id',
        phoneField: 'telefono_cliente',
        dateField: 'fecha',
        timeField: 'hora'
      },
      {
        planField: 'id_plan',
        phoneField: 'telefono',
        dateField: 'fecha',
        timeField: 'hora'
      }
    ]

    const lastError = { value: null }

    for (const attempt of attempts) {
      const payload = {
        [attempt.planField]: reservation.id_plan,
        [attempt.phoneField]: reservation.telefono_cliente,
        [attempt.dateField]: reservation.fecha_reserva,
        [attempt.timeField]: reservation.hora_reserva
      }

      if (payload[attempt.timeField] === undefined) payload[attempt.timeField] = null

      const { data, error } = await supabase
        .from('reserva')
        .insert(payload)
        .select()
        .single()

      if (!error) return { data, error: null }

      lastError.value = error

      const msg = (error?.message || '').toLowerCase()
      const isSchemaMismatch =
        error?.code === 'PGRST204' ||
        msg.includes('could not find') ||
        msg.includes('column') ||
        msg.includes('schema cache')

      if (!isSchemaMismatch) {
        return { data: null, error }
      }
    }

    return { data: null, error: lastError.value }
  } catch (err) {
    console.error('Error in createReservation service:', err)
    return { data: null, error: err }
  }
}
