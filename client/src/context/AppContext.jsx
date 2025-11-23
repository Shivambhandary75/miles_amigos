import { createContext, useState, useContext, useEffect } from 'react'
import { api } from '../utils/api'

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

  // Last booked ride
  const [lastBookedRide, setLastBookedRide] = useState(null);

  // Messages - load from API
  const [messages, setMessages] = useState({
    personalChats: [],
    communityChatList: []
  })

  // Friends - load from API
  const [friends, setFriends] = useState([])

  // Communities - load from API
  const [communities, setCommunities] = useState([])

  // Joined communities - load from API
  const [joinedCommunities, setJoinedCommunities] = useState([])

  // Chat state for navigation
  const [currentChat, setCurrentChat] = useState(null)
  const [chatType, setChatType] = useState('personal') // 'personal' or 'community'

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Fetch friends
        // const friendsRes = await api.get('/users/friends');
        // setFriends(friendsRes.data);

        // Fetch communities
        const communitiesRes = await api.get('/communities');
        setCommunities(communitiesRes.data);

        // Fetch conversations
        const conversationsRes = await api.get('/messages/conversations');
        setMessages(prev => ({ ...prev, personalChats: conversationsRes.data }));

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  // Save bookings to localStorage
  useEffect(() => {
    localStorage.setItem('userBookings', JSON.stringify(bookings))
  }, [bookings])

  // Save live rides to localStorage
  useEffect(() => {
    localStorage.setItem('liveRides', JSON.stringify(liveRides))
  }, [liveRides])

  // Add booking
  const addBooking = (booking) => {
    setBookings(prev => [...prev, { ...booking, id: prev.length + 1 }])
    setLastBookedRide(booking); // Set the last booked ride
  }

  // Update booking status
  const updateBookingStatus = (bookingId, status) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    )
  }

  // Send message
  const addMessage = async (chatType, chatId, message) => {
    try {
      if (chatType === 'community') {
        await api.post(`/communities/${chatId}/messages`, { content: message });
        // Optimistically update or re-fetch would be better, but for now we rely on re-fetch in component
      } else {
        await api.post('/messages', { receiverId: chatId, content: message });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Add friend
  const addFriend = async (friendId) => {
    try {
      await api.post('/users/add-friend', { friendId });
      // Refresh friends list
      const res = await api.get('/users/friends');
      setFriends(res.data);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  }

  // Remove friend
  const removeFriend = async (friendId) => {
    try {
      await api.delete(`/users/friends/${friendId}`);
      setFriends(prev => prev.filter(f => f._id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }

  // Join community
  const joinCommunity = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      setJoinedCommunities(prev => [...prev, communityId]);
      // Refresh communities to update member count/status if needed
      const res = await api.get('/communities');
      setCommunities(res.data);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  }

  // Leave community
  const leaveCommunity = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/leave`);
      setJoinedCommunities(prev => prev.filter(id => id !== communityId));
      // Refresh communities
      const res = await api.get('/communities');
      setCommunities(res.data);
    } catch (error) {
      console.error('Error leaving community:', error);
    }
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
    lastBookedRide, // Export lastBookedRide
    setLastBookedRide, // Export setLastBookedRide
    messages,
    setMessages, // Export setMessages for manual updates
    addMessage,
    friends,
    addFriend,
    removeFriend,
    communities,
    joinedCommunities,
    joinCommunity,
    leaveCommunity,
    currentChat,
    setCurrentChat,
    chatType,
    setChatType,
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
