import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface UsernameGuardProps {
  children: React.ReactNode
}

const UsernameGuard = ({ children }: UsernameGuardProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    console.log('UsernameGuard - isAuthenticated:', isAuthenticated, 'user:', user?.username, 'pathname:', location.pathname)
    
    // Don't redirect if we're already on the choose-username page
    if (location.pathname === '/choose-username') {
      return
    }

    // If user is authenticated but doesn't have a username, redirect to choose username
    if (isAuthenticated && user && !user.username) {
      console.log('Redirecting to choose username')
      navigate('/choose-username')
    }
  }, [isAuthenticated, user, navigate, location.pathname])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If user is not authenticated, show children (will be handled by individual pages)
  if (!isAuthenticated) {
    return <>{children}</>
  }

  // User is authenticated and has username, show children
  return <>{children}</>
}

export default UsernameGuard 