import { createContext, useState, useContext, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  // Ride bookings - load from localStorage
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('userBookings')
    if (savedBookings) {
      return JSON.parse(savedBookings)
    }
    return [
      {
        id: 1,
        driverId: 'driver1',
        driverName: 'Sarah Johnson',
        from: 'Downtown',
        to: 'Airport',
        date: '2025-11-15',
        time: '08:00',
        passengers: 2,
        fare: 1500,
        status: 'confirmed',
      },
    ]
  })

  // Live rides - load from localStorage
  const [liveRides, setLiveRides] = useState(() => {
    const savedLiveRides = localStorage.getItem('liveRides')
    return savedLiveRides ? JSON.parse(savedLiveRides) : []
  })

  // Messages - load from localStorage
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('userMessages')
    if (savedMessages) {
      return JSON.parse(savedMessages)
    }
    return {
      personalChats: [
        { id: 1, userId: 'user1', name: 'Alex Smith', avatar: '👤', lastMessage: 'See you tomorrow!', timestamp: '2 hours ago' },
        { id: 2, userId: 'user2', name: 'Emma Wilson', avatar: '👤', lastMessage: 'Thanks for the ride!', timestamp: '5 hours ago' },
      ],
      communityChatList: [
        { id: 1, communityId: 'comm1', name: 'Downtown Riders', avatar: '👥', lastMessage: 'Anyone going to the mall?', timestamp: '1 hour ago' },
      ],
    }
  })

  // Friends - load from localStorage
  const [friends, setFriends] = useState(() => {
    const savedFriends = localStorage.getItem('userFriends')
    if (savedFriends) {
      return JSON.parse(savedFriends)
    }
    return [
      { id: 1, name: 'Alex Smith', status: 'online', rating: 4.9, rides: 45, avatar: '👤' },
      { id: 2, name: 'Emma Wilson', status: 'offline', rating: 4.7, rides: 32, avatar: '👤' },
      { id: 3, name: 'Michael Brown', status: 'online', rating: 4.8, rides: 28, avatar: '👤' },
    ]
  })

  // Communities - load from localStorage
  const [communities, setCommunities] = useState(() => {
    const savedCommunities = localStorage.getItem('communities')
    if (savedCommunities) {
      return JSON.parse(savedCommunities)
    }
    return [
      { id: 1, name: 'Downtown Riders', category: 'Location', members: 342, icon: '📍' },
      { id: 2, name: 'Morning Commute', category: 'Schedule', members: 156, icon: '🌅' },
      { id: 3, name: 'Weekend Trips', category: 'Activity', members: 89, icon: '🚗' },
    ]
  })

  // Joined communities - load from localStorage
  const [joinedCommunities, setJoinedCommunities] = useState(() => {
    const savedJoined = localStorage.getItem('joinedCommunities')
    return savedJoined ? JSON.parse(savedJoined) : []
  })

  // Save bookings to localStorage
  useEffect(() => {
    localStorage.setItem('userBookings', JSON.stringify(bookings))
  }, [bookings])

  // Save live rides to localStorage
  useEffect(() => {
    localStorage.setItem('liveRides', JSON.stringify(liveRides))
  }, [liveRides])

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('userMessages', JSON.stringify(messages))
  }, [messages])

  // Save friends to localStorage
  useEffect(() => {
    localStorage.setItem('userFriends', JSON.stringify(friends))
  }, [friends])

  // Save communities to localStorage
  useEffect(() => {
    localStorage.setItem('communities', JSON.stringify(communities))
  }, [communities])

  // Save joined communities to localStorage
  useEffect(() => {
    localStorage.setItem('joinedCommunities', JSON.stringify(joinedCommunities))
  }, [joinedCommunities])

  // Add booking
  const addBooking = (booking) => {
    setBookings(prev => [...prev, { ...booking, id: prev.length + 1 }])
  }

  // Update booking status
  const updateBookingStatus = (bookingId, status) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    )
  }

  // Add message
  const addMessage = (chatType, chatId, message) => {
    // This would be expanded to actually store messages
    console.log(`Message sent to ${chatType} chat ${chatId}:`, message)
  }

  // Add friend
  const addFriend = (friend) => {
    setFriends(prev => [...prev, { ...friend, id: prev.length + 1 }])
  }

  // Remove friend
  const removeFriend = (friendId) => {
    setFriends(prev => prev.filter(f => f.id !== friendId))
  }

  // Join community
  const joinCommunity = (communityId) => {
    setJoinedCommunities(prev => [...prev, communityId])
  }

  // Leave community
  const leaveCommunity = (communityId) => {
    setJoinedCommunities(prev => prev.filter(id => id !== communityId))
  }

  // Add a ride to liveRides
  const addRide = (ride) => {
    setLiveRides(prev => [...prev, ride])
  }

  const value = {
    bookings,
    addBooking,
    updateBookingStatus,
    liveRides,
    setLiveRides,
    addRide,
    messages,
    addMessage,
    friends,
    addFriend,
    removeFriend,
    communities,
    joinedCommunities,
    joinCommunity,
    leaveCommunity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
