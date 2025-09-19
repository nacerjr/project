# Bergomi Store - Gaming Account Store

A complete web application for selling gaming accounts with React frontend and Django backend.

## Features

- **Modern Frontend**: React with TypeScript and Tailwind CSS
- **Video Background**: Dynamic video backgrounds from Pexels
- **Account Gallery**: Showcase gaming accounts with hover effects
- **Detailed View**: Account detail pages with player cards and categories
- **Hidden Admin Panel**: Secure admin interface for managing content
- **WhatsApp Integration**: Direct purchase via WhatsApp groups
- **Responsive Design**: Works perfectly on all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

### Backend
- Django 4.2 with Django REST Framework
- MySQL database
- CORS support for frontend integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- XAMPP (for MySQL)
- Git

### Backend Setup

1. **Start XAMPP and MySQL**
   ```bash
   # Start XAMPP control panel
   # Start Apache and MySQL services
   ```

2. **Create Database**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create database named `bergomi_store`

3. **Setup Django Backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment file
   copy .env.example .env
   # Edit .env with your database credentials
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   
   # Create superuser (optional)
   python manage.py createsuperuser
   
   # Start server
   python manage.py runserver
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   npm install react-router-dom@latest
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage Guide

### For End Users
1. Visit the website (http://localhost:5173)
2. Browse available gaming accounts
3. Click "Check Now" to view account details
4. Click "Buy Right Now" to be redirected to WhatsApp

### For Administrators

1. **Access Admin Panel**
   - Visit: `http://localhost:5173/admin/bergomi-admin-2024`
   - Use the admin token from settings

2. **Manage Accounts**
   - Add new gaming accounts
   - Upload images for normal, hover, and detail views
   - Set prices and descriptions
   - Add player cards for each category

3. **Configure WhatsApp**
   - Set WhatsApp group invitation link
   - Link updates automatically for all users

4. **Categories Management**
   - **Managers**: Coach and manager cards
   - **Defenders**: Defensive player cards
   - **Midfielders**: Midfield player cards
   - **Forwards**: Forward player cards

## Database Schema

### Tables
- **Accounts**: Gaming account information
- **PlayerCards**: Player cards for each account
- **WhatsAppLink**: WhatsApp group invitation links
- **AdminToken**: Admin access tokens

### Key Fields
- Account: name, price, images (normal, hover, detail), description
- PlayerCard: image, category, account reference
- WhatsAppLink: link, active status

## Deployment

### Backend (Django)
1. **Prepare for Production**
   ```bash
   pip install gunicorn
   python manage.py collectstatic
   ```

2. **Environment Variables**
   ```
   DEBUG=False
   ALLOWED_HOSTS=your-render-domain.onrender.com
   SECRET_KEY=your-production-secret-key
   ```

3. **Deploy to Render**
   - Connect GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `gunicorn bergomi_store.wsgi:application`

### Frontend (React)
1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify/Vercel**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

## Configuration

### Video Background
- Update video URL in `src/pages/Home.tsx`
- Use Pexels or other video sources

### Logo
- Replace `/public/image-removebg-preview-removebg-preview.png`
- Update logo references in components

### WhatsApp Integration
- Admin sets WhatsApp group link
- All "Buy Right Now" buttons redirect to this link
- Updates apply instantly to all users

## Security Features

- **Admin Token Authentication**: Secure admin access
- **Hidden Admin Routes**: No visible admin buttons in frontend
- **CORS Configuration**: Controlled frontend access
- **Environment Variables**: Sensitive data protection

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure XAMPP MySQL is running
   - Check database credentials in `.env`
   - Verify database `bergomi_store` exists

2. **CORS Errors**
   - Check `CORS_ALLOWED_ORIGINS` in Django settings
   - Ensure frontend URL is included

3. **Image Loading Issues**
   - Verify image URLs are accessible
   - Check CORS policy on image sources

4. **Admin Access Denied**
   - Verify admin token in URL
   - Check `ADMIN_TOKEN` in Django settings

### Development Tips

1. **Adding New Features**
   - Backend: Add models → migrations → views → URLs
   - Frontend: Create components → add routes → integrate API

2. **Database Changes**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Debugging**
   - Backend: Check Django console logs
   - Frontend: Use browser developer tools
   - Database: Use phpMyAdmin for data inspection

## API Endpoints

- `GET /api/accounts/` - List all accounts
- `GET /api/accounts/{id}/` - Get account details
- `POST /api/accounts/` - Create new account
- `PUT /api/accounts/{id}/` - Update account
- `DELETE /api/accounts/{id}/` - Delete account
- `GET /api/whatsapp-link/` - Get WhatsApp link
- `POST /api/whatsapp-link/` - Update WhatsApp link
- `GET /api/verify-admin/{token}/` - Verify admin token

## Support

For issues or questions:
1. Check this README first
2. Review Django logs for backend issues
3. Check browser console for frontend errors
4. Verify database connections and data

## License

This project is for educational and commercial use. Ensure compliance with gaming platform terms of service.