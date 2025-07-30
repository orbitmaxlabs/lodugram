import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { useAuth } from '@/hooks/useAuth'
import { checkUsernameAvailability, setUsername, setUsernameSimple } from '@/services/firebase/username'
import { setUser } from '@/store/authSlice'
import { refreshUserData, testDatabaseConnection } from '@/services/firebase/auth'
import { 
  HeartIcon, 
  CheckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const ChooseUsername = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { signOut } = useAuth()
  const [username, setUsername] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // If user already has a username, redirect to home
    if (user.username) {
      navigate('/')
    }
  }, [user, navigate])

  // Check username availability
  const checkUsernameAvailabilityHandler = async (username: string) => {
    if (username.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    try {
      const available = await checkUsernameAvailability(username)
      setIsAvailable(available)
    } catch (error) {
      setIsAvailable(false)
    } finally {
      setIsChecking(false)
    }
  }

  // Handle username input change
  const handleUsernameChange = (value: string) => {
    const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(cleanUsername)
    setError('')
    
    if (cleanUsername.length >= 3) {
      checkUsernameAvailabilityHandler(cleanUsername)
    } else {
      setIsAvailable(null)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (!isAvailable) {
      setError('Username is not available')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('=== STARTING USERNAME SETTING PROCESS ===')
      console.log('User ID:', user.uid)
      console.log('Username to set:', username)
      console.log('Current user data:', user)
      
      // Test database connection first
      const dbConnected = await testDatabaseConnection()
      console.log('Database connection test result:', dbConnected)
      
      if (!dbConnected) {
        throw new Error('Database connection failed')
      }
      
      // Try simple approach first
      try {
        await setUsernameSimple(user.uid, username)
        console.log('Username set successfully with simple method')
      } catch (error) {
        console.log('Simple method failed, trying complex method:', error)
        await setUsername(user.uid, username)
        console.log('Username set successfully with complex method')
      }
      
      // Refresh user data from Firestore to get the updated username
      console.log('Refreshing user data from Firestore...')
      const refreshedUser = await refreshUserData(user.uid)
      console.log('Refreshed user data:', refreshedUser)
      
      if (refreshedUser && refreshedUser.username) {
        dispatch(setUser(refreshedUser))
        console.log('Updated user state with refreshed data:', refreshedUser)
      } else {
        console.error('Failed to refresh user data or username not found')
        // Try to manually update the state with the username
        const manualUser = {
          ...user,
          username: username.toLowerCase(),
          displayName: username.toLowerCase(),
        }
        dispatch(setUser(manualUser))
        console.log('Manually updated user state:', manualUser)
      }
      
      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('=== USERNAME SETTING PROCESS COMPLETE ===')
      
      // Navigate to home page
      navigate('/')
    } catch (error) {
      console.error('Error setting username:', error)
      setError('Failed to set username. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Username
          </h2>
          <p className="text-gray-600 mb-8">
            This will be your public identity on LODUGRAM
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{user.displayName}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Username Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="input pr-10"
                placeholder="Enter your username"
                disabled={isSubmitting}
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isChecking && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                )}
                {!isChecking && isAvailable === true && (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <XMarkIcon className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            
            {/* Username validation messages */}
            {username.length > 0 && username.length < 3 && (
              <p className="mt-1 text-sm text-red-600">
                Username must be at least 3 characters
              </p>
            )}
            {isAvailable === false && (
              <p className="mt-1 text-sm text-red-600">
                Username is not available
              </p>
            )}
            {isAvailable === true && (
              <p className="mt-1 text-sm text-green-600">
                Username is available
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!username || username.length < 3 || !isAvailable || isSubmitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Setting username...' : 'Continue'}
          </button>
        </form>

        {/* Sign out option */}
        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out and use different account
          </button>
        </div>

        {/* Username guidelines */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Username Guidelines</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 3-20 characters long</li>
            <li>• Only letters, numbers, and underscores</li>
            <li>• Must be unique across all users</li>
            <li>• This will be your public identity</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChooseUsername 