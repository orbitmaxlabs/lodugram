import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setFriends, addFriend, removeFriend } from '@/store/friendsSlice'
import { getUserFriends } from '@/services/firebase/friends'

export const useFriends = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { friends } = useSelector((state: RootState) => state.friends)

  useEffect(() => {
    if (!user?.uid) {
      console.log('No user, clearing friends')
      dispatch(setFriends([]))
      return
    }

    console.log('Setting up friends listener for user:', user.uid)
    const unsubscribe = getUserFriends(user.uid, (friends) => {
      console.log('Friends callback received:', friends.length, 'friends')
      console.log('Friends data:', friends)
      
                 // Transform the data to match the Friend interface
           const transformedFriends = friends.map(friend => ({
             id: friend.id || friend.uid,
             uid: friend.uid,
             displayName: friend.displayName || friend.username || 'Unknown User',
             email: friend.email || '',
             photoURL: friend.photoURL,
             status: 'online' as const, // Default status
             lastSeen: new Date(), // Convert to Date object
           }))
      
      console.log('Transformed friends:', transformedFriends)
      dispatch(setFriends(transformedFriends))
    })

    return () => {
      console.log('Cleaning up friends listener')
      unsubscribe()
    }
  }, [user?.uid, dispatch])

  const addFriendToList = (friend: any) => {
    dispatch(addFriend(friend))
  }

  const removeFriendFromList = (friendId: string) => {
    dispatch(removeFriend(friendId))
  }

  return {
    friends,
    addFriend: addFriendToList,
    removeFriend: removeFriendFromList,
  }
} 