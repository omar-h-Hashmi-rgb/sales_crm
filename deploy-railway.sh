#!/bin/bash

# Sales CRM - Quick Deployment Script for Railway
# Run this script to deploy the backend to Railway

echo "🚀 Sales CRM - Railway Deployment"
echo "================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd backend

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Create new project or link existing
echo "📦 Creating/linking Railway project..."
railway link

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add postgresql

# Deploy the backend
echo "🚀 Deploying backend..."
railway up

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set FRONTEND_URL=https://your-app.netlify.app

echo "✅ Backend deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the Railway URL from your dashboard"
echo "2. Update FRONTEND_URL environment variable with your Netlify URL"
echo "3. Run migrations: railway run npm run migrate"
echo "4. Seed database: railway run npm run seed"
echo "5. Deploy frontend to Netlify with the Railway API URL"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"