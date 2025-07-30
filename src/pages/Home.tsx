import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { RootState } from '@/store/store'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlusIcon, HeartIcon } from '@heroicons/react/24/outline'
import FriendRequests from '@/components/friends/FriendRequests'
import NotificationPermission from '@/components/notifications/NotificationPermission'
import Toast from '@/components/common/Toast'
import { useFriends } from '@/hooks/useFriends'
import { testFriendships } from '@/services/firebase/friends'
import { sendGreeting } from '@/services/firebase/greetings'
import { showGreetingNotification } from '@/services/notifications'
import { useGreetings } from '@/hooks/useGreetings'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { friends } = useFriends()

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Initialize greetings listener
  useGreetings()

  // Test notification function
  const testNotification = () => {
    showGreetingNotification('testuser', 'This is a test notification! 🎉')
  }

  // Debug function to check greetings
  const debugGreetings = async () => {
    if (!user?.uid) return
    
    try {
      const { getUserGreetings } = await import('@/services/firebase/greetings')
      getUserGreetings(user.uid, (greetings) => {
        console.log('DEBUG: Current greetings for user:', greetings)
        console.log('DEBUG: Unread greetings:', greetings.filter(g => !g.read))
        
        // Test notification for first unread greeting
        const unreadGreetings = greetings.filter(g => !g.read)
        if (unreadGreetings.length > 0) {
          const firstGreeting = unreadGreetings[0]
          console.log('Testing notification for existing greeting:', firstGreeting)
          showGreetingNotification(firstGreeting.fromUsername, firstGreeting.message)
        }
      })
    } catch (error) {
      console.error('Error debugging greetings:', error)
    }
  }
  
  // Debug logging
  console.log('Home page - isAuthenticated:', isAuthenticated)
  console.log('Home page - friends count:', friends.length)
  console.log('Home page - friends data:', friends)
  
  // Test friendships if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      testFriendships(user.uid)
    }
  }, [isAuthenticated, user?.uid])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to LODUCHAT
          </h1>
          <p className="text-gray-600 mb-8">
            Send random greetings to your friends and brighten their day with thoughtful messages.
          </p>
          <div className="space-y-4">
            <Link to="/register" className="btn-primary w-full">
              Get Started
            </Link>
            <Link to="/login" className="btn-secondary w-full">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Notification Permission */}
      <NotificationPermission />
      
      {/* Test Notification Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Test Notifications</h3>
            <p className="text-sm text-yellow-700 mt-1">Click to test if notifications are working</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={testNotification}
              className="btn-secondary text-sm"
            >
              Test Notification
            </button>
            <button
              onClick={debugGreetings}
              className="btn-secondary text-sm"
            >
              Debug Greetings
            </button>
          </div>
        </div>
      </div>
      
      {/* Friend Requests */}
      <FriendRequests />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Friends</h1>
          <p className="text-gray-600">Send greetings to brighten their day</p>
        </div>
        <button
          onClick={() => navigate('/add-friend')}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Friends List */}
      {friends.length === 0 ? (
        <div className="text-center py-12">
          <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
          <p className="text-gray-600 mb-6">
            Add some friends to start sending greetings
          </p>
          <button 
            onClick={() => navigate('/add-friend')} 
            className="btn-primary"
          >
            Add Your First Friend
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} onDebugGreetings={debugGreetings} />
          ))}
        </div>
      )}
    </div>
  )
}

interface FriendCardProps {
  friend: {
    id: string
    displayName: string
    username?: string
    email: string
    photoURL?: string
    status: 'online' | 'offline' | 'away'
  }
}

const FriendCard = ({ friend, onDebugGreetings }: FriendCardProps & { onDebugGreetings: () => void }) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [sendingGreeting, setSendingGreeting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSendGreeting = async () => {
    if (!user?.uid || !user?.username) {
      console.error('User not authenticated or no username')
      return
    }

    setSendingGreeting(true)
    try {
      console.log('=== SENDING GREETING ===')
      console.log('From user:', user.uid, '@' + user.username)
      console.log('To friend:', friend.id, '@' + friend.username)
      console.log('Sending greeting to:', friend.displayName)
      
      await sendGreeting(user.uid, friend.id, user.username)
      console.log('Greeting sent successfully to:', friend.username)
      setToast({ message: `Greeting sent to @${friend.username}!`, type: 'success' })
      
      // Debug: Check if greeting was saved
      setTimeout(() => {
        onDebugGreetings()
      }, 1000)
      
    } catch (error) {
      console.error('Error sending greeting:', error)
      setToast({ message: 'Failed to send greeting. Please try again.', type: 'error' })
    } finally {
      setSendingGreeting(false)
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {friend.photoURL ? (
            <img
              src={friend.photoURL}
              alt={friend.displayName}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {friend.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              friend.status === 'online'
                ? 'bg-green-500'
                : friend.status === 'away'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            @{friend.username}
          </h3>
          <p className="text-xs text-gray-500 truncate">{friend.displayName}</p>
        </div>
        <button
          onClick={handleSendGreeting}
          disabled={sendingGreeting}
          className="btn-primary flex-shrink-0 disabled:opacity-50"
        >
          {sendingGreeting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <HeartIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export default Home 