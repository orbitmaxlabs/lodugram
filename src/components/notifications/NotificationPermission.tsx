import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline'
import { 
  requestNotificationPermission, 
  getNotificationPermission,
  isNotificationsSupported 
} from '@/services/notifications'

const NotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isRequesting, setIsRequesting] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    const checkPermission = () => {
      setIsSupported(isNotificationsSupported())
      setPermission(getNotificationPermission())
    }

    checkPermission()
  }, [])

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      const granted = await requestNotificationPermission()
      setPermission(granted ? 'granted' : 'denied')
    } catch (error) {
      console.error('Error requesting permission:', error)
      setPermission('denied')
    } finally {
      setIsRequesting(false)
    }
  }

  // Don't show if notifications are not supported
  if (!isSupported) {
    return null
  }

  // Don't show if permission is already granted
  if (permission === 'granted') {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {permission === 'denied' ? (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          ) : (
            <BellIcon className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-blue-900">
            {permission === 'denied' ? 'Notifications Disabled' : 'Enable Notifications'}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {permission === 'denied' 
              ? 'You\'ll miss out on greetings from your friends. Enable notifications in your browser settings.'
              : 'Get notified when friends send you greetings!'
            }
          </p>
        </div>
        <div className="flex-shrink-0">
          {permission === 'denied' ? (
            <button
              onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Open Settings
            </button>
          ) : (
            <button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {isRequesting ? 'Requesting...' : 'Enable'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationPermission 