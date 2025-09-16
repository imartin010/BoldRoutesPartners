# Hostinger Deployment Guide for Bold Routes Partners

## Current Status
- ✅ Code is ready and pushed to GitHub
- ✅ GitHub Actions workflow is configured
- ❌ Deployment is failing (needs Hostinger secrets configuration)

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

1. **VITE_SUPABASE_URL**: `https://mdqqqogshgtpzxtufjzn.supabase.co`
2. **VITE_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8`
3. **HOSTINGER_HOST**: Your Hostinger server IP address
4. **HOSTINGER_USERNAME**: Your Hostinger username
5. **HOSTINGER_SSH_KEY**: Your SSH private key for Hostinger
6. **HOSTINGER_PORT**: SSH port (usually 22)
7. **HOSTINGER_PATH**: Path to your website directory on Hostinger

## Steps to Configure GitHub Secrets

1. Go to your GitHub repository: https://github.com/imartin010/BoldRoutesPartners
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret" for each required secret
5. Add all the secrets listed above

## Hostinger Setup Requirements

1. **SSH Access**: Ensure SSH is enabled on your Hostinger account
2. **Git Repository**: Clone your repository on Hostinger server
3. **Node.js**: Ensure Node.js 18+ is installed on Hostinger
4. **Domain**: Point boldroutes-partners.com to your Hostinger hosting

## Manual Deployment (Alternative)

If GitHub Actions continues to fail, you can deploy manually:

1. SSH into your Hostinger server
2. Navigate to your website directory
3. Run: `git pull origin main`
4. Run: `npm ci`
5. Run: `npm run build`
6. Copy build files: `cp -r dist/* public_html/`
7. Set permissions: `chmod -R 755 public_html/`

## Domain Configuration

Ensure your domain `boldroutes-partners.com` is:
1. Pointed to your Hostinger server IP
2. DNS propagation is complete
3. SSL certificate is configured

## Troubleshooting

- Check GitHub Actions logs for specific error messages
- Verify SSH key permissions on Hostinger
- Ensure all required secrets are properly configured
- Check if Node.js and npm are available on Hostinger server

## Current Features Ready for Deployment

- ✅ Project images from Supabase database
- ✅ Projects without images are hidden
- ✅ Admin panel functionality
- ✅ User authentication
- ✅ Commission tracking
- ✅ Deal management
- ✅ Inventory management
