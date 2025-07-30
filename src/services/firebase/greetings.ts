import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from './auth'

// Greeting messages
const GREETING_MESSAGES = [
  "Hey there! Hope you're having an amazing day! 🌟",
  "Just wanted to send you some positive vibes! ✨",
  "Thinking of you and hoping your day is wonderful! 💫",
  "Sending you a virtual hug and lots of love! 🤗",
  "You're awesome and I hope you know it! 🌈",
  "Wishing you joy, laughter, and all the good things! 🎉",
  "You make the world a better place! 🌍",
  "Sending you sunshine and smiles! ☀️",
  "Hope your day is as amazing as you are! 🌟",
  "You're doing great and I'm proud of you! 🏆",
  "Sending you good vibes and positive energy! ✨",
  "You're loved and appreciated! 💖",
  "Hope you're having a fantastic day! 🎊",
  "You're incredible and don't forget it! 💪",
  "Sending you warm thoughts and good wishes! 🌸"
]

// Get random greeting message
const getRandomGreeting = (): string => {
  const randomIndex = Math.floor(Math.random() * GREETING_MESSAGES.length)
  return GREETING_MESSAGES[randomIndex]
}

// Send greeting to a friend
export const sendGreeting = async (
  fromUserId: string, 
  toUserId: string, 
  fromUsername: string
): Promise<void> => {
  try {
    console.log('Sending greeting from:', fromUserId, 'to:', toUserId)
    
    const greetingId = `${fromUserId}_${toUserId}_${Date.now()}`
    const greetingRef = doc(db, 'greetings', greetingId)
    
    const greetingData = {
      id: greetingId,
      fromUserId,
      toUserId,
      fromUsername,
      message: getRandomGreeting(),
      createdAt: new Date(),
      read: false,
    }
    
    console.log('Greeting data:', greetingData)
    
    await setDoc(greetingRef, greetingData)
    console.log('Greeting sent successfully')
    
  } catch (error) {
    console.error('Error sending greeting:', error)
    throw new Error('Failed to send greeting')
  }
}

// Get greetings for a user
export const getUserGreetings = (userId: string, callback: (greetings: any[]) => void) => {
  const greetingsQuery = query(
    collection(db, 'greetings'),
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  
  return onSnapshot(greetingsQuery, (snapshot) => {
    const greetings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    console.log('Greetings received:', greetings.length)
    callback(greetings)
  }, (error) => {
    console.error('Error in greetings listener:', error)
    // Fallback: try without orderBy if index doesn't exist
    if (error.code === 'failed-precondition') {
      console.log('Trying fallback query without orderBy...')
      const fallbackQuery = query(
        collection(db, 'greetings'),
        where('toUserId', '==', userId),
        limit(50)
      )
      
      return onSnapshot(fallbackQuery, (snapshot) => {
        const greetings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Sort manually
        greetings.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
        console.log('Greetings received (fallback):', greetings.length)
        callback(greetings)
      })
    }
  })
}

// Mark greeting as read
export const markGreetingAsRead = async (greetingId: string): Promise<void> => {
  try {
    const greetingRef = doc(db, 'greetings', greetingId)
    await setDoc(greetingRef, { read: true }, { merge: true })
    console.log('Greeting marked as read:', greetingId)
  } catch (error) {
    console.error('Error marking greeting as read:', error)
  }
}

// Get unread greetings count
export const getUnreadGreetingsCount = (userId: string, callback: (count: number) => void) => {
  const unreadQuery = query(
    collection(db, 'greetings'),
    where('toUserId', '==', userId),
    where('read', '==', false)
  )
  
  return onSnapshot(unreadQuery, (snapshot) => {
    const count = snapshot.size
    console.log('Unread greetings count:', count)
    callback(count)
  }, (error) => {
    console.error('Error in unread greetings listener:', error)
  })
} 