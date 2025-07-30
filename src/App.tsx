import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import UsernameGuard from '@/components/auth/UsernameGuard'
import { initializeFCM, setupForegroundMessageHandler, setupNotificationClickHandler } from '@/services/notifications'
import { useAuth } from '@/hooks/useAuth'

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Profile = lazy(() => import('@/pages/Profile'))
const ChooseUsername = lazy(() => import('@/pages/ChooseUsername'))
const AddFriend = lazy(() => import('@/pages/AddFriend'))
const Greetings = lazy(() => import('@/pages/Greetings'))

function App() {
  const { user } = useAuth()

  useEffect(() => {
    // Setup notification click handler
    setupNotificationClickHandler()

    // Initialize FCM if user is authenticated
    if (user) {
      initializeFCM()
      
      // Setup foreground message handler
      const unsubscribe = setupForegroundMessageHandler()
      
      return () => {
        unsubscribe()
      }
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/choose-username" element={<ChooseUsername />} />
            <Route path="/add-friend" element={<AddFriend />} />
            <Route path="/greetings" element={<Greetings />} />
          </Routes>
        </Suspense>
      </Layout>
    </div>
  )
}

export default App 