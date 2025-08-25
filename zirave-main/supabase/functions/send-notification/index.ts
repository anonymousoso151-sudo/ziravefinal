import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'product' | 'system';
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, title, message, type, data }: NotificationRequest = await req.json()

    // Get user's notification preferences and device tokens
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error(`User not found: ${profileError.message}`)
    }

    // Log notification (in a real app, you'd send push notifications here)
    console.log(`Notification for ${profile.full_name} (${profile.phone}):`)
    console.log(`Title: ${title}`)
    console.log(`Message: ${message}`)
    console.log(`Type: ${type}`)
    console.log(`Data:`, data)

    // In a production environment, you would:
    // 1. Send push notification via FCM/APNS
    // 2. Send SMS if enabled
    // 3. Store notification in database for in-app display
    // 4. Send email if configured

    // For now, we'll just store it in a notifications table (if it exists)
    const notificationRecord = {
      user_id: userId,
      title,
      message,
      type,
      data: data || {},
      is_read: false,
      created_at: new Date().toISOString()
    }

    // Try to insert notification record (table might not exist yet)
    const { error: insertError } = await supabaseClient
      .from('notifications')
      .insert([notificationRecord])

    // Don't fail if notifications table doesn't exist
    if (insertError && !insertError.message.includes('relation "notifications" does not exist')) {
      console.error('Failed to store notification:', insertError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification processed successfully',
        recipient: profile.full_name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})