# Firebase Setup Guide for Saheli App

## 🚨 CRITICAL: Enable Email/Password Authentication

The error `auth/configuration-not-found` means Email/Password authentication is **NOT enabled** in Firebase Console.

### Step-by-Step Instructions:

#### 1. Open Firebase Console
- Go to: https://console.firebase.google.com/
- Select your project: **"saheli1"**

#### 2. Enable Email/Password Authentication
1. Click on **"Authentication"** in the left sidebar
2. Click on **"Sign-in method"** tab at the top
3. In the list of providers, find **"Email/Password"**
4. Click on it to open the configuration
5. **Toggle the "Enable" switch to ON** (make sure it's blue/enabled)
6. Click **"Save"** button
7. You should now see "Email/Password" status as **"Enabled"**

#### 3. For Android App Configuration (if not already done)
1. Go to **Project Settings** (gear icon ⚙️ in the left sidebar)
2. Scroll down to **"Your apps"** section
3. If you see an Android app already listed, you're good!
4. If NOT, click **"Add app"** → Select **Android** icon
5. Follow the wizard to register your Android app
6. Download the **`google-services.json`** file (if needed)

### ✅ Verification

After enabling Email/Password authentication:
1. Restart your React Native app
2. Try to register or login
3. You should no longer see the `auth/configuration-not-found` error

### 🔒 Security Rules (Recommended)

After enabling authentication, set up Firestore security rules:

1. Go to **Firestore Database** in Firebase Console
2. Click on **"Rules"** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"** to save

## 📱 Testing the Fix

### Test Registration:
```
Email: test@saheli.com
Password: test123456
```

### Test Login:
```
Email: test@saheli.com
Password: test123456
```

## 🐛 Common Issues & Solutions

### Issue 1: Still getting configuration-not-found error
**Solution**: 
- Make sure you clicked "Save" after enabling Email/Password
- Completely close and restart your React Native app
- Clear app cache: `npx expo start --clear`

### Issue 2: Network request failed
**Solution**: 
- Check your internet connection
- Make sure Firebase project is active
- Verify your firebaseConfig credentials are correct

### Issue 3: App crashes on startup
**Solution**: 
- Check console logs for detailed error messages
- Ensure all Firebase packages are properly installed
- Try: `yarn install` or `npm install`

## 📋 Checklist

- [ ] Opened Firebase Console
- [ ] Selected "saheli1" project
- [ ] Went to Authentication section
- [ ] Clicked Sign-in method tab
- [ ] Enabled Email/Password provider
- [ ] Clicked Save
- [ ] Restarted React Native app
- [ ] Tested registration/login

## 🎉 Success Indicators

When everything is working correctly, you should see in your app console:
```
Firebase app initialized successfully
Firebase Auth initialized for React Native with AsyncStorage
Firestore initialized successfully
```

And you should be able to:
- ✅ Register new users
- ✅ Login with existing users
- ✅ Store user data in Firestore
- ✅ Navigate between auth screens

## 📞 Need Help?

If you're still facing issues after following this guide:
1. Check the app console logs for specific error messages
2. Verify your Firebase project is on a paid plan (if using many features)
3. Ensure your API keys in `firebaseConfig.js` match those in Firebase Console

---

**Last Updated**: Firebase SDK v12.4.0 | React Native Setup
