# Google Push Notifications Setup Guide for LODUCHAT

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications across all devices.

## Prerequisites

1. Firebase project already set up (✅ Done)
2. Firebase hosting configured (✅ Done)
3. Node.js and npm installed (✅ Done)

## Step 1: Generate VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`lodugram`)
3. Go to **Project Settings** (gear icon)
4. Go to **Cloud Messaging** tab
5. Scroll down to **Web configuration**
6. Click **Generate Key Pair** under **Web Push certificates**
7. Copy the generated **Key pair** (this is your VAPID key)

## Step 2: Update VAPID Key

1. Open `src/config/firebase.ts`
2. Replace `'YOUR_VAPID_KEY_HERE'` with your actual VAPID key:

```typescript
export const vapidKey = 'YOUR_ACTUAL_VAPID_KEY_HERE'
```

## Step 3: Enable Cloud Functions

1. In Firebase Console, go to **Functions**
2. Click **Get started** if not already enabled
3. Choose a billing plan (Blaze plan required for external API calls)
4. Select your preferred region (default: us-central1)

## Step 4: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 5: Login to Firebase

```bash
firebase login
```

## Step 6: Initialize Firebase Functions

```bash
firebase init functions
```

When prompted:
- Select your project
- Choose TypeScript
- Use ESLint
- Install dependencies with npm

## Step 7: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## Step 8: Test the Setup

1. Build and deploy your app:
```bash
npm run build
firebase deploy --only hosting
```

2. Open your app in a browser
3. Grant notification permissions when prompted
4. Check the browser console for FCM token generation

## Step 9: Test Push Notifications

### Test from Firebase Console:
1. Go to **Cloud Messaging** in Firebase Console
2. Click **Send your first message**
3. Fill in the notification details
4. Under **Target**, select **Single device** and paste a FCM token from your browser console
5. Send the message

### Test from your app:
1. Use the Cloud Functions to send notifications
2. Check that notifications appear on all devices

## Step 10: Monitor and Debug

### Check FCM Token Generation:
- Open browser console
- Look for "FCM Token:" messages
- Verify tokens are saved to Firestore

### Check Cloud Functions Logs:
```bash
firebase functions:log
```

### Test Background Notifications:
1. Close the browser tab
2. Send a notification from Firebase Console
3. Verify notification appears

## Troubleshooting

### Common Issues:

1. **VAPID Key Error**: Make sure the VAPID key is correctly set in `src/config/firebase.ts`

2. **Service Worker Not Registered**: Check that `public/sw.js` is accessible and properly configured

3. **Permission Denied**: Ensure users grant notification permissions

4. **Cloud Functions Not Deployed**: Run `firebase deploy --only functions`

5. **CORS Issues**: Make sure your domain is added to Firebase authorized domains

### Debug Steps:

1. Check browser console for errors
2. Verify FCM token generation
3. Check Firestore for saved tokens
4. Monitor Cloud Functions logs
5. Test with Firebase Console first

## Security Considerations

1. **VAPID Key**: Keep your VAPID key secure but it's safe to include in client-side code
2. **Authentication**: Cloud Functions require user authentication
3. **Rate Limiting**: Implement rate limiting for notification sending
4. **Token Cleanup**: Invalid tokens are automatically cleaned up

## Next Steps

1. **Customize Notifications**: Modify notification appearance and behavior
2. **Add Analytics**: Track notification engagement
3. **Implement Topics**: Send notifications to user groups
4. **Add Rich Notifications**: Include images and actions
5. **Implement Notification Preferences**: Let users control notification types

## Files Created/Modified

- `src/services/firebase/messaging.ts` - FCM service
- `src/services/firebase/functions.ts` - Cloud Functions client
- `src/config/firebase.ts` - Configuration
- `src/services/notifications.ts` - Updated notification service
- `src/App.tsx` - FCM initialization
- `public/sw.js` - Service worker for background notifications
- `functions/` - Cloud Functions for sending notifications
- `firebase.json` - Firebase configuration

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser console logs
3. Check Cloud Functions logs
4. Verify all configuration steps are completed 