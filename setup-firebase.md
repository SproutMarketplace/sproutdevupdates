# Quick Firebase Setup Guide

## Step 1: Create .env.local file

Create a file named `.env.local` in your project root with the following content:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 2: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Click the web app icon (`</>`) or "Add app"
6. Register your app with a name like "sprout-web"
7. Copy the configuration values from the Firebase config object

## Step 3: Replace Placeholder Values

Replace the placeholder values in your `.env.local` file with the actual values from Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC... (your actual API key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sprout-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sprout-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sprout-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Step 4: Enable Authentication

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable "Email/Password" authentication

## Step 5: Enable Firestore

1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location

## Step 6: Restart Development Server

```bash
npm run dev
```

## Troubleshooting

- **Still getting errors?** Make sure your `.env.local` file is in the project root
- **Invalid API key?** Double-check that you copied the API key correctly
- **Project not found?** Verify your project ID matches exactly

The error should disappear once you've set up the environment variables correctly!
