import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './auth'
import { functionsRegion } from '@/config/firebase'

// Initialize Firebase Functions
const functions = getFunctions(app, functionsRegion)

// Callable functions
export const sendNotificationToAllUsers = httpsCallable(functions, 'sendNotificationToAllUsers')
export const sendNotificationToUser = httpsCallable(functions, 'sendNotificationToUser')

// Send notification to all users
export const sendNotificationToAll = async (title: string, body: string, data?: any) => {
  try {
    const result = await sendNotificationToAllUsers({ title, body, data })
    console.log('Notification sent to all users:', result)
    return result.data
  } catch (error) {
    console.error('Error sending notification to all users:', error)
    throw error
  }
}

// Send notification to specific user
export const sendNotificationToSpecificUser = async (userId: string, title: string, body: string, data?: any) => {
  try {
    const result = await sendNotificationToUser({ userId, title, body, data })
    console.log('Notification sent to user:', result)
    return result.data
  } catch (error) {
    console.error('Error sending notification to user:', error)
    throw error
  }
} 