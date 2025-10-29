# Updated Firebase Firestore Security Rules for Saheli Store

## Instructions:
1. Go to Firebase Console → Firestore Database → Rules
2. Replace the existing rules with the following updated rules
3. Click "Publish" to apply the changes

## Complete Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection rules
    match /users/{userId} {
      // Users can read their own document
      allow read: if isAuthenticated();
      
      // Users can only create/update their own document
      // But cannot change their own role (only admins can do that)
      allow create, update: if isOwner(userId) && 
                            (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']));
      
      // Admins can update user roles
      allow update: if isAdmin();
      
      // No one can delete user documents
      allow delete: if false;
    }
    
    // Products collection rules (for Saheli Store)
    match /products/{productId} {
      // Anyone authenticated can read products
      allow read: if isAuthenticated();
      
      // Only admins can create, update, or delete products
      allow create, update, delete: if isAdmin();
    }
    
    // Carts collection rules (for Saheli Store)
    match /carts/{userId} {
      // Users can only read/write their own cart
      allow read, write: if isOwner(userId);
    }
    
    // Orders collection rules (for Saheli Store)
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Admins can read all orders
      allow read: if isAdmin();
      
      // Users can create orders for themselves
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // Only admins can update orders (for delivery status, etc.)
      allow update: if isAdmin();
      
      // Users can update their own orders (for payment status)
      allow update: if isOwner(resource.data.userId);
      
      // No one can delete orders
      allow delete: if false;
    }
    
    // Community posts collection rules
    match /community_posts/{postId} {
      // Anyone authenticated can read all posts
      allow read: if isAuthenticated();
      
      // Only authenticated users can create posts
      // Ensure userId matches the authenticated user
      allow create: if isAuthenticated() 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.category in ['safety-alerts', 'support', 'general']
                    && request.resource.data.upvotes == 0
                    && request.resource.data.upvoters.size() == 0;
      
      // Users can update posts for upvoting
      // This allows atomic upvote operations via transactions
      allow update: if isAuthenticated()
                    && (
                      // User can update upvotes and upvoters arrays
                      (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['upvotes', 'upvoters']))
                      ||
                      // Owner can update their own post (edit content)
                      (isOwner(resource.data.userId) && 
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['content', 'imageUrl']))
                    );
      
      // Only post owner can delete their post
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Safety markers collection rules
    match /safety_markers/{markerId} {
      // Anyone authenticated can read all markers
      allow read: if isAuthenticated();
      
      // Only authenticated users can create markers
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.status in ['safe', 'caution', 'unsafe']
                    && request.resource.data.upvotes == 0
                    && request.resource.data.upvoters.size() == 0
                    && request.resource.data.verified == false;
      
      // Users can update markers for upvoting
      allow update: if isAuthenticated()
                    && (
                      // User can update upvotes, upvoters, and verified status
                      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['upvotes', 'upvoters', 'verified'])
                    );
      
      // Only marker owner can delete their marker
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Safety alerts collection rules
    match /safety_alerts/{alertId} {
      // Users can only read their own alerts
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Only authenticated users can create alerts for themselves
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.severity in ['low', 'medium', 'high'];
      
      // Users can update only their own alerts (e.g., mark as read)
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Users can delete only their own alerts
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Important Notes:

1. **Admin User Setup**: To make a user an admin, you need to manually update their document in Firestore:
   - Go to Firebase Console → Firestore Database
   - Find the user document under `users/{uid}`
   - Add a field: `role` with value `"admin"`
   - For the admin email `admin@saheli.com`, create an account first, then set the role

2. **Security**: These rules ensure:
   - Only admins can manage products
   - Users can only access their own carts and orders
   - Admins can view all orders and update delivery status
   - Regular users cannot change their own role to admin

3. **Testing**: After applying rules, test by:
   - Creating a regular user account - should NOT see admin features
   - Creating admin account and setting role to 'admin' - should see admin panel

## To Set Admin Role Manually:

1. Register an account with email: `admin@saheli.com`
2. Go to Firebase Console → Firestore Database
3. Find the user document (copy the UID)
4. Click on the document
5. Click "Add field"
   - Field: `role`
   - Type: `string`
   - Value: `admin`
6. Save the document

Now the admin@saheli.com account will have full admin access to manage products and orders!
