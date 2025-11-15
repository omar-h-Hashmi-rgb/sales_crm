# Sales CRM - Lead Management System

> A comprehensive Sales CRM application built with Node.js, Express, React, and PostgreSQL for managing leads, assignments, and tracking conversions.


![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D12.0-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Frontend Architecture](#-frontend-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [Usage](#-usage)
- [Environment Variables](#-environment-variables)


## 🚀 Features

### 🎯 Core Functionality
- **Lead Management**: Create, view, update, and assign leads with comprehensive tracking
- **4-Tier Permission System**: Admin → Area Manager → Store Manager → Sales Rep
- **Fresh Leads Protection**: Only assignment allowed until first assignment to maintain lead quality
- **Status Tracking**: Complete history and comments system for lead lifecycle management
- **Conversion Tracking**: Automatic lead conversion when booking matches phone number
- **Assignment Logic**: Higher tiers can assign to lower tiers with proper hierarchy enforcement
- **Mobile Number Validation**: Indian mobile number format support with +91 prefix handling

### 🖥️ User Interface
- **Responsive Design**: Fully responsive design that works on desktop, tablet, and mobile
- **List & Grouped Views**: View leads by list or group by location/services for better organization
- **Advanced Filtering**: Search, filter by status, source, assignee, dates with real-time updates
- **Real-time Notifications**: Toast notifications for all actions and API responses
- **Permission-based UI**: Different capabilities and UI elements based on user tier level
- **Modern UI**: Clean, modern interface using Tailwind CSS with consistent styling

### 📊 Analytics & Reporting
- **Dashboard Metrics**: Real-time statistics for leads, conversions, and performance
- **Lead Performance**: Conversion rates, assignment tracking, and team performance
- **Activity Timeline**: Complete audit trail of all lead activities and status changes

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v16+) with Express.js framework
- **Database**: PostgreSQL (v12+) with connection pooling
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Validation**: Joi schema validation for request data
- **Security**: CORS enabled, helmet for security headers
- **Development**: Nodemon for hot reloading

### Frontend
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6 for client-side navigation
- **Styling**: Tailwind CSS for utility-first styling
- **HTTP Client**: Axios with request/response interceptors
- **State Management**: React Context API for authentication and global state
- **UI Components**: Headless UI for accessible components
- **Icons**: Heroicons for consistent iconography
- **Notifications**: React Hot Toast for user feedback
- **Date Handling**: Date-fns for date formatting and manipulation

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint for code linting
- **Build Tool**: Create React App with Webpack
- **CSS Processing**: PostCSS with Autoprefixer

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)
- **Git** for cloning the repository

### 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sales-crm.git
cd sales-crm
```

2. **Set up PostgreSQL Database**
```bash
# Create database
createdb -U postgres sales_crm

# Verify connection
psql -U postgres -d sales_crm
```

### 🔧 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (copy from example)
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

**Backend will be running at:** `http://localhost:5000`

### 🎨 Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file (already configured)
# .env file already exists with proper API URL

# Start development server
npm start
```

**Frontend will be running at:** `http://localhost:3000`

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier_level INTEGER NOT NULL, -- 1=Admin, 2=Area Manager, 3=Store Manager, 4=Sales Rep
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Leads
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    source VARCHAR(50) NOT NULL, -- 'meta', 'google_ads', 'manual'
    source_campaign_id VARCHAR(255),
    source_ad_id VARCHAR(255),
    name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    location TEXT,
    address TEXT,
    services TEXT[],
    service_category VARCHAR(100),
    notes TEXT,
    assigned_to_user_id UUID,
    assigned_to_tier INTEGER,
    assigned_at TIMESTAMPTZ,
    assigned_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'new',
    is_fresh BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    converted_to_booking_id UUID,
    converted_to_customer_id INTEGER,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_contacted_at TIMESTAMPTZ
);
```

### Supporting Tables
- **lead_comments**: Track all comments and notes on leads
- **lead_status_history**: Complete audit trail of status changes
- **bookings**: Customer bookings with lead conversion tracking

## 🔌 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Leads Management

#### Get All Leads
```http
GET /api/leads?page=1&limit=20&status=new&search=john
Authorization: Bearer <token>
```

#### Create Lead
```http
POST /api/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "location": "Mumbai",
  "services": ["Car Wash", "Oil Change"],
  "source": "google_ads"
}
```

#### Assign Lead
```http
PATCH /api/leads/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assigned_to_user_id": "uuid",
  "notes": "Assigning to sales rep for follow-up"
}
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🏗️ Frontend Architecture

### Project Structure
```
src/
├── components/
│   ├── Auth/
│   │   └── ProtectedRoute.js
│   ├── Bookings/
│   │   └── BookingForm.js
│   ├── Common/
│   │   ├── LoadingSpinner.js
│   │   ├── Modal.js
│   │   ├── Pagination.js
│   │   └── StatusBadge.js
│   ├── Layout/
│   │   ├── Header.js
│   │   ├── Layout.js
│   │   └── Sidebar.js
│   └── Leads/
│       ├── LeadCard.js
│       ├── LeadDetailsModal.js
│       ├── LeadFilters.js
│       ├── LeadForm.js
│       └── LeadsList.js
├── contexts/
│   └── AuthContext.js
├── pages/
│   ├── BookingsPage.js
│   ├── CreateLeadPage.js
│   ├── Dashboard.js
│   ├── LeadsPage.js
│   ├── Login.js
│   └── ReportsPage.js
├── utils/
│   └── api.js
├── App.js
└── index.js
```

### State Management
- **Authentication**: React Context with localStorage persistence
- **API State**: Local component state with useEffect hooks
- **Form State**: Controlled components with validation

### Routing
- **Public Routes**: `/login`
- **Protected Routes**: All other routes require authentication
- **Route Guards**: ProtectedRoute component checks authentication status

## 🔐 Authentication & Authorization

### User Tiers & Permissions

| Tier | Role | Permissions |
|------|------|-------------|
| 1 | **Admin** | Full access: create/edit/delete leads, assign to anyone, manage users |
| 2 | **Area Manager** | Create leads, assign to Store Managers & Sales Reps, view team performance |
| 3 | **Store Manager** | Create leads, assign to Sales Reps only, view assigned leads |
| 4 | **Sales Rep** | View assigned leads, update status, add comments |

### Assignment Rules
- Higher tiers can assign leads to lower tiers
- Users can only assign leads within their hierarchy
- Fresh leads can only be assigned (no status changes until first assignment)
- Assignment creates audit trail with timestamp and assignee info

### Security Features
- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- CORS protection
- Request rate limiting
- Input validation and sanitization

## 📱 Usage

### Default Login Credentials

| Role | Email | Password | Tier |
|------|-------|----------|------|
| Admin | admin@company.com | password123 | 1 |
| Area Manager | john.manager@company.com | password123 | 2 |
| Store Manager | sarah.store@company.com | password123 | 3 |
| Sales Rep | mike.sales@company.com | password123 | 4 |
| Sales Rep | lisa.sales@company.com | password123 | 4 |

### Common Workflows

1. **Admin creates a new lead**
   - Navigate to "Create Lead" page
   - Fill in contact details and source information
   - Lead is created with "new" status and "fresh" flag

2. **Manager assigns lead to sales rep**
   - Go to Leads page, find the lead
   - Click "Assign" button
   - Select sales rep from dropdown
   - Lead status becomes assigned, fresh flag removed

3. **Sales rep works the lead**
   - View assigned leads in dashboard or leads page
   - Add comments and update status
   - Schedule follow-ups and track progress

4. **Convert lead to booking**
   - Create booking with matching phone number
   - System automatically links booking to lead
   - Lead status updates to "converted"

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sales_crm
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Analytics and monitoring
REACT_APP_GA_TRACKING_ID=your-ga-id
```

## 🧪 Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App
```

## 🚀 Deployment

### Production Checklist
- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
      
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: sales_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions
- Update documentation for new features
- Write tests for new functionality



---

**Built with ❤️ by the Sales CRM Team**
    name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier_level INTEGER NOT NULL, -- 1=Admin, 2=Area Manager, 3=Store Manager, 4=Sales Rep
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Leads
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    source VARCHAR(50) NOT NULL, -- 'meta', 'google_ads', 'manual'
    source_campaign_id VARCHAR(255),
    source_ad_id VARCHAR(255),
    name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    location TEXT,
    address TEXT,
    services TEXT[],
    service_category VARCHAR(100),
    notes TEXT,
    assigned_to_user_id UUID,
    assigned_to_tier INTEGER,
    assigned_at TIMESTAMPTZ,
    assigned_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'new',
    is_fresh BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    converted_to_booking_id UUID,
    converted_to_customer_id INTEGER,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_contacted_at TIMESTAMPTZ
);
```

### Supporting Tables
- **lead_comments**: Track all comments and notes on leads
- **lead_status_history**: Complete audit trail of status changes
- **bookings**: Customer bookings with lead conversion tracking

## 🔌 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Leads Management

#### Get All Leads
```http
GET /api/leads?page=1&limit=20&status=new&search=john
Authorization: Bearer <token>
```

#### Create Lead
```http
POST /api/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "location": "Mumbai",
  "services": ["Car Wash", "Oil Change"],
  "source": "google_ads"
}
```

#### Assign Lead
```http
PATCH /api/leads/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assigned_to_user_id": "uuid",
  "notes": "Assigning to sales rep for follow-up"
}
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🏗️ Frontend Architecture

### Project Structure
```
src/
├── components/
│   ├── Auth/
│   │   └── ProtectedRoute.js
│   ├── Bookings/
│   │   └── BookingForm.js
│   ├── Common/
│   │   ├── LoadingSpinner.js
│   │   ├── Modal.js
│   │   ├── Pagination.js
│   │   └── StatusBadge.js
│   ├── Layout/
│   │   ├── Header.js
│   │   ├── Layout.js
│   │   └── Sidebar.js
│   └── Leads/
│       ├── LeadCard.js
│       ├── LeadDetailsModal.js
│       ├── LeadFilters.js
│       ├── LeadForm.js
│       └── LeadsList.js
├── contexts/
│   └── AuthContext.js
├── pages/
│   ├── BookingsPage.js
│   ├── CreateLeadPage.js
│   ├── Dashboard.js
│   ├── LeadsPage.js
│   ├── Login.js
│   └── ReportsPage.js
├── utils/
│   └── api.js
├── App.js
└── index.js
```

### State Management
- **Authentication**: React Context with localStorage persistence
- **API State**: Local component state with useEffect hooks
- **Form State**: Controlled components with validation

### Routing
- **Public Routes**: `/login`
- **Protected Routes**: All other routes require authentication
- **Route Guards**: ProtectedRoute component checks authentication status

## 🔐 Authentication & Authorization

### User Tiers & Permissions

| Tier | Role | Permissions |
|------|------|-------------|
| 1 | **Admin** | Full access: create/edit/delete leads, assign to anyone, manage users |
| 2 | **Area Manager** | Create leads, assign to Store Managers & Sales Reps, view team performance |
| 3 | **Store Manager** | Create leads, assign to Sales Reps only, view assigned leads |
| 4 | **Sales Rep** | View assigned leads, update status, add comments |

### Assignment Rules
- Higher tiers can assign leads to lower tiers
- Users can only assign leads within their hierarchy
- Fresh leads can only be assigned (no status changes until first assignment)
- Assignment creates audit trail with timestamp and assignee info

### Security Features
- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- CORS protection
- Request rate limiting
- Input validation and sanitization

## 📱 Usage

### Default Login Credentials

| Role | Email | Password | Tier |
|------|-------|----------|------|
| Admin | admin@company.com | password123 | 1 |
| Area Manager | john.manager@company.com | password123 | 2 |
| Store Manager | sarah.store@company.com | password123 | 3 |
| Sales Rep | mike.sales@company.com | password123 | 4 |
| Sales Rep | lisa.sales@company.com | password123 | 4 |

### Common Workflows

1. **Admin creates a new lead**
   - Navigate to "Create Lead" page
   - Fill in contact details and source information
   - Lead is created with "new" status and "fresh" flag

2. **Manager assigns lead to sales rep**
   - Go to Leads page, find the lead
   - Click "Assign" button
   - Select sales rep from dropdown
   - Lead status becomes assigned, fresh flag removed

3. **Sales rep works the lead**
   - View assigned leads in dashboard or leads page
   - Add comments and update status
   - Schedule follow-ups and track progress

4. **Convert lead to booking**
   - Create booking with matching phone number
   - System automatically links booking to lead
   - Lead status updates to "converted"

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sales_crm
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Analytics and monitoring
REACT_APP_GA_TRACKING_ID=your-ga-id
```

## 🧪 Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App
```

## 🚀 Deployment

### Production Checklist
- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
      
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: sales_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
```

