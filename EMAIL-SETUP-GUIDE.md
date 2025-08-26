# Email Notifications Setup Guide

**Goal:** Receive all form submissions at `Themartining@gmail.com`

## 📧 What's Been Set Up

### ✅ Automatic Email Notifications
- **Edge Function:** `send-notification-email` - formats and sends beautiful HTML emails
- **Database Triggers:** Automatically fire when new submissions are made
- **Backup System:** Frontend also calls the email function as failsafe
- **Email Templates:** Professional HTML emails with all submission details

### 📨 Email Features
- **Beautiful HTML Design:** Professional emails with company branding
- **Rich Content:** All form data formatted clearly
- **Quick Actions:** Click-to-call phone numbers, WhatsApp links
- **Admin Links:** Direct links to admin dashboard
- **Fallback Text:** Plain text version for all email clients

## 🚀 Setup Steps

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Deploy the email notification function
supabase functions deploy send-notification-email --project-ref mdqqqogshgtpzxtufjzn
```

### 2. Configure Email Service

**Option A: Resend (Recommended)**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add it to Supabase Edge Function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   ```

**Option B: Alternative Services**
- SendGrid, AWS SES, Mailgun, etc.
- Update the `sendEmail` function in the Edge Function code

### 3. Run Database Migration

In your Supabase SQL Editor, run:
```sql
-- Run the email notifications migration
-- File: supabase/migrations/003_setup_email_notifications.sql
```

This creates:
- Database triggers for automatic emails
- Notification logging table
- Manual testing functions

### 4. Test the Setup

```sql
-- Insert a test application (will trigger email)
INSERT INTO partner_applications (full_name, phone, company_name, agents_count, has_papers)
VALUES ('Test Partner', '+201234567890', 'Test Company', 5, true);

-- Insert a test deal (will trigger email)
INSERT INTO closed_deals (developer_name, project_name, client_name, unit_code, dev_sales_name, dev_phone, deal_value, attachments)
VALUES ('Test Developer', 'Test Project', 'Test Client', 'A101', 'Test Sales', '+201234567890', 1500000, '[]');
```

## 📧 Email Templates

### Partner Application Email
```
Subject: 🔔 New Partner Application: [Company Name]

Content:
- Full name and contact info
- Company details and agent count
- Registration status
- Click-to-call and WhatsApp links
- Direct link to admin dashboard
```

### Deal Submission Email
```
Subject: 💰 New Deal Submission: [Project] - [Amount] EGP

Content:
- Deal value prominently displayed
- Developer and project information
- Client and unit details
- Contact information with quick actions
- Attachment count and admin link
```

## 🛠️ Development Mode

**Without Email Service Configured:**
- Edge Function runs in development mode
- Email content is logged to console instead of sending
- All functionality works except actual email delivery
- Perfect for testing the complete flow

**To Enable Actual Emails:**
1. Configure an email service (Resend recommended)
2. Add API key to Supabase secrets
3. Update the `from` address in the Edge Function

## 🔧 Customization Options

### Email Content
- Edit `formatApplicationEmail()` and `formatDealEmail()` functions
- Modify HTML templates, styling, and content structure
- Add more data fields or formatting

### Notification Settings
- Change recipient email in `NOTIFICATION_EMAIL` constant
- Add multiple recipients by modifying the email sending logic
- Set up different emails for different submission types

### Trigger Conditions
- Modify database triggers to filter certain submissions
- Add conditional logic for specific scenarios
- Create different notification rules

## 📊 Monitoring

### Notification Log Table
```sql
-- View sent email notifications
SELECT * FROM notification_log ORDER BY created_at DESC;

-- Check failed notifications
SELECT * FROM notification_log WHERE email_sent = false;
```

### Manual Testing
```sql
-- Send test notification for existing submission
SELECT send_test_notification('application', 'submission-uuid-here');
SELECT send_test_notification('deal', 'deal-uuid-here');
```

## 🚨 Troubleshooting

### Common Issues
1. **Emails not sending:** Check Edge Function logs in Supabase dashboard
2. **Invalid API key:** Verify email service credentials in secrets
3. **Trigger not firing:** Check if database triggers are properly created
4. **Wrong email format:** Verify email templates in Edge Function

### Debug Steps
1. Check Supabase Edge Function logs
2. Test manual notification function
3. Verify database triggers exist
4. Check notification_log table for errors

## 📈 Next Steps

1. **Set up email service** (Resend recommended)
2. **Deploy Edge Function** to Supabase
3. **Run database migration** for triggers
4. **Test with real submissions**
5. **Monitor notification logs**

**Once configured, you'll receive instant email notifications at `Themartining@gmail.com` for every form submission!** 🎉
