import { getFCMToken, onForegroundMessage, saveFCMTokenToUser, removeFCMTokenFromUser } from './firebase/messaging'

// Check if notifications are supported
export const isNotificationsSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationsSupported()) {
    console.log('Notifications not supported')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
    
    if (permission === 'granted') {
      // Initialize FCM after permission is granted
      await initializeFCM()
    }
    
    return permission === 'granted'
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

// Initialize Firebase Cloud Messaging
export const initializeFCM = async (): Promise<void> => {
  try {
    // Get FCM token
    const token = await getFCMToken()
    
    if (token) {
      // Save token to user's document
      const { getCurrentUser } = await import('./firebase/auth')
      const currentUser = await getCurrentUser()
      
      if (currentUser) {
        await saveFCMTokenToUser(currentUser.uid, token)
        console.log('FCM token saved for user:', currentUser.uid)
      }
    }
  } catch (error) {
    console.error('Error initializing FCM:', error)
  }
}

// Setup foreground message handler
export const setupForegroundMessageHandler = (): (() => void) => {
  return onForegroundMessage((payload) => {
    console.log('Foreground message received:', payload)
    
    // Show notification for foreground messages
    if (payload.notification) {
      showNotification(
        payload.notification.title || 'New Message',
        {
          body: payload.notification.body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'fcm-message',
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
          data: payload.data || {}
        }
      )
    }
  })
}

// Check notification permission
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationsSupported()) {
    return 'denied'
  }
  return Notification.permission
}

// Show notification
export const showNotification = (title: string, options?: NotificationOptions) => {
  console.log('showNotification called with:', { title, options })
  console.log('Notifications supported:', isNotificationsSupported())
  console.log('Notification permission:', getNotificationPermission())
  
  if (!isNotificationsSupported()) {
    console.log('Cannot show notification - not supported')
    return
  }
  
  if (getNotificationPermission() !== 'granted') {
    console.log('Cannot show notification - permission denied')
    return
  }

  try {
    console.log('Creating notification...')
    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    })

    console.log('Notification created successfully:', notification)

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

// Show greeting notification
export const showGreetingNotification = (fromUsername: string, message: string) => {
  console.log('Attempting to show greeting notification:', { fromUsername, message })
  
  const title = `Greeting from @${fromUsername}!`
  const options: NotificationOptions = {
    body: message,
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'greeting',
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
  }

  console.log('Notification options:', options)
  const result = showNotification(title, options)
  console.log('Notification result:', result)
  return result
}

// Setup notification click handler
export const setupNotificationClickHandler = () => {
  if (!isNotificationsSupported()) return

  // Handle notification clicks
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
      // Focus the app window
      window.focus()
      
      // You can add navigation logic here
      console.log('Notification clicked:', event.data)
    }
  })
}

// Clean up FCM token when user signs out
export const cleanupFCMToken = async (): Promise<void> => {
  try {
    const { getCurrentUser } = await import('./firebase/auth')
    const currentUser = await getCurrentUser()
    
    if (currentUser) {
      await removeFCMTokenFromUser(currentUser.uid)
      console.log('FCM token removed for user:', currentUser.uid)
    }
  } catch (error) {
    console.error('Error cleaning up FCM token:', error)
  }
} 