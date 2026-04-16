# Interview Hub - Fixed & Working ✅

A full-stack platform for sharing and exploring real interview experiences. Users can sign up, log in, share their interview experiences, and upvote helpful posts.

## 🚀 What's Fixed

### Backend Fixes
✅ **Authentication System**
  - Added proper Passport.js configuration with serialize/deserialize functions
  - Implemented JWT-based authentication for all endpoints
  - Fixed Google OAuth integration with proper error handling
  - Added Bearer token authentication middleware

✅ **Routes & API Endpoints**
  - `/api/auth/signup` - User registration with bcrypt password hashing
  - `/api/auth/login` - User login with JWT token generation
  - `/api/auth/google` - Google OAuth authentication
  - `/api/posts` - Create, read, and upvote interview experiences
  - `/api/posts/my/:email` - Get user's own posts

✅ **Middleware**
  - Created authentication middleware for protected routes
  - Added error handling and validation
  - Proper CORS configuration
  - Session management with express-session

✅ **Database Models**
  - Enhanced User schema with proper validation
  - Improved Post schema with enum values and constraints
  - Added database indexes for performance

### Frontend Fixes
✅ **Authentication Flow**
  - Proper JWT token handling in localStorage
  - Auto-login after signup
  - Google OAuth callback processing
  - Session persistence on page reload

✅ **Share Experience Feature**
  - Added authentication token to POST requests
  - Proper form validation
  - Error handling and user feedback
  - Auto-populate user info from token

✅ **User Experience**
  - Toast notifications for all operations
  - Modal forms for signup, login, and post creation
  - Real-time post filtering and search
  - User profile with statistics

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm
- MongoDB Account (Atlas)

### Backend Setup
```bash
cd interviewhub-backend
npm install
npm start
```

Server will run on: `http://localhost:5000`

### Environment Variables (.env)
```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
PORT=5000
NODE_ENV=development
```

### Frontend Setup
1. Open `Mini-Project-4th-sem-main/landpage.html` in a browser
2. Or serve it with a local server:
   ```bash
   npx http-server
   ```

## 🔐 Features

### Authentication
- ✅ Email/Password Signup with validation
- ✅ Email/Password Login
- ✅ Google OAuth integration
- ✅ JWT token-based session management
- ✅ Automatic token refresh

### Share Experience
- ✅ Submit interview experiences with:
  - Company name
  - Job role
  - Interview type (On-Campus, Off-Campus, Referral, Walk-in)
  - Difficulty level (Easy, Medium, Hard)
  - Interview outcome (Selected, Rejected, Pending)
  - Topic coverage (DSA, System Design, HR, etc.)
  - Number of rounds and round details
  - Questions asked
  - Preparation tips
  
- ✅ Only authenticated users can post
- ✅ Auto-populate user info from token

### Explore & Filter
- ✅ Browse all interview experiences
- ✅ Search by company, role, or topic
- ✅ Filter by:
  - Company
  - Job role
  - Difficulty level
  - Topic
- ✅ Sort by most recent
- ✅ Upvote helpful experiences

### User Profile
- ✅ View profile information
- ✅ See total posts and upvotes
- ✅ Track contribution statistics
- ✅ View own posted experiences

## 🧪 API Endpoints

### Authentication
```
POST /api/auth/signup
Body: { name, email, password }
Response: { token, user, msg }

POST /api/auth/login
Body: { email, password }
Response: { token, user, msg }

GET /api/auth/google
Redirects to Google OAuth login

GET /api/auth/google/callback
Google OAuth callback endpoint
```

### Posts
```
GET /api/posts
Get all posts (public)
Response: [{ _id, company, role, difficulty, ... }]

POST /api/posts
Create new post (requires authentication)
Headers: { Authorization: "Bearer token" }
Body: { company, role, type, difficulty, outcome, topics, rounds, roundDetails, questions, tips, postedBy, userId }
Response: { msg, post }

GET /api/posts/my/:email
Get user's posts
Response: [{ ... }]

PUT /api/posts/:id/upvote
Upvote a post
Response: { upvotes, ... }

GET /api/test
Server health check
Response: { msg: "Server is working ✅" }
```

## 🎯 Usage Flow

### Sign Up
1. Click "Sign Up" button
2. Enter name, email, password
3. Confirm password
4. Auto-redirects to dashboard

### Login
1. Click "Log In" button
2. Enter email and password
3. Auto-redirects to dashboard
4. Or use Google Login

### Share Experience
1. Click "Share Experience" button
2. Fill in company, role, and round details (required)
3. Add optional details (questions, tips, topics)
4. Click "Submit Experience"
5. View notification of success

### Explore Experiences
1. Browse all posts on Explore tab
2. Use search bar for quick search
3. Use filters for detailed search
4. Click post card to view full details
5. Upvote helpful experiences

### View Profile
1. Click on Profile tab
2. See your statistics
3. View your posted experiences
4. Click Logout to exit

## 🐛 Testing

### Test the Server
```
GET http://localhost:5000/api/test
Should return: { "msg": "Server is working ✅" }
```

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Test Share Experience
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "company":"Google",
    "role":"Software Engineer",
    "type":"On-Campus",
    "difficulty":"Medium",
    "roundDetails":"Online coding test...",
    "topics":["DSA","System Design"]
  }'
```

## 📁 Project Structure

```
interviewhub-backend/
├── config/
│   └── passport.js          # Passport.js configuration
├── middleware/
│   └── auth.js              # JWT verification middleware
├── models/
│   ├── User.js              # User schema
│   └── Post.js              # Post schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── posts.js             # Posts routes
├── .env                     # Environment variables
├── server.js                # Main server file
└── package.json             # Dependencies

Mini-Project-4th-sem-main/
├── landpage.html            # Frontend HTML
├── script.js                # Frontend JavaScript
├── style.css                # Frontend CSS
└── logo.png                 # Logo image
```

## 🔑 Key Implementations

### 1. JWT Authentication
- Tokens valid for 7 days
- Stored in localStorage
- Verified on protected routes
- Auto-decoded and user info extracted

### 2. Password Security
- Bcrypt hashing (salt rounds: 10)
- Minimum 6 characters
- Never stored in plain text

### 3. Database Validation
- Email validation with regex
- Required fields enforcement
- Enum values for difficulty, outcome, etc.
- Unique email constraint

### 4. Error Handling
- Try-catch blocks on all async operations
- Meaningful error messages
- Proper HTTP status codes
- Client-side validation

## ⚙️ Configuration

### Server Port
Default: 5000 (can change via PORT env variable)

### CORS
Allows: `http://localhost:8080`, `http://localhost:3000`

### JWT Expiry
7 days

### Session Duration
24 hours

## 🚀 Ready to Deploy!

The application is now fully functional and ready for:
1. ✅ Local testing
2. ✅ Production deployment
3. ✅ Mobile app integration
4. ✅ Database scaling

## 📝 Notes

- Keep `.env` file with real credentials out of version control
- Change JWT_SECRET in production
- Implement rate limiting for production
- Add email verification for signups
- Add password reset functionality
- Implement post editing/deletion by user
- Add comment functionality
- Consider adding resume upload feature

## 🎉 All Features Working!

- ✅ Server startup without errors
- ✅ Signup with email validation
- ✅ Login with JWT tokens
- ✅ Google OAuth integration
- ✅ Share interview experiences
- ✅ Filter and search posts
- ✅ Upvote system
- ✅ User profile with statistics
- ✅ Persistent sessions
- ✅ Proper error handling

Happy coding! 🚀
