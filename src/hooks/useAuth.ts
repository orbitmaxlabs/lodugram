import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setUser, setLoading, setError, logout } from '@/store/authSlice'
import { signInWithGoogle, signOutUser, onAuthStateChange } from '@/services/firebase/auth'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  )

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
      dispatch(setUser(user))
      dispatch(setLoading(false))
    })

    return () => unsubscribe()
  }, [dispatch])

  // Google Sign-In
  const signInWithGoogleHandler = async () => {
    try {
      dispatch(setLoading(true))
      dispatch(setError(null))
      
      const user = await signInWithGoogle()
      dispatch(setUser(user))
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
      dispatch(setError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Sign Out
  const signOutHandler = async () => {
    try {
      dispatch(setLoading(true))
      console.log('Signing out user...')
      await signOutUser()
      console.log('User signed out successfully')
      dispatch(logout())
    } catch (error) {
      console.error('Sign out error:', error)
      // Still logout even if there's an error
      dispatch(logout())
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Clear error
  const clearError = () => {
    dispatch(setError(null))
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signInWithGoogle: signInWithGoogleHandler,
    signOut: signOutHandler,
    clearError,
  }
} 