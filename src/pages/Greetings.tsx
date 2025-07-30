import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { getUserGreetings, markGreetingAsRead } from '@/services/firebase/greetings'
import { HeartIcon, CheckIcon } from '@heroicons/react/24/outline'

const Greetings = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [greetings, setGreetings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = getUserGreetings(user.uid, (greetings) => {
      setGreetings(greetings)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const handleMarkAsRead = async (greetingId: string) => {
    try {
      await markGreetingAsRead(greetingId)
    } catch (error) {
      console.error('Error marking greeting as read:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading greetings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Greetings</h1>
        <p className="text-gray-600">Messages from your friends</p>
      </div>

      {/* Greetings List */}
      {greetings.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No greetings yet</h3>
          <p className="text-gray-600">
            When friends send you greetings, they'll appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {greetings.map((greeting) => (
            <div
              key={greeting.id}
              className={`card ${!greeting.read ? 'border-l-4 border-l-primary-500' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      @{greeting.fromUsername}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!greeting.read && (
                        <button
                          onClick={() => handleMarkAsRead(greeting.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(greeting.createdAt.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{greeting.message}</p>
                  {!greeting.read && (
                    <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mt-2">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Greetings 