# Firebase Setup Instructions

## Quick Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or select an existing project
   - Follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" authentication

3. **Enable Firestore Database**
   - Go to "Firestore Database" in your Firebase console
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location for your database

4. **Get Your Configuration**
   - Go to Project Settings (gear icon) > General tab
   - Scroll down to "Your apps" section
   - Click on the web app icon (`</>`) or "Add app" if no web app exists
   - Register your app with a nickname (e.g., "sprout-web")
   - Copy the Firebase configuration object

5. **Create Environment File**
   - Create a file named `.env.local` in your project root
   - Add the following content with your actual Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

6. **Replace the placeholder values**
   - Copy the values from your Firebase configuration object
   - Replace `your-api-key-here`, `your-project-id`, etc. with the actual values

7. **Restart your development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Security Rules (Optional but Recommended)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

- **"Firebase configuration is missing"**: Make sure your `.env.local` file exists and contains the correct values
- **"Invalid API key"**: Double-check that your API key is correct and starts with "AIza"
- **"Project not found"**: Verify your project ID is correct
- **Authentication errors**: Make sure Email/Password authentication is enabled in your Firebase console

## Need Help?

If you're still having issues, check:
1. Your `.env.local` file is in the project root
2. All environment variable names start with `NEXT_PUBLIC_`
3. Your development server has been restarted after adding the environment variables
4. Your Firebase project has Authentication and Firestore enabled
