import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const now = new Date().toISOString()

    console.log('Starting cleanup of expired bookings at:', now)

    // Delete completed bookings that have ended
    const { error, count } = await supabase
      .from('room_bookings')
      .delete({ count: 'exact' })
      .eq('status', 'completed')
      .lt('end_time', now)

    if (error) {
      throw error
    }

    console.log(`Successfully deleted ${count} expired bookings`)

    return new Response(
      JSON.stringify({ 
        message: `Successfully deleted ${count} expired bookings`,
        deletedCount: count 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error cleaning up expired bookings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})