import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { Database } from "../database.types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment variables
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface RazorpayWebhookPayload {
  event: string
  account_id: string
  created_at: number
  contains: string[]
  payload: {
    payment: {
      entity: {
        id: string
        amount: number
        currency: string
        status: string
        order_id: string
        method: string
        description: string
        created_at: number
        email?: string
        contact?: string
      }
    }
  }
}

// Verify webhook signature using HMAC SHA256
async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    )
    
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Process payment captured event
async function handlePaymentCaptured(
  supabase: any,
  payment: any
): Promise<void> {
  try {
    // Update payment history
    const { error: paymentError } = await supabase
      .from('payment_history')
      .update({
        status: 'success',
        payment_method: payment.method,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment.id)

    if (paymentError) {
      console.error('Error updating payment history:', paymentError)
      throw paymentError
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('razorpay_orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', payment.order_id)

    if (orderError) {
      console.error('Error updating order status:', orderError)
      throw orderError
    }

    // Activate subscription (if applicable)
    const { data: orderData } = await supabase
      .from('razorpay_orders')
      .select('user_id')
      .eq('razorpay_order_id', payment.order_id)
      .single()

    if (orderData?.user_id) {
      await activateSubscription(supabase, orderData.user_id)
    }

    console.log('Payment captured successfully:', payment.id)
  } catch (error) {
    console.error('Error processing payment captured:', error)
    throw error
  }
}

// Process payment failed event
async function handlePaymentFailed(
  supabase: any,
  payment: any
): Promise<void> {
  try {
    // Update payment history
    const { error: paymentError } = await supabase
      .from('payment_history')
      .update({
        status: 'failed',
        failure_reason: 'Payment failed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment.id)

    if (paymentError) {
      console.error('Error updating payment history:', paymentError)
      throw paymentError
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('razorpay_orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', payment.order_id)

    if (orderError) {
      console.error('Error updating order status:', orderError)
      throw orderError
    }

    console.log('Payment failed processed:', payment.id)
  } catch (error) {
    console.error('Error processing payment failed:', error)
    throw error
  }
}

// Activate subscription for user
async function activateSubscription(supabase: any, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error activating subscription:', error)
      throw error
    }

    console.log('Subscription activated for user:', userId)
  } catch (error) {
    console.error('Error activating subscription:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify webhook secret is configured
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook not properly configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get request body and signature
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify webhook signature
    if (!await verifyWebhookSignature(body, signature, RAZORPAY_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse webhook payload
    let payload: RazorpayWebhookPayload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      console.error('Invalid JSON payload:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Process webhook event
    const { event, payload: webhookPayload } = payload;
    const payment = webhookPayload.payment.entity

    console.log(`Processing webhook event: ${event}`)

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabase, payment)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(supabase, payment)
        break
      
      default:
        console.log(`Unhandled event type: ${event}`)
    }

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})