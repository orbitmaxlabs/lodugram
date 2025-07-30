import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { 
  HeartIcon, 
  ArrowRightIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

const Register = () => {
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuth()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [isSigningUp, setIsSigningUp] = useState(false)

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated, redirecting...')
      if (user.username) {
        navigate('/')
      } else {
        navigate('/choose-username')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleGoogleSignUp = async () => {
    try {
      setIsSigningUp(true)
      console.log('Starting Google Sign-Up...')
      await signInWithGoogle()
      console.log('Google Sign-Up completed')
    } catch (error) {
      console.error('Sign up error:', error)
    } finally {
      setIsSigningUp(false)
    }
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
            Join LODUCHAT
          </h2>
          <p className="text-gray-600 mb-8">
            Create your account and start spreading joy with greetings
          </p>
        </div>

        {/* Google Sign-Up Button */}
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignUp}
            disabled={isSigningUp}
            className="w-full flex items-center justify-center space-x-3 bg-white text-gray-700 border border-gray-300 rounded-xl px-6 py-4 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningUp ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>
              {isSigningUp ? 'Creating account...' : 'Sign up with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-primary-50 to-secondary-50 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Sign in to your account
              <ArrowRightIcon className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
            What you'll get with LODUCHAT
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Easy Friend Management</h4>
                <p className="text-sm text-gray-600">Add friends and keep track of your connections</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Random Greetings</h4>
                <p className="text-sm text-gray-600">Send thoughtful, random greetings with one tap</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Cross-Platform</h4>
                <p className="text-sm text-gray-600">Works on all devices - mobile, tablet, and desktop</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Privacy First</h4>
                <p className="text-sm text-gray-600">Your data is secure and private</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center text-xs text-gray-500">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}

export default Register 