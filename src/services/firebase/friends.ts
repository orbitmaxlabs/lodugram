import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from './auth'

// Get user by username
export const getUserByUsername = async (username: string) => {
  try {
    // Remove @ symbol if present and convert to lowercase
    const cleanUsername = username.replace('@', '').toLowerCase().trim()
    
    console.log('Searching for username:', cleanUsername)
    
    // Try multiple approaches to find the user
    let userData = null
    
    // Approach 1: Search in usernames collection
    try {
      const usernameQuery = query(
        collection(db, 'usernames'),
        where('username', '==', cleanUsername)
      )
      const usernameSnapshot = await getDocs(usernameQuery)
      
      console.log('Username query results:', usernameSnapshot.size)
      
      if (!usernameSnapshot.empty) {
        const usernameDoc = usernameSnapshot.docs[0]
        const uid = usernameDoc.data().uid
        
        console.log('Found user ID:', uid)
        
        // Get user document
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          userData = userSnap.data()
          console.log('User data from usernames collection:', userData)
        }
      }
    } catch (error) {
      console.log('Approach 1 failed, trying approach 2:', error)
    }
    
    // Approach 2: Direct search in users collection if approach 1 failed
    if (!userData) {
      try {
        console.log('Trying direct search in users collection...')
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', cleanUsername)
        )
        const usersSnapshot = await getDocs(usersQuery)
        
        console.log('Direct users query results:', usersSnapshot.size)
        
        if (!usersSnapshot.empty) {
          userData = usersSnapshot.docs[0].data()
          console.log('User data from direct search:', userData)
        }
      } catch (error) {
        console.log('Approach 2 failed:', error)
      }
    }
    
    // Approach 3: Try case-insensitive search
    if (!userData) {
      try {
        console.log('Trying case-insensitive search...')
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', cleanUsername)
        )
        const usersSnapshot = await getDocs(usersQuery)
        
        if (!usersSnapshot.empty) {
          userData = usersSnapshot.docs[0].data()
          console.log('User data from case-insensitive search:', userData)
        }
      } catch (error) {
        console.log('Approach 3 failed:', error)
      }
    }
    
    return userData
  } catch (error) {
    console.error('Error getting user by username:', error)
    return null
  }
}

// Send friend request
export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  try {
    const requestId = `${fromUserId}_${toUserId}`
    const requestRef = doc(db, 'friendRequests', requestId)
    
    // Check if request already exists
    const existingRequest = await getDoc(requestRef)
    if (existingRequest.exists()) {
      throw new Error('Friend request already sent')
    }
    
    // Get sender's user data
    const senderRef = doc(db, 'users', fromUserId)
    const senderSnap = await getDoc(senderRef)
    const senderData = senderSnap.data()
    
    // Create friend request
    await setDoc(requestRef, {
      fromUserId,
      toUserId,
      fromUsername: senderData?.username,
      fromDisplayName: senderData?.username, // Use username as display name
      fromPhotoURL: senderData?.photoURL,
      status: 'pending',
      createdAt: new Date(),
    })
    
    return true
  } catch (error) {
    console.error('Error sending friend request:', error)
    throw error
  }
}

// Get friend requests for a user
export const getFriendRequests = (userId: string, callback: (requests: any[]) => void) => {
  const requestsQuery = query(
    collection(db, 'friendRequests'),
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  )
  
  return onSnapshot(requestsQuery, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(requests)
  })
}

// Accept friend request
export const acceptFriendRequest = async (requestId: string) => {
  try {
    console.log('Accepting friend request:', requestId)
    
    const requestRef = doc(db, 'friendRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    if (!requestSnap.exists()) {
      throw new Error('Friend request not found')
    }
    
    const requestData = requestSnap.data()
    console.log('Request data:', requestData)
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      acceptedAt: new Date(),
    })
    console.log('Updated request status to accepted')
    
    // Add to friends collection for both users
    const friendshipId = `${requestData.fromUserId}_${requestData.toUserId}`
    const friendshipRef = doc(db, 'friendships', friendshipId)
    
    const friendshipData = {
      user1Id: requestData.fromUserId,
      user2Id: requestData.toUserId,
      createdAt: new Date(),
    }
    
    console.log('Creating friendship with ID:', friendshipId)
    console.log('Friendship data:', friendshipData)
    
    await setDoc(friendshipRef, friendshipData)
    console.log('Friendship created successfully')
    
    return true
  } catch (error) {
    console.error('Error accepting friend request:', error)
    throw error
  }
}

// Decline friend request
export const declineFriendRequest = async (requestId: string) => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId)
    await updateDoc(requestRef, {
      status: 'declined',
      declinedAt: new Date(),
    })
    
    return true
  } catch (error) {
    console.error('Error declining friend request:', error)
    throw error
  }
}

// Get user's friends
export const getUserFriends = (userId: string, callback: (friends: any[]) => void) => {
  console.log('Getting friends for user:', userId)
  
  // Query for friendships where user is user1
  const friendshipsQuery1 = query(
    collection(db, 'friendships'),
    where('user1Id', '==', userId)
  )
  
  // Query for friendships where user is user2
  const friendshipsQuery2 = query(
    collection(db, 'friendships'),
    where('user2Id', '==', userId)
  )
  
  let friends1: any[] = []
  let friends2: any[] = []
  
  // Listen to first query
  const unsubscribe1 = onSnapshot(friendshipsQuery1, async (snapshot1) => {
    console.log('Friendships where user is user1:', snapshot1.size)
    
    friends1 = await Promise.all(
      snapshot1.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data()
        const friendId = data.user2Id
        console.log('Getting friend data for ID:', friendId)
        
        try {
          const friendRef = doc(db, 'users', friendId)
          const friendSnap = await getDoc(friendRef)
          if (friendSnap.exists()) {
            const friendData = friendSnap.data()
            console.log('Friend data found:', friendData)
            return { id: docSnapshot.id, ...friendData }
          }
        } catch (error) {
          console.error('Error getting friend data:', error)
        }
        return null
      })
    )
    
    // Combine and callback
    const allFriends = [...friends1.filter(Boolean), ...friends2.filter(Boolean)]
    console.log('All friends combined:', allFriends.length)
    callback(allFriends)
  })
  
  // Listen to second query
  const unsubscribe2 = onSnapshot(friendshipsQuery2, async (snapshot2) => {
    console.log('Friendships where user is user2:', snapshot2.size)
    
    friends2 = await Promise.all(
      snapshot2.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data()
        const friendId = data.user1Id
        console.log('Getting friend data for ID:', friendId)
        
        try {
          const friendRef = doc(db, 'users', friendId)
          const friendSnap = await getDoc(friendRef)
          if (friendSnap.exists()) {
            const friendData = friendSnap.data()
            console.log('Friend data found:', friendData)
            return { id: docSnapshot.id, ...friendData }
          }
        } catch (error) {
          console.error('Error getting friend data:', error)
        }
        return null
      })
    )
    
    // Combine and callback
    const allFriends = [...friends1.filter(Boolean), ...friends2.filter(Boolean)]
    console.log('All friends combined:', allFriends.length)
    callback(allFriends)
  })
  
  // Return cleanup function
  return () => {
    unsubscribe1()
    unsubscribe2()
  }
}

// Remove friend
export const removeFriend = async (userId: string, friendId: string) => {
  try {
    const friendshipId = `${userId}_${friendId}`
    const friendshipId2 = `${friendId}_${userId}`
    
    // Try to delete both possible friendship IDs
    const friendshipRef = doc(db, 'friendships', friendshipId)
    const friendshipRef2 = doc(db, 'friendships', friendshipId2)
    
    try {
      await deleteDoc(friendshipRef)
    } catch (error) {
      // Friendship might not exist with this ID
    }
    
    try {
      await deleteDoc(friendshipRef2)
    } catch (error) {
      // Friendship might not exist with this ID
    }
    
    return true
  } catch (error) {
    console.error('Error removing friend:', error)
    throw error
  }
}

// Test search functionality
export const testSearchConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing search connection...')
    
    // Try to query the usernames collection
    const testQuery = query(
      collection(db, 'usernames'),
      where('username', '==', 'test')
    )
    await getDocs(testQuery)
    
    console.log('Search connection test successful')
    return true
  } catch (error) {
    console.error('Search connection test failed:', error)
    return false
  }
}

// Test friendships for a user
export const testFriendships = async (userId: string): Promise<void> => {
  try {
    console.log('Testing friendships for user:', userId)
    
    // Check friendships where user is user1
    const friendshipsQuery1 = query(
      collection(db, 'friendships'),
      where('user1Id', '==', userId)
    )
    const snapshot1 = await getDocs(friendshipsQuery1)
    console.log('Friendships where user is user1:', snapshot1.size)
    snapshot1.docs.forEach(doc => {
      console.log('Friendship 1:', doc.data())
    })
    
    // Check friendships where user is user2
    const friendshipsQuery2 = query(
      collection(db, 'friendships'),
      where('user2Id', '==', userId)
    )
    const snapshot2 = await getDocs(friendshipsQuery2)
    console.log('Friendships where user is user2:', snapshot2.size)
    snapshot2.docs.forEach(doc => {
      console.log('Friendship 2:', doc.data())
    })
    
  } catch (error) {
    console.error('Error testing friendships:', error)
  }
} 