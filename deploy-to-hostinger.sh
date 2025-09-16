#!/bin/bash

# Bold Routes Partners - Manual Deployment Script for Hostinger
# Run this script on your Hostinger server

echo "🚀 Starting Bold Routes Partners deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull changes from GitHub"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

# Copy build files to public directory
echo "📁 Copying build files to public_html..."
cp -r dist/* public_html/

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to copy build files"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 public_html/

# Verify deployment
if [ -f "public_html/index.html" ]; then
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your application should now be available at boldroutes-partners.com"
else
    echo "❌ Error: index.html not found in public_html directory"
    exit 1
fi

echo "🎉 Deployment process completed!"
