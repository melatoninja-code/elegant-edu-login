import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file uploaded')
    }

    // Read and parse CSV content
    const csvContent = await file.text()
    const rows = csvContent.split('\n').map(row => row.split(','))
    const headers = rows[0].map(header => header.trim())
    
    // Validate headers
    const requiredHeaders = ['student_id', 'score']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row.length !== headers.length || row.join('').trim() === '') continue

      const rowData: Record<string, any> = {}
      headers.forEach((header, index) => {
        rowData[header.trim()] = row[index].trim()
      })

      try {
        // Get student ID from student_id
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', rowData.student_id)
          .single()

        if (studentError || !studentData) {
          throw new Error(`Student not found with ID: ${rowData.student_id}`)
        }

        // Insert grade
        const { error: insertError } = await supabase
          .from('grades')
          .insert({
            student_id: studentData.id,
            score: parseInt(rowData.score),
            feedback: rowData.feedback || null,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            teacher_id: rowData.teacher_id || null,
          })

        if (insertError) throw insertError
        results.successful++
      } catch (error) {
        results.failed++
        results.errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})