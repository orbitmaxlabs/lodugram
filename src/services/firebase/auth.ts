import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { getUsername } from './username'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkWfYFDm84s3bz_aUAUAfUDmxxjg7DNnw",
  authDomain: "lodugram.firebaseapp.com",
  projectId: "lodugram",
  storageBucket: "lodugram.firebasestorage.app",
  messagingSenderId: "506675227207",
  appId: "1:506675227207:web:162dee371450d6cdccdf62"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export interface User {
  uid: string
  email: string
  displayName: string
  username?: string
  photoURL?: string
}

// Convert Firebase user to our User interface
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  try {
    const username = await getUsername(firebaseUser.uid)
    console.log('Converted user:', firebaseUser.uid, 'Username:', username)
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: username || firebaseUser.displayName || '', // Use username as display name
      photoURL: firebaseUser.photoURL || undefined,
      username: username || undefined,
    }
  } catch (error) {
    console.error('Error converting Firebase user:', error)
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      username: undefined,
    }
  }
}

// Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = await convertFirebaseUser(result.user)
    
    // Save user to Firestore
    await saveUserToFirestore(user)
    
    return user
  } catch (error) {
    console.error('Google Sign-In error:', error)
    throw new Error('Failed to sign in with Google')
  }
}

// Sign Out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    // Don't throw error, just log it
  }
}

// Save user to Firestore
const saveUserToFirestore = async (user: User): Promise<void> => {
  try {
    console.log('Saving user to Firestore:', user)
    
    const userRef = doc(db, 'users', user.uid)
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      username: user.username,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    console.log('User data to save:', userData)
    
    console.log('Saving user data:', userData)
    await setDoc(userRef, userData, { merge: true })
    console.log('User saved to Firestore successfully')
  } catch (error) {
    console.error('Error saving user to Firestore:', error)
  }
}

// Get user from Firestore
export const getUserFromFirestore = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data() as User
    }
    return null
  } catch (error) {
    console.error('Error getting user from Firestore:', error)
    return null
  }
}

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        console.log('Auth state changed - Firebase user:', firebaseUser.uid)
        const user = await convertFirebaseUser(firebaseUser)
        console.log('Converted user with username:', user.username)
        callback(user)
      } else {
        console.log('Auth state changed - User signed out')
        callback(null)
      }
    } catch (error) {
      // Suppress common Firebase connection errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('ERR_BLOCKED_BY_CLIENT') && 
          !errorMessage.includes('Cross-Origin-Opener-Policy')) {
        console.error('Auth state change error:', error)
      }
      callback(null)
    }
  })
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser
  return firebaseUser ? await convertFirebaseUser(firebaseUser) : null
}

// Refresh user data from Firestore
export const refreshUserData = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      return {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        username: userData.username,
      } as User
    }
    return null
  } catch (error) {
    console.error('Error refreshing user data:', error)
    return null
  }
}

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const testRef = doc(db, 'test', 'connection')
    await setDoc(testRef, { test: true, timestamp: new Date() })
    console.log('Database connection test successful')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

export { auth, db } 