import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '@/store/store'
import { useAuth } from '@/hooks/useAuth'
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const Profile = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still navigate to login even if there's an error
      navigate('/login')
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center space-x-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">@{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Friends</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Greetings Sent</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Greetings Received</div>
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Account Settings</span>
            </div>
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Notification Preferences</span>
            </div>
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Privacy Settings</span>
            </div>
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="space-y-3">
          <button className="w-full btn-secondary text-left">
            Export Data
          </button>
          <button className="w-full btn-secondary text-left">
            Delete Account
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full btn-secondary text-left text-red-600 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile 