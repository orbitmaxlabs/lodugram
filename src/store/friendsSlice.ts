import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Friend {
  id: string
  uid: string
  displayName: string
  email: string
  photoURL?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

interface FriendsState {
  friends: Friend[]
  isLoading: boolean
  error: string | null
  selectedFriend: Friend | null
}

const initialState: FriendsState = {
  friends: [],
  isLoading: false,
  error: null,
  selectedFriend: null,
}

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload
      state.error = null
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload)
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(friend => friend.id !== action.payload)
    },
    updateFriendStatus: (state, action: PayloadAction<{ id: string; status: Friend['status'] }>) => {
      const friend = state.friends.find(f => f.id === action.payload.id)
      if (friend) {
        friend.status = action.payload.status
      }
    },
    setSelectedFriend: (state, action: PayloadAction<Friend | null>) => {
      state.selectedFriend = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setFriends,
  addFriend,
  removeFriend,
  updateFriendStatus,
  setSelectedFriend,
  setError,
  clearError,
} = friendsSlice.actions

export default friendsSlice.reducer 