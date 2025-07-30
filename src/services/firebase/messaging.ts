import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { app } from './auth'
import { vapidKey } from '@/config/firebase'

// Initialize Firebase Cloud Messaging
let messaging: any = null

// Initialize messaging if supported
const initializeMessaging = async () => {
  try {
    const isMessagingSupported = await isSupported()
    if (isMessagingSupported) {
      messaging = getMessaging(app)
      console.log('Firebase Cloud Messaging initialized successfully')
      return messaging
    } else {
      console.log('Firebase Cloud Messaging is not supported in this browser')
      return null
    }
  } catch (error) {
    console.error('Error initializing Firebase Cloud Messaging:', error)
    return null
  }
}

// Get FCM token for the current user
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      messaging = await initializeMessaging()
      if (!messaging) return null
    }

    // Check if we have permission
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted')
      return null
    }

    // Get the token
    const token = await getToken(messaging, {
      vapidKey: vapidKey
    })

    if (token) {
      console.log('FCM Token:', token)
      return token
    } else {
      console.log('No registration token available')
      return null
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.log('Messaging not initialized')
    return () => {}
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload)
    callback(payload)
  })
}

// Save FCM token to user's document in Firestore
export const saveFCMTokenToUser = async (userId: string, token: string): Promise<void> => {
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const { db } = await import('./auth')
    
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      fcmToken: token,
      updatedAt: new Date()
    }, { merge: true })
    
    console.log('FCM token saved to user document')
  } catch (error) {
    console.error('Error saving FCM token to user:', error)
  }
}

// Remove FCM token from user's document
export const removeFCMTokenFromUser = async (userId: string): Promise<void> => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('./auth')
    
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      fcmToken: null,
      updatedAt: new Date()
    })
    
    console.log('FCM token removed from user document')
  } catch (error) {
    console.error('Error removing FCM token from user:', error)
  }
}

// Get all FCM tokens for sending notifications to all users
export const getAllFCMTokens = async (): Promise<string[]> => {
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore')
    const { db } = await import('./auth')
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('fcmToken', '!=', null))
    const querySnapshot = await getDocs(q)
    
    const tokens: string[] = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken)
      }
    })
    
    console.log('Retrieved FCM tokens:', tokens.length)
    return tokens
  } catch (error) {
    console.error('Error getting all FCM tokens:', error)
    return []
  }
}

export { messaging } 