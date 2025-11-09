import { createContext, useState, useContext } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  // Ride bookings
  const [bookings, setBookings] = useState([
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
  ])

  // Live rides
  const [liveRides, setLiveRides] = useState([])

  // Messages
  const [messages, setMessages] = useState({
    personalChats: [
      { id: 1, userId: 'user1', name: 'Alex Smith', avatar: '👤', lastMessage: 'See you tomorrow!', timestamp: '2 hours ago' },
      { id: 2, userId: 'user2', name: 'Emma Wilson', avatar: '👤', lastMessage: 'Thanks for the ride!', timestamp: '5 hours ago' },
    ],
    communityChatList: [
      { id: 1, communityId: 'comm1', name: 'Downtown Riders', avatar: '👥', lastMessage: 'Anyone going to the mall?', timestamp: '1 hour ago' },
    ],
  })

  // Friends
  const [friends, setFriends] = useState([
    { id: 1, name: 'Alex Smith', status: 'online', rating: 4.9, rides: 45, avatar: '👤' },
    { id: 2, name: 'Emma Wilson', status: 'offline', rating: 4.7, rides: 32, avatar: '👤' },
    { id: 3, name: 'Michael Brown', status: 'online', rating: 4.8, rides: 28, avatar: '👤' },
  ])

  // Communities
  const [communities, setCommunities] = useState([
    { id: 1, name: 'Downtown Riders', category: 'Location', members: 342, icon: '📍' },
    { id: 2, name: 'Morning Commute', category: 'Schedule', members: 156, icon: '🌅' },
    { id: 3, name: 'Weekend Trips', category: 'Activity', members: 89, icon: '🚗' },
  ])

  const [joinedCommunities, setJoinedCommunities] = useState([])

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

  const value = {
    bookings,
    addBooking,
    updateBookingStatus,
    liveRides,
    setLiveRides,
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
