import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { getUserGreetings, getUnreadGreetingsCount } from '@/services/firebase/greetings'
import { showGreetingNotification } from '@/services/notifications'

export const useGreetings = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const previousGreetings = useRef<string[]>([])

  useEffect(() => {
    if (!user?.uid) return

    console.log('Setting up greetings listener for user:', user.uid)

    // Listen for new greetings
    const unsubscribeGreetings = getUserGreetings(user.uid, (greetings) => {
      console.log('=== GREETINGS HOOK CALLBACK ===')
      console.log('Greetings received:', greetings.length)
      console.log('Previous greetings count:', previousGreetings.current.length)
      
      // Find new unread greetings that weren't in the previous list
      const currentGreetingIds = greetings.map(g => g.id)
      const newUnreadGreetings = greetings.filter(g => 
        !g.read && !previousGreetings.current.includes(g.id)
      )
      
      console.log('New unread greetings:', newUnreadGreetings.length)
      console.log('New greeting IDs:', newUnreadGreetings.map(g => g.id))
      
      // Show notification for new unread greetings
      newUnreadGreetings.forEach(greeting => {
        console.log('=== SHOWING NOTIFICATION ===')
        console.log('Greeting ID:', greeting.id)
        console.log('From username:', greeting.fromUsername)
        console.log('Message:', greeting.message)
        showGreetingNotification(greeting.fromUsername, greeting.message)
      })
      
      // Update previous greetings list
      previousGreetings.current = currentGreetingIds
      console.log('Updated previous greetings count:', previousGreetings.current.length)
    })

    // Listen for unread count
    const unsubscribeCount = getUnreadGreetingsCount(user.uid, (count) => {
      console.log('Unread greetings count:', count)
    })

    return () => {
      console.log('Cleaning up greetings listener')
      unsubscribeGreetings()
      unsubscribeCount()
    }
  }, [user?.uid])
} 