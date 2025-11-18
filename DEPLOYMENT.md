# Sales CRM - Deployment Guide

## 🚀 Production Deployment Guide

This guide covers the complete deployment process for the Sales CRM application, including both frontend (Netlify) and backend deployment options.

## 📋 Pre-Deployment Checklist

✅ **Completed Items:**
- [x] Backend API fully tested and working
- [x] Frontend build successful with minimal warnings
- [x] Database schema migrated and seeded
- [x] Authentication system working
- [x] All CRUD operations tested

🔄 **Remaining Tasks:**
- [ ] Deploy backend to production hosting service
- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables for production
- [ ] Deploy frontend to Netlify
- [ ] Test full production deployment

## 🖥️ Backend Deployment Options

### Option 1: Railway (Recommended - Easy & Free Tier)

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app/)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd backend
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial backend commit"
   ```

3. **Connect to Railway**
   - Create new project in Railway
   - Connect your GitHub repository
   - Select the backend folder for deployment

4. **Configure Environment Variables in Railway:**
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=[Railway PostgreSQL Host]
   DB_PORT=5432
   DB_NAME=[Database Name]
   DB_USER=[Database User]
   DB_PASSWORD=[Database Password]
   JWT_SECRET=[Generate Strong Secret]
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app-name.netlify.app
   ```

5. **Add PostgreSQL Database**
   - In Railway dashboard, add PostgreSQL plugin
   - Copy connection details to environment variables

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   heroku create your-app-name-backend
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set JWT_EXPIRES_IN=7d
   heroku config:set FRONTEND_URL=https://your-app-name.netlify.app
   
   # Deploy
   git push heroku main
   
   # Run migrations
   heroku run npm run migrate
   heroku run npm run seed
   ```

### Option 3: DigitalOcean App Platform

1. **Create Account**
   - Sign up at [DigitalOcean](https://www.digitalocean.com/)

2. **Deploy via App Platform**
   - Create new app from GitHub repository
   - Configure build and run commands
   - Add PostgreSQL database
   - Set environment variables

## 🌐 Frontend Deployment (Netlify)

### Automatic Deployment

1. **Prepare Frontend for Production**
   
   The frontend is already configured with:
   - ✅ `_redirects` file for SPA routing
   - ✅ `netlify.toml` configuration
   - ✅ Production build ready

2. **Deploy to Netlify**
   
   **Option A: Git Integration (Recommended)**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```
   
   - Go to [Netlify](https://www.netlify.com/)
   - Sign up with GitHub
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `build`
     - Base directory: `frontend`

   **Option B: Manual Upload**
   ```bash
   cd frontend
   npm run build
   # Upload the 'build' folder to Netlify
   ```

3. **Configure Environment Variables in Netlify**
   - Go to Site Settings > Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.herokuapp.com/api`

4. **Update Backend CORS Settings**
   - Add your Netlify URL to the FRONTEND_URL environment variable
   - Redeploy backend with updated CORS settings

## 🔧 Environment Configuration

### Production Environment Variables

**Backend (.env for local development):**
```env
PORT=5000
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=sales_crm_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.netlify.app
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

## 📝 Step-by-Step Deployment Process

### Step 1: Deploy Backend First

1. Choose your hosting service (Railway/Heroku/DigitalOcean)
2. Create PostgreSQL database
3. Deploy backend code
4. Run migrations: `npm run migrate`
5. Seed database: `npm run seed`
6. Test API endpoints work

### Step 2: Deploy Frontend

1. Update `REACT_APP_API_URL` in environment variables
2. Deploy to Netlify
3. Configure environment variables
4. Test login and all functionality

### Step 3: Final Configuration

1. Update backend CORS with frontend URL
2. Test full application flow
3. Verify all features working in production

## 🧪 Testing Production Deployment

### Backend API Tests
```bash
# Test API health
curl https://your-backend-url.herokuapp.com

# Test login
curl -X POST https://your-backend-url.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'

# Test leads endpoint (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url.herokuapp.com/api/leads
```

### Frontend Tests
- [ ] Login page loads correctly
- [ ] Authentication works with production API
- [ ] Dashboard displays data
- [ ] All pages accessible
- [ ] CRUD operations work
- [ ] Responsive design works on mobile

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets (min 32 characters)
   - Use secure database passwords

2. **Database Security**
   - Enable SSL connections
   - Restrict database access by IP
   - Regular backups

3. **API Security**
   - CORS properly configured
   - Rate limiting (add if needed)
   - Input validation active

## 📊 Monitoring & Maintenance

1. **Database Backups**
   - Set up automated daily backups
   - Test restore procedures

2. **Logs Monitoring**
   - Monitor application logs
   - Set up error alerts

3. **Performance Monitoring**
   - Monitor API response times
   - Track user sessions

## 🆘 Troubleshooting

### Common Issues

**CORS Errors:**
- Check FRONTEND_URL in backend environment variables
- Ensure Netlify URL matches exactly

**Database Connection:**
- Verify all DB environment variables
- Check database is accessible from hosting platform

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies installed

**API Not Working:**
- Check backend deployment logs
- Verify environment variables set correctly
- Test API endpoints directly

## 📞 Support

If you encounter issues during deployment:
1. Check deployment logs in your hosting platform
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check browser developer console for frontend errors

---

**Ready for Production! 🚀**

Your Sales CRM is now ready to be deployed to production with a robust, scalable architecture.