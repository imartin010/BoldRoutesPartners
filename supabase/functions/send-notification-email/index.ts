// Supabase Edge Function: Send Email Notifications for Form Submissions
// Purpose: Email notifications to Themartining@gmail.com for all form submissions
// Triggered by database webhooks on new applications and deals

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface EmailRequest {
  type: 'application' | 'deal'
  data: any
  submitted_at: string
}

interface EmailResponse {
  success: boolean
  message_id?: string
  error?: string
}

const NOTIFICATION_EMAIL = "Themartining@gmail.com"

/**
 * Format partner application data for email
 */
function formatApplicationEmail(data: any): { subject: string; html: string; text: string } {
  const subject = `🔔 New Partner Application: ${data.company_name}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { background: white; padding: 8px; border-radius: 4px; margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .badge { 
          background: #4CAF50; 
          color: white; 
          padding: 4px 8px; 
          border-radius: 12px; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤝 New Partner Application</h1>
          <p>Bold Routes Partners Platform</p>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">👤 Full Name:</div>
            <div class="value">${data.full_name}</div>
          </div>
          
          <div class="field">
            <div class="label">📞 Phone Number:</div>
            <div class="value">
              <a href="tel:${data.phone}">${data.phone}</a>
              &nbsp;
              <a href="https://wa.me/${data.phone.replace(/[^\d]/g, '')}" style="text-decoration: none;">
                💬 WhatsApp
              </a>
            </div>
          </div>
          
          <div class="field">
            <div class="label">🏢 Company Name:</div>
            <div class="value">${data.company_name}</div>
          </div>
          
          <div class="field">
            <div class="label">👥 Number of Sales Agents:</div>
            <div class="value">${data.agents_count} agents</div>
          </div>
          
          <div class="field">
            <div class="label">📋 Company Registration:</div>
            <div class="value">
              ${data.has_papers 
                ? '<span class="badge">✅ Has Official Papers</span>' 
                : '<span style="background: #ff9800; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">⚠️ No Official Papers</span>'
              }
            </div>
          </div>
          
          <div class="field">
            <div class="label">📅 Submitted:</div>
            <div class="value">${new Date(data.created_at || Date.now()).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>📊 View full details in the <a href="https://your-domain.com/admin">Admin Dashboard</a></p>
          <p style="font-size: 12px; color: #999;">
            This is an automated notification from Bold Routes Partners platform.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
🤝 NEW PARTNER APPLICATION

👤 Full Name: ${data.full_name}
📞 Phone: ${data.phone}
🏢 Company: ${data.company_name}
👥 Agents: ${data.agents_count}
📋 Papers: ${data.has_papers ? 'Yes' : 'No'}
📅 Submitted: ${new Date(data.created_at || Date.now()).toLocaleString()}

View details: https://your-domain.com/admin
  `
  
  return { subject, html, text }
}

/**
 * Format closed deal data for email
 */
function formatDealEmail(data: any): { subject: string; html: string; text: string } {
  const subject = `💰 New Deal Submission: ${data.project_name} - ${Number(data.deal_value).toLocaleString()} EGP`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { background: white; padding: 8px; border-radius: 4px; margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .amount { 
          font-size: 24px; 
          font-weight: bold; 
          color: #4CAF50; 
          text-align: center; 
          padding: 15px; 
          background: #e8f5e8; 
          border-radius: 8px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Deal Submission</h1>
          <p>Bold Routes Partners Platform</p>
        </div>
        
        <div class="content">
          <div class="amount">
            ${Number(data.deal_value).toLocaleString()} EGP
          </div>
          
          <div class="field">
            <div class="label">🏢 Developer:</div>
            <div class="value">${data.developer_name}</div>
          </div>
          
          <div class="field">
            <div class="label">🏗️ Project:</div>
            <div class="value">${data.project_name}</div>
          </div>
          
          <div class="field">
            <div class="label">👤 Client Name:</div>
            <div class="value">${data.client_name}</div>
          </div>
          
          <div class="field">
            <div class="label">🏠 Unit Code:</div>
            <div class="value">${data.unit_code}</div>
          </div>
          
          <div class="field">
            <div class="label">👨‍💼 Developer Sales Rep:</div>
            <div class="value">${data.dev_sales_name}</div>
          </div>
          
          <div class="field">
            <div class="label">📞 Developer Phone:</div>
            <div class="value">
              <a href="tel:${data.dev_phone}">${data.dev_phone}</a>
              &nbsp;
              <a href="https://wa.me/${data.dev_phone.replace(/[^\d]/g, '')}" style="text-decoration: none;">
                💬 WhatsApp
              </a>
            </div>
          </div>
          
          <div class="field">
            <div class="label">📎 Attachments:</div>
            <div class="value">
              ${data.attachments && data.attachments.length > 0 
                ? `${data.attachments.length} file(s) uploaded` 
                : 'No attachments'
              }
            </div>
          </div>
          
          <div class="field">
            <div class="label">📅 Submitted:</div>
            <div class="value">${new Date(data.created_at || Date.now()).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>📊 View full details and attachments in the <a href="https://your-domain.com/admin">Admin Dashboard</a></p>
          <p style="font-size: 12px; color: #999;">
            This is an automated notification from Bold Routes Partners platform.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
💰 NEW DEAL SUBMISSION

🏢 Developer: ${data.developer_name}
🏗️ Project: ${data.project_name}
👤 Client: ${data.client_name}
🏠 Unit: ${data.unit_code}
👨‍💼 Sales Rep: ${data.dev_sales_name}
📞 Phone: ${data.dev_phone}
💰 Value: ${Number(data.deal_value).toLocaleString()} EGP
📎 Files: ${data.attachments?.length || 0}
📅 Submitted: ${new Date(data.created_at || Date.now()).toLocaleString()}

View details: https://your-domain.com/admin
  `
  
  return { subject, html, text }
}

/**
 * Send email using a service (you'll need to configure this)
 * Options: SendGrid, Resend, AWS SES, etc.
 */
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<EmailResponse> {
  // Using Resend as an example (you can change to your preferred service)
  // You'll need to set RESEND_API_KEY in your Supabase Edge Function secrets
  
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  
  if (!RESEND_API_KEY) {
    console.log('📧 Email sending disabled: No RESEND_API_KEY configured')
    console.log('📄 Email content would have been:')
    console.log('Subject:', subject)
    console.log('Text:', text)
    
    return {
      success: true, // Return success for development
      message_id: 'dev-mode-no-email-sent'
    }
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bold Routes Partners <notifications@your-domain.com>', // Change to your domain
        to: [to],
        subject,
        html,
        text,
        tags: [
          { name: 'source', value: 'bold-routes-partners' },
          { name: 'type', value: 'form-submission' }
        ]
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Email API error: ${response.status} - ${error}`)
    }
    
    const result = await response.json()
    return {
      success: true,
      message_id: result.id
    }
    
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
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
    const { type, data, submitted_at }: EmailRequest = await req.json()
    
    if (!type || !data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: type and data' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format email based on submission type
    let emailContent: { subject: string; html: string; text: string }
    
    switch (type) {
      case 'application':
        emailContent = formatApplicationEmail(data)
        break
      case 'deal':
        emailContent = formatDealEmail(data)
        break
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid submission type. Must be "application" or "deal"' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Send the email
    const emailResult = await sendEmail(
      NOTIFICATION_EMAIL,
      emailContent.subject,
      emailContent.html,
      emailContent.text
    )

    // Return the result
    return new Response(
      JSON.stringify(emailResult),
      { 
        status: emailResult.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email notification error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* Usage Examples:

1. Partner Application Notification:
POST /functions/v1/send-notification-email
{
  "type": "application",
  "data": {
    "full_name": "John Doe",
    "phone": "+201234567890",
    "company_name": "ABC Realty",
    "agents_count": 5,
    "has_papers": true,
    "created_at": "2024-12-19T12:00:00Z"
  }
}

2. Deal Submission Notification:
POST /functions/v1/send-notification-email
{
  "type": "deal",
  "data": {
    "developer_name": "Example Developer",
    "project_name": "Example Project",
    "client_name": "John Client",
    "unit_code": "A101",
    "dev_sales_name": "Sales Rep",
    "dev_phone": "+201234567890",
    "deal_value": 1500000,
    "attachments": [{"path": "deals/file1.pdf"}],
    "created_at": "2024-12-19T12:00:00Z"
  }
}

*/
