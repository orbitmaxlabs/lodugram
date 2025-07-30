import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { getUserByUsername, sendFriendRequest, testSearchConnection } from '@/services/firebase/friends'
import { checkUsernameInDatabase } from '@/services/firebase/username'
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const AddFriend = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError('')
    
    try {
      console.log('=== STARTING USER SEARCH ===')
      console.log('Searching for username:', searchQuery.trim())
      
      // Test search connection first
      const searchConnected = await testSearchConnection()
      console.log('Search connection test result:', searchConnected)
      
      if (!searchConnected) {
        setError('Search service unavailable. Please try again.')
        return
      }
      
      // Check if username exists in database
      const usernameExists = await checkUsernameInDatabase(searchQuery.trim())
      console.log('Username exists in database:', usernameExists)
      
      if (!usernameExists) {
        setSearchResults([])
        setError('No user found with that username')
        console.log('Username not found in database:', searchQuery.trim())
        return
      }
      
      const results = await getUserByUsername(searchQuery.trim())
      console.log('Search results:', results)
      
      if (results) {
        // Don't show current user in results
        if (results.uid !== user?.uid) {
          setSearchResults([results])
          console.log('User found and added to results')
        } else {
          setSearchResults([])
          setError('You cannot add yourself as a friend')
          console.log('User tried to add themselves')
        }
      } else {
        setSearchResults([])
        setError('No user found with that username')
        console.log('No user found with username:', searchQuery.trim())
      }
      
      console.log('=== SEARCH COMPLETE ===')
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search for user')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (targetUserId: string) => {
    if (!user) return

    setIsSendingRequest(targetUserId)
    setError('')
    
    try {
      await sendFriendRequest(user.uid, targetUserId)
      // Update the search results to show request sent
      setSearchResults(prev => 
        prev.map(result => 
          result.uid === targetUserId 
            ? { ...result, requestSent: true }
            : result
        )
      )
    } catch (error) {
      console.error('Send request error:', error)
      setError('Failed to send friend request')
    } finally {
      setIsSendingRequest(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Friend</h1>
          <p className="text-gray-600">Search for users by username</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter username (e.g., @username)"
                className="input pr-12"
                disabled={isSearching}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                ) : (
                  <MagnifyingGlassIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div key={result.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {result.photoURL ? (
                    <img
                      src={result.photoURL}
                      alt={result.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {result.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">@{result.username}</h4>
                    <p className="text-sm text-gray-600">{result.username}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSendRequest(result.uid)}
                  disabled={isSendingRequest === result.uid || result.requestSent}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    result.requestSent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {isSendingRequest === result.uid ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  ) : result.requestSent ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <UserPlusIcon className="w-4 h-4" />
                  )}
                  <span>
                    {isSendingRequest === result.uid
                      ? 'Sending...'
                      : result.requestSent
                      ? 'Request Sent'
                      : 'Add Friend'
                    }
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && !isSearching && searchQuery && !error && (
        <div className="card text-center py-8">
          <XMarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try searching with a different username</p>
        </div>
      )}
    </div>
  )
}

export default AddFriend 