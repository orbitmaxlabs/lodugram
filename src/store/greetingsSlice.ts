import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Greeting {
  id: string
  fromUserId: string
  toUserId: string
  message: string
  timestamp: Date
  isRead: boolean
}

interface GreetingsState {
  sentGreetings: Greeting[]
  receivedGreetings: Greeting[]
  isLoading: boolean
  error: string | null
}

const initialState: GreetingsState = {
  sentGreetings: [],
  receivedGreetings: [],
  isLoading: false,
  error: null,
}

const greetingsSlice = createSlice({
  name: 'greetings',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSentGreetings: (state, action: PayloadAction<Greeting[]>) => {
      state.sentGreetings = action.payload
    },
    setReceivedGreetings: (state, action: PayloadAction<Greeting[]>) => {
      state.receivedGreetings = action.payload
    },
    addSentGreeting: (state, action: PayloadAction<Greeting>) => {
      state.sentGreetings.unshift(action.payload)
    },
    addReceivedGreeting: (state, action: PayloadAction<Greeting>) => {
      state.receivedGreetings.unshift(action.payload)
    },
    markGreetingAsRead: (state, action: PayloadAction<string>) => {
      const greeting = state.receivedGreetings.find(g => g.id === action.payload)
      if (greeting) {
        greeting.isRead = true
      }
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
  setSentGreetings,
  setReceivedGreetings,
  addSentGreeting,
  addReceivedGreeting,
  markGreetingAsRead,
  setError,
  clearError,
} = greetingsSlice.actions

export default greetingsSlice.reducer 