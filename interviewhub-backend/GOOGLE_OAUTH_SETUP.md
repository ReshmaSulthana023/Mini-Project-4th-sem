# Google OAuth Setup Guide

## How to Enable Google Login

Your app now supports Google OAuth! Follow these steps to set it up:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Enter project name: "Interview Hub"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Cloud Console, go to "APIs & Services"
2. Click "Enable APIs and Services"
3. Search for "Google+ API"
4. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External"
   - Fill in app name: "Interview Hub"
   - Add your email
   - Save

4. For Application type, select "Web application"
5. Name it: "Interview Hub Backend"
6. Under "Authorized redirect URIs", add:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

### Step 4: Add Credentials to .env File

Update `.env` file in `interviewhub-backend/` folder:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Replace:
- `your_client_id_here` with the Client ID you copied
- `your_client_secret_here` with the Client Secret you copied

### Step 5: Restart the Backend Server

```bash
cd interviewhub-backend
npm start
```

### Step 6: Test Google Login

1. Go to `http://localhost:8080/landpage.html`
2. Click "Log In"
3. Click the Google login button
4. You should be redirected to Google
5. After login, you'll be automatically logged into Interview Hub

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`
- Check for typos or extra spaces

### Email not being fetched
- Make sure you configured the OAuth consent screen with "Email" scope
- The email must be public on your Google account (or at least visible to the app)

### Still showing "Your email" placeholder
- Try clearing browser cache and localStorage
- Restart both frontend and backend servers
- Check browser console for errors (F12 → Console tab)

## How It Works

```
User clicks Google Login Button
    ↓
Frontend redirects to: /api/auth/google
    ↓
Google Authentication Page opens
    ↓
User logs in with Google account
    ↓
Google redirects to: /api/auth/google/callback (with code)
    ↓
Backend exchanges code for user profile
    ↓
Check if user exists in MongoDB
    ↓
If new user: Create account with Google info
    ↓
Generate JWT token
    ↓
Redirect to frontend with token & user info
    ↓
Frontend stores token in localStorage
    ↓
User logged in successfully! ✅
```

## For Production

When deploying, update the callback URL to match your production domain:
```
https://yourdomain.com/api/auth/google/callback
```

And add it to Google Console credentials.
