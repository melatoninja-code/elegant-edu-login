import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async () => {
  try {
    const now = new Date().toISOString()

    // Update bookings where end_time has passed
    const { error } = await supabase
      .from('room_bookings')
      .update({ status: 'completed' })
      .eq('status', 'approved')
      .lt('end_time', now)

    if (error) throw error

    return new Response(JSON.stringify({ message: 'Booking statuses updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})