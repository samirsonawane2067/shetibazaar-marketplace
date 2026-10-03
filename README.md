# ShetiBazaar - Maharashtra Farmer Marketplace

A full-stack farmer marketplace for Maharashtra, India with React frontend and Node.js/Express backend with PostgreSQL database.

## Features

- **User Authentication**: Registration, login with JWT, profile management
- **Product Management**: Create, list, update, delete products with image uploads
- **Shopping Experience**: Search, filter, sort products, add to cart, wishlist
- **Order Management**: Create orders, track order status
- **Reviews & Ratings**: Product and seller reviews with star ratings
- **In-app Messaging**: Direct communication between buyers and sellers
- **Push Notifications**: Order updates, price alerts, new product listings
- **Saved Searches**: Save and reuse search criteria
- **Price History**: Track price trends for products over time
- **AI Recommendations**: Personalized product recommendations based on browsing history
- **Admin Dashboard**: Product approval, user management, analytics
- **Bilingual Support**: English and Marathi with language switcher

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- React Router DOM
- Recharts for analytics
- React Icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Multer for file uploads
- Socket.io for real-time chat (ready for implementation)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Install PostgreSQL and create a database:

```bash
# Create database
createdb shetibazaar
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/shetibazaar
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# PORT=5000

# Run database schema
psql -U username -d shetibazaar -f db/schema.sql

# Seed admin user
node db/seed.js

# Start backend server
npm run dev
```

Admin credentials:
- Email: admin@shetibazaar.com
- Password: admin123

### 3. Frontend Setup

```bash
cd ..
npm install

# Frontend .env is already configured with:
# VITE_API_URL=http://localhost:5000/api

# Start frontend dev server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/admin/login` - Admin login

### Users
- GET `/api/users/me` - Get current user profile
- PUT `/api/users/profile` - Update user profile

### Products
- GET `/api/products` - Get all products (with filters)
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (auth required)
- GET `/api/products/user/mine` - Get my products (auth required)
- PUT `/api/products/:id` - Update product (auth required)
- DELETE `/api/products/:id` - Delete product (auth required)

### Orders
- POST `/api/orders` - Create order (auth required)
- GET `/api/orders` - Get user orders (auth required)
- GET `/api/orders/:id` - Get single order (auth required)

### Cart
- GET `/api/cart` - Get user cart (auth required)
- POST `/api/cart` - Add to cart (auth required)
- PUT `/api/cart/:id` - Update cart item (auth required)
- DELETE `/api/cart/:id` - Remove from cart (auth required)
- DELETE `/api/cart` - Clear cart (auth required)

### Wishlist
- GET `/api/wishlist` - Get user wishlist (auth required)
- POST `/api/wishlist` - Toggle wishlist (auth required)
- DELETE `/api/wishlist/:product_id` - Remove from wishlist (auth required)

### Reviews
- GET `/api/reviews/product/:productId` - Get product reviews
- GET `/api/reviews/seller/:sellerId` - Get seller reviews
- POST `/api/reviews` - Create review (auth required)
- PUT `/api/reviews/:id` - Update review (auth required)
- DELETE `/api/reviews/:id` - Delete review (auth required)

### Messages
- GET `/api/messages/conversation/:userId` - Get conversation with user (auth required)
- GET `/api/messages/conversations` - Get all conversations (auth required)
- POST `/api/messages` - Send message (auth required)
- PUT `/api/messages/read/:userId` - Mark messages as read (auth required)
- GET `/api/messages/unread/count` - Get unread message count (auth required)

### Notifications
- GET `/api/notifications` - Get user notifications (auth required)
- PUT `/api/notifications/:id/read` - Mark notification as read (auth required)
- PUT `/api/notifications/read-all` - Mark all notifications as read (auth required)
- DELETE `/api/notifications/:id` - Delete notification (auth required)

### Saved Searches
- GET `/api/saved-searches` - Get saved searches (auth required)
- POST `/api/saved-searches` - Create saved search (auth required)
- PUT `/api/saved-searches/:id` - Update saved search (auth required)
- DELETE `/api/saved-searches/:id` - Delete saved search (auth required)

### Price History
- GET `/api/price-history/product/:productId` - Get product price history
- POST `/api/price-history` - Record price change (auth required)
- GET `/api/price-history/stats/:productId` - Get price statistics

### Recommendations
- POST `/api/recommendations/track` - Track user behavior (auth required)
- GET `/api/recommendations` - Get personalized recommendations (auth required)
- GET `/api/recommendations/trending` - Get trending products
- GET `/api/recommendations/similar/:productId` - Get similar products

### Admin
- GET `/api/admin/stats` - Get admin stats (admin auth required)
- GET `/api/admin/users` - Get all users (admin auth required)
- GET `/api/admin/products` - Get all products (admin auth required)
- PUT `/api/admin/products/:id/approve` - Approve/reject product (admin auth required)
- DELETE `/api/admin/products/:id` - Delete product (admin auth required)
- GET `/api/admin/orders` - Get all orders (admin auth required)

## Database Schema

### Users
- id, name, email, password, phone, village, district, state, pincode
- farm_name, farm_size, role, is_verified, timestamps

### Products
- id, seller_id, name, name_marathi, category, description
- price, quantity, unit, location, image_url, tag, rating, review_count
- status (pending/approved/rejected), details (JSONB), timestamps

### Orders
- id, user_id, total_amount, status, payment_method
- delivery details, timestamps

### Order Items
- id, order_id, product_id, quantity, price, seller_id

### Cart
- id, user_id, product_id, quantity, timestamp

### Wishlist
- id, user_id, product_id, timestamp

### Reviews
- id, user_id, product_id, seller_id, rating, title, comment
- is_verified_purchase, timestamps

### Messages
- id, sender_id, receiver_id, product_id, message, is_read, timestamp

### Notifications
- id, user_id, type, title, message, link, is_read, timestamp

### Saved Searches
- id, user_id, name, search_params (JSONB), timestamp

### Price History
- id, product_id, price, recorded_at

### User Behavior
- id, user_id, product_id, action_type, metadata (JSONB), timestamp

## Development

### Frontend
```bash
npm run dev
```

### Backend
```bash
cd backend
npm run dev
```

## Production Deployment

1. Set up a production PostgreSQL database
2. Update environment variables with production values
3. Build frontend: `npm run build`
4. Deploy backend to a hosting service (e.g., Heroku, Railway, AWS)
5. Deploy frontend to a hosting service (e.g., Vercel, Netlify)
6. Update CORS settings in backend to allow frontend domain

## License

ISC
