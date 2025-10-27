# Firestore Database Setup Guide

## 🚨 CRITICAL: Enable Firestore Database

The errors you're seeing indicate that **Firestore Database is NOT created** in your Firebase project.

```
WebChannelConnection RPC 'Listen' stream transport errored
Failed to get document because the client is offline
```

These errors mean Firestore cannot connect because the database doesn't exist.

---

## Step-by-Step Instructions to Enable Firestore

### 1. Open Firebase Console
- Go to: https://console.firebase.google.com/
- Select your project: **"saheli1"**

### 2. Create Firestore Database
1. In the left sidebar, click on **"Firestore Database"**
2. Click the **"Create database"** button
3. You'll see two options:

#### Option A: Start in Production Mode (Recommended for Production)
- Select **"Start in production mode"**
- Click **"Next"**
- Choose a location (select closest to your users, e.g., `asia-south1` for India)
- Click **"Enable"**

#### Option B: Start in Test Mode (Good for Development)
- Select **"Start in test mode"** (allows read/write for 30 days)
- Click **"Next"**
- Choose a location (e.g., `asia-south1`)
- Click **"Enable"**

**Note**: Test mode is easier for development but less secure. You can change security rules later.

### 3. Wait for Database Creation
- Firebase will create the database (takes ~30 seconds)
- You'll see "Cloud Firestore" screen with the "Data", "Rules", "Indexes", "Usage" tabs

### 4. Set Up Security Rules (If you chose Production Mode)

Click on the **"Rules"** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"** to save the rules.

---

## ✅ Verification

After creating the Firestore database:

1. **Restart your React Native app completely**
   ```bash
   # Stop the current app
   # Then restart:
   npx expo start --clear
   ```

2. **Check Console Logs** - You should see:
   ```
   Firestore initialized for React Native with offline support
   ```

3. **Test Registration**:
   - Register a new user
   - Fill in user details
   - Data should now save successfully

4. **Verify Data in Firebase Console**:
   - Go to Firestore Database → Data tab
   - You should see a `users` collection
   - Click on it to see user documents

---

## 🔧 Updated Configuration

The following improvements have been made to your app:

### ✅ Firestore Configuration
- **Offline persistence** enabled for React Native
- **Long polling** enabled for better mobile connectivity
- **Unlimited cache** for better offline experience
- **Better error handling** with helpful messages

### ✅ Error Handling
- Graceful degradation when Firestore is unavailable
- Specific error messages for connection issues
- App won't crash if Firestore is temporarily offline

---

## 🐛 Troubleshooting

### Still Getting Transport Errors?

**1. Verify Firestore is Created:**
   - Go to Firebase Console
   - Check if "Firestore Database" section shows data
   - If it says "Get started", you haven't created the database yet

**2. Check Internet Connection:**
   - Ensure your device/emulator has internet access
   - Try opening a website to verify connectivity

**3. Clear App Cache:**
   ```bash
   npx expo start --clear
   ```

**4. Check Security Rules:**
   - If using Production mode, ensure security rules allow authenticated users
   - Test mode allows all access for 30 days (easier for development)

**5. Restart Metro Bundler:**
   - Stop the app completely (Ctrl+C)
   - Clear cache: `npx expo start --clear`
   - Restart on Android: `npx expo start --android`

### Permission Denied Error?

If you get "permission-denied" errors:

1. Go to Firestore Database → Rules
2. For **testing**, you can temporarily use (NOT for production):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Click "Publish"

---

## 📋 Setup Checklist

- [ ] Opened Firebase Console
- [ ] Selected "saheli1" project
- [ ] Clicked on "Firestore Database"
- [ ] Clicked "Create database"
- [ ] Selected Production or Test mode
- [ ] Chose a location (e.g., asia-south1)
- [ ] Clicked "Enable" and waited for creation
- [ ] Set up security rules (if Production mode)
- [ ] Completely restarted the React Native app
- [ ] Cleared cache with `--clear` flag
- [ ] Tested user registration and data saving
- [ ] Verified data appears in Firebase Console

---

## 🎉 Success Indicators

When Firestore is properly configured, you'll see:

### In Console Logs:
```
✅ Firebase app initialized successfully
✅ Firebase Auth initialized for React Native with AsyncStorage
✅ Firestore initialized for React Native with offline support
✅ User details saved successfully
✅ User details retrieved successfully
```

### In Firebase Console:
- `users` collection appears
- User documents with their data
- Timestamps showing recent writes

### In Your App:
- ✅ Users can register
- ✅ User details save successfully
- ✅ Profile screen shows user data
- ✅ No transport error warnings
- ✅ App works offline (cached data)

---

## 🔒 Security Best Practices

### For Production:

1. **Use Production Mode** with strict security rules
2. **Validate data** on client and server side
3. **Use security rules** to restrict access:
   ```javascript
   // Only allow users to access their own data
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```

### For Development:

1. **Test Mode** is fine (30-day limit)
2. Remember to **update rules before launch**
3. Monitor usage in Firebase Console

---

## 📞 Need More Help?

If you're still experiencing issues:

1. Check Firebase Console → Usage tab (ensure you're within quota)
2. Verify your Firebase project is active (not suspended)
3. Check if you're on the Spark (free) or Blaze (pay-as-you-go) plan
4. Ensure your app's package name matches Firebase project configuration

---

**Last Updated**: Firestore SDK v12.4.0 | React Native Configuration
