import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import friendsReducer from './friendsSlice'
import greetingsReducer from './greetingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    friends: friendsReducer,
    greetings: greetingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 