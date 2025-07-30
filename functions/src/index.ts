import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()
const messaging = admin.messaging()

// Send notification to all users
export const sendNotificationToAllUsers = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { title, body, data: notificationData } = data

    if (!title || !body) {
      throw new functions.https.HttpsError('invalid-argument', 'Title and body are required')
    }

    // Get all FCM tokens
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .get()

    const tokens: string[] = []
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken)
      }
    })

    if (tokens.length === 0) {
      console.log('No FCM tokens found')
      return { success: true, message: 'No users to notify' }
    }

    // Send notification to all tokens
    const message = {
      notification: {
        title,
        body,
      },
      data: notificationData || {},
      tokens,
    }

    const response = await messaging.sendMulticast(message)
    
    console.log('Successfully sent messages:', response.successCount)
    console.log('Failed to send messages:', response.failureCount)

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    throw new functions.https.HttpsError('internal', 'Failed to send notification')
  }
})

// Send notification to specific user
export const sendNotificationToUser = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { userId, title, body, data: notificationData } = data

    if (!userId || !title || !body) {
      throw new functions.https.HttpsError('invalid-argument', 'userId, title, and body are required')
    }

    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found')
    }

    const userData = userDoc.data()
    if (!userData?.fcmToken) {
      throw new functions.https.HttpsError('failed-precondition', 'User has no FCM token')
    }

    // Send notification
    const message = {
      notification: {
        title,
        body,
      },
      data: notificationData || {},
      token: userData.fcmToken,
    }

    const response = await messaging.send(message)
    
    console.log('Successfully sent message:', response)

    return {
      success: true,
      messageId: response,
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    throw new functions.https.HttpsError('internal', 'Failed to send notification')
  }
})

// Send greeting notification (triggered when a greeting is sent)
export const sendGreetingNotification = functions.firestore
  .document('greetings/{greetingId}')
  .onCreate(async (snap, context) => {
    try {
      const greetingData = snap.data()
      const { fromUserId, toUserId, message } = greetingData

      if (!fromUserId || !toUserId || !message) {
        console.log('Invalid greeting data')
        return
      }

      // Get sender's username
      const fromUserDoc = await db.collection('users').doc(fromUserId).get()
      const fromUserData = fromUserDoc.data()
      const fromUsername = fromUserData?.username || fromUserData?.displayName || 'Someone'

      // Get recipient's FCM token
      const toUserDoc = await db.collection('users').doc(toUserId).get()
      const toUserData = toUserDoc.data()
      
      if (!toUserData?.fcmToken) {
        console.log('Recipient has no FCM token')
        return
      }

      // Send notification
      const notificationMessage = {
        notification: {
          title: `Greeting from @${fromUsername}!`,
          body: message,
        },
        data: {
          type: 'greeting',
          fromUserId,
          toUserId,
          greetingId: context.params.greetingId,
        },
        token: toUserData.fcmToken,
      }

      const response = await messaging.send(notificationMessage)
      console.log('Greeting notification sent:', response)
    } catch (error) {
      console.error('Error sending greeting notification:', error)
    }
  })

// Clean up invalid FCM tokens
export const cleanupInvalidTokens = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .get()

    const batch = db.batch()
    let cleanupCount = 0

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      const token = userData.fcmToken

      try {
        // Test if token is still valid
        await messaging.send({
          token,
          data: { test: 'true' }
        })
      } catch (error) {
        // Token is invalid, remove it
        batch.update(doc.ref, { fcmToken: null })
        cleanupCount++
      }
    }

    if (cleanupCount > 0) {
      await batch.commit()
      console.log(`Cleaned up ${cleanupCount} invalid FCM tokens`)
    }

    return { success: true, cleanupCount }
  } catch (error) {
    console.error('Error cleaning up invalid tokens:', error)
    return { success: false, error: error.message }
  }
}) 