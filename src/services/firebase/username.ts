import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { db } from './auth'

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    // Check if username exists in usernames collection
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '==', username.toLowerCase())
    )
    const usernameSnapshot = await getDocs(usernameQuery)
    
    return usernameSnapshot.empty
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
  }
}

// Set username for a user
export const setUsername = async (uid: string, username: string): Promise<void> => {
  try {
    console.log('Setting username:', username, 'for user:', uid)
    
    // First, get the existing user data
    const userRef = doc(db, 'users', uid)
    let userSnap
    try {
      userSnap = await getDoc(userRef)
    } catch (error) {
      console.log('Error getting existing user data, continuing with empty data:', error)
      userSnap = { exists: () => false, data: () => ({}) }
    }
    
    let userData = {}
    if (userSnap.exists()) {
      userData = userSnap.data() || {}
      console.log('Existing user data:', userData)
    }
    
    // Update user document with username as display name, preserving existing data
    const updatedUserData = {
      ...userData,
      username: username.toLowerCase(),
      displayName: username.toLowerCase(), // Use username as display name
      updatedAt: new Date(),
    }
    
    console.log('Updated user data to save:', updatedUserData)
    
    // Try to save with retry logic
    let saveSuccess = false
    let attempts = 0
    const maxAttempts = 3
    
    while (!saveSuccess && attempts < maxAttempts) {
      try {
        attempts++
        console.log(`Attempt ${attempts} to save username...`)
        
        await setDoc(userRef, updatedUserData, { merge: true })
        console.log('Updated user document successfully')
        saveSuccess = true
        
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error)
        if (attempts >= maxAttempts) {
          throw error
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Add username to usernames collection for uniqueness
    const usernameRef = doc(db, 'usernames', username.toLowerCase())
    try {
      await setDoc(usernameRef, {
        username: username.toLowerCase(),
        uid: uid,
        createdAt: new Date(),
      })
      console.log('Added username to usernames collection')
    } catch (error) {
      console.error('Error adding to usernames collection:', error)
      // Don't throw here, as the main user document was saved
    }
    
    // Verify the username was saved correctly
    try {
      const verifyUserSnap = await getDoc(userRef)
      if (verifyUserSnap.exists()) {
        const savedUserData = verifyUserSnap.data()
        console.log('Verified saved user data:', savedUserData)
        console.log('Username in database:', savedUserData.username)
      }
    } catch (error) {
      console.error('Error verifying saved data:', error)
    }
    
  } catch (error) {
    console.error('Error setting username:', error)
    throw new Error('Failed to set username')
  }
}

// Get user by username
export const getUserByUsername = async (username: string) => {
  try {
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '==', username.toLowerCase())
    )
    const usernameSnapshot = await getDocs(usernameQuery)
    
    if (usernameSnapshot.empty) {
      return null
    }
    
    const usernameDoc = usernameSnapshot.docs[0]
    const uid = usernameDoc.data().uid
    
    // Get user document
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data()
    }
    
    return null
  } catch (error) {
    console.error('Error getting user by username:', error)
    return null
  }
}

// Get username for a user
export const getUsername = async (uid: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      console.log('Retrieved user data for username:', userData)
      return userData.username || null
    }
    
    return null
  } catch (error) {
    console.error('Error getting username:', error)
    return null
  }
}

// Simple username setter (fallback)
export const setUsernameSimple = async (uid: string, username: string): Promise<void> => {
  try {
    console.log('Simple username setter - Setting:', username, 'for user:', uid)
    
    const userRef = doc(db, 'users', uid)
    
    // Just set the username field directly
    await setDoc(userRef, {
      username: username.toLowerCase(),
      displayName: username.toLowerCase(),
    }, { merge: true })
    
    console.log('Simple username setter - Success')
    
  } catch (error) {
    console.error('Simple username setter - Error:', error)
    throw new Error('Failed to set username')
  }
}

// Check if username exists in database
export const checkUsernameInDatabase = async (username: string): Promise<boolean> => {
  try {
    console.log('Checking if username exists in database:', username)
    
    // Check in usernames collection
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '==', username.toLowerCase())
    )
    const usernameSnapshot = await getDocs(usernameQuery)
    
    if (!usernameSnapshot.empty) {
      console.log('Username found in usernames collection')
      return true
    }
    
    // Check in users collection
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    )
    const usersSnapshot = await getDocs(usersQuery)
    
    if (!usersSnapshot.empty) {
      console.log('Username found in users collection')
      return true
    }
    
    console.log('Username not found in database')
    return false
  } catch (error) {
    console.error('Error checking username in database:', error)
    return false
  }
} 