// Supabase Edge Function: Phone Number Normalization
// Purpose: Normalize phone numbers to E.164 format server-side
// Usage: Called before storing phone numbers in database

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface PhoneRequest {
  phone: string
  country?: string // Optional country code hint (e.g., 'EG' for Egypt)
}

interface PhoneResponse {
  success: boolean
  normalized?: string
  original: string
  country?: string
  error?: string
}

/**
 * Normalize phone number to E.164 format
 * Handles Egyptian phone numbers with specific rules
 */
function normalizePhoneNumber(phone: string, country = 'EG'): PhoneResponse {
  const original = phone
  
  try {
    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, '')
    
    // If empty after cleaning, return error
    if (!cleaned) {
      return {
        success: false,
        original,
        error: 'No digits found in phone number'
      }
    }
    
    // If it already starts with +, validate and return
    if (cleaned.startsWith('+')) {
      // Remove + for validation
      const digits = cleaned.substring(1)
      
      // E.164 format: 1-15 digits after +
      if (digits.length < 7 || digits.length > 15) {
        return {
          success: false,
          original,
          error: 'Invalid international phone number length'
        }
      }
      
      return {
        success: true,
        normalized: cleaned,
        original,
        country: determineCountry(digits)
      }
    }
    
    // Handle Egyptian phone numbers specifically
    if (country === 'EG') {
      // Remove leading zeros
      cleaned = cleaned.replace(/^0+/, '')
      
      // Egyptian mobile: starts with 1, 10 digits total
      if (cleaned.startsWith('1') && cleaned.length === 10) {
        return {
          success: true,
          normalized: '+20' + cleaned,
          original,
          country: 'EG'
        }
      }
      
      // Egyptian landline: starts with area code, 8-9 digits
      if (cleaned.length >= 8 && cleaned.length <= 9) {
        return {
          success: true,
          normalized: '+20' + cleaned,
          original,
          country: 'EG'
        }
      }
      
      // If starts with 20 (Egypt country code), add +
      if (cleaned.startsWith('20') && cleaned.length >= 12) {
        return {
          success: true,
          normalized: '+' + cleaned,
          original,
          country: 'EG'
        }
      }
    }
    
    // For other countries or unknown format, add + if missing
    // and validate length
    if (cleaned.length >= 7 && cleaned.length <= 15) {
      return {
        success: true,
        normalized: '+' + cleaned,
        original,
        country: determineCountry(cleaned)
      }
    }
    
    return {
      success: false,
      original,
      error: 'Unable to normalize phone number format'
    }
    
  } catch (error) {
    return {
      success: false,
      original,
      error: `Normalization failed: ${error.message}`
    }
  }
}

/**
 * Determine country from phone number (basic implementation)
 */
function determineCountry(digits: string): string {
  if (digits.startsWith('20')) return 'EG' // Egypt
  if (digits.startsWith('1')) return 'US' // US/Canada
  if (digits.startsWith('44')) return 'GB' // UK
  if (digits.startsWith('33')) return 'FR' // France
  if (digits.startsWith('49')) return 'DE' // Germany
  if (digits.startsWith('966')) return 'SA' // Saudi Arabia
  if (digits.startsWith('971')) return 'AE' // UAE
  if (digits.startsWith('965')) return 'KW' // Kuwait
  
  return 'UNKNOWN'
}

/**
 * Validate that normalized phone number is reasonable
 */
function validatePhoneNumber(normalized: string): boolean {
  // Must start with +
  if (!normalized.startsWith('+')) return false
  
  // Remove + and check digits
  const digits = normalized.substring(1)
  
  // Must be all digits
  if (!/^\d+$/.test(digits)) return false
  
  // Must be reasonable length (7-15 digits per E.164)
  if (digits.length < 7 || digits.length > 15) return false
  
  return true
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { phone, country }: PhoneRequest = await req.json()
    
    if (!phone) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          original: '',
          error: 'Phone number is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Normalize the phone number
    const result = normalizePhoneNumber(phone, country)
    
    // Additional validation for normalized number
    if (result.success && result.normalized) {
      if (!validatePhoneNumber(result.normalized)) {
        return new Response(
          JSON.stringify({
            success: false,
            original: phone,
            error: 'Normalized phone number failed validation'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Return the result
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Phone normalization error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        original: '',
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* Usage Example:

POST /functions/v1/normalize-phone
Content-Type: application/json

{
  "phone": "01234567890",
  "country": "EG"
}

Response:
{
  "success": true,
  "normalized": "+201234567890",
  "original": "01234567890",
  "country": "EG"
}

*/
