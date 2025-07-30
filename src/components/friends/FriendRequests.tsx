import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { getFriendRequests, acceptFriendRequest, declineFriendRequest } from '@/services/firebase/friends'
import { 
  UserPlusIcon, 
  CheckIcon, 
  XMarkIcon,
  BellIcon 
} from '@heroicons/react/24/outline'

interface FriendRequest {
  id: string
  fromUserId: string
  fromUsername: string
  fromDisplayName: string
  fromPhotoURL?: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

const FriendRequests = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = getFriendRequests(user.uid, (requests) => {
      setRequests(requests)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const handleAccept = async (requestId: string) => {
    setProcessingRequest(requestId)
    try {
      await acceptFriendRequest(requestId)
      // Request will be removed from the list automatically via the listener
    } catch (error) {
      console.error('Error accepting friend request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleDecline = async (requestId: string) => {
    setProcessingRequest(requestId)
    try {
      await declineFriendRequest(requestId)
      // Request will be removed from the list automatically via the listener
    } catch (error) {
      console.error('Error declining friend request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <BellIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Friend Requests</h3>
        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
          {requests.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {request.fromPhotoURL ? (
                <img
                  src={request.fromPhotoURL}
                  alt={request.fromDisplayName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {request.fromDisplayName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
                             <div>
                 <h4 className="font-medium text-gray-900">@{request.fromUsername}</h4>
                 <p className="text-sm text-gray-600">{request.fromUsername}</p>
               </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAccept(request.id)}
                disabled={processingRequest === request.id}
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                {processingRequest === request.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                ) : (
                  <CheckIcon className="w-3 h-3" />
                )}
                <span>Accept</span>
              </button>
              
              <button
                onClick={() => handleDecline(request.id)}
                disabled={processingRequest === request.id}
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {processingRequest === request.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                ) : (
                  <XMarkIcon className="w-3 h-3" />
                )}
                <span>Decline</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FriendRequests 