# Interview Hub 🚀
### A Full-Stack Platform for Sharing Real Interview Experiences


Interview Hub is a modern full-stack web application where students and professionals can share, explore, and learn from real interview experiences.

Users can securely sign up, log in, share interview experiences, upvote useful posts, and search/filter interview stories from various companies.

---

# ✨ Features

## 🔐 Authentication System
- User Signup & Login
- JWT Authentication
- Google OAuth Login
- Password Hashing using bcrypt
- Persistent Login Sessions

---

## 📝 Share Interview Experiences
Users can post:
- Company Name
- Job Role
- Interview Type
- Difficulty Level
- Questions Asked
- Topics Covered
- Preparation Tips
- Interview Outcome
- Round Details

---

## 🔍 Explore & Search
- Search by company or role
- Filter interview experiences
- View latest posts
- Upvote helpful experiences

---

## 👤 User Dashboard
- View own posts
- Track total upvotes
- Contribution statistics
- Secure profile system

---

# 🛠️ Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js
- Passport.js
- JWT Authentication

## Database
- MongoDB Atlas
- Mongoose

---

# 📂 Project Structure

```bash
InterviewHub/
│
├── interviewhub-backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── Mini-Project-4th-sem-main/
│   ├── landpage.html
│   ├── script.js
│   ├── style.css
│   └── logo.png
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/interview-hub.git
```

---

## 2️⃣ Backend Setup

```bash
cd interviewhub-backend
npm install
npm start
```

Server runs on:

```bash
http://localhost:5000
```

---

## 3️⃣ Environment Variables

Create a `.env` file inside backend folder:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
PORT=5000
```

---

## 4️⃣ Frontend Setup

Open:

```bash
landpage.html
```

OR run local server:

```bash
npx http-server
```

---

# 🔗 API Endpoints

## Authentication APIs

### Signup
```http
POST /api/auth/signup
```

### Login
```http
POST /api/auth/login
```

### Google OAuth
```http
GET /api/auth/google
```

---

## Posts APIs

### Get All Posts
```http
GET /api/posts
```

### Create New Post
```http
POST /api/posts
```

### Upvote Post
```http
PUT /api/posts/:id/upvote
```

---

# 🔒 Security Features

- JWT Token Authentication
- bcrypt Password Hashing
- Protected Routes
- Session Management
- Input Validation
- Error Handling Middleware

---

# 🧪 Testing

## Test Server

```bash
GET http://localhost:5000/api/test
```

Expected Output:

```json
{
  "msg": "Server is working ✅"
}
```

---

# 🚀 Future Enhancements

- Resume Upload Feature
- Comments System
- Post Editing & Deletion
- Email Verification
- Dark Mode
- Admin Dashboard
- AI-Based Interview Suggestions

---

# 📸 Screenshots

## Home Page
<img width="1919" height="1019" alt="image" src="https://github.com/user-attachments/assets/4202a09a-43d4-4f41-8ceb-59daad35b460" />


## Dashboard
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/085e61f1-3321-4dd3-8cc2-95d3632407d5" />



## Share Experience Page
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/32c2e81b-eb1a-4690-8ee4-dd71916f8727" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/cc9d7e36-3a6e-4fb6-be72-b99cc3e04e92" />


## Profile Dashboard
<img width="1920" height="1017" alt="image" src="https://github.com/user-attachments/assets/2d9d751c-854f-461b-9a02-41c473bb6eb7" />


---

# 👨‍💻 Author

Developed by **Vamshika Mittakola** and **Reshma Sulthana Pinjari**

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the project  
📢 Share with your friends

---

# 🎉 Conclusion

Interview Hub helps students and job seekers learn from real interview experiences shared by others.

It creates a collaborative community where everyone can prepare smarter and perform better in interviews.
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

