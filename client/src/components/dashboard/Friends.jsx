import { useState, useEffect } from 'react'
import api from '../../utils/api'
import friendsIcon from '../../assets/icons8-friends-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import carIcon from '../../assets/icons8-car-50.png'
import ConfirmationDialog from '../ConfirmationDialog'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    notes: '',
  })
  const [showBookingConfirm, setShowBookingConfirm] = useState(false)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users/friends')
      if (res.data && res.data.friends) {
        setFriends(res.data.friends)
      }
    } catch (err) {
      console.error('Error fetching friends:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (friend) => {
    setSelectedFriend(friend)
    setShowDeleteDialog(true)
  }

  const handleViewProfile = (friend) => {
    setSelectedFriend(friend)
    setShowProfileModal(true)
  }

  const handleBookRide = (friend) => {
    setSelectedFriend(friend)
    setBookingData({ from: '', to: '', date: '', time: '', notes: '' })
    setShowBookingModal(true)
  }

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({ ...prev, [name]: value }))
  }

  const handleConfirmBooking = () => {
    if (!bookingData.from || !bookingData.to || !bookingData.date) {
      alert('Please fill in all required fields')
      return
    }
    setShowBookingConfirm(true)
  }

  const confirmRideBooking = () => {
    setShowBookingConfirm(false)
    setShowBookingModal(false)
    alert(`Ride booked with ${selectedFriend.name}!\nFrom: ${bookingData.from}\nTo: ${bookingData.to}`)
    setSelectedFriend(null)
  }

  const confirmDeleteFriend = async () => {
    if (!selectedFriend) return;
    try {
      await api.delete(`/users/friends/${selectedFriend._id || selectedFriend.id}`);
      setFriends(friends.filter(f => (f._id || f.id) !== (selectedFriend._id || selectedFriend.id)));
      setShowDeleteDialog(false);
      alert(`${selectedFriend.name} has been removed from your friends`);
      setSelectedFriend(null);
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('Failed to remove friend.');
    }
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Friends
        </h1>
        <p className="text-gray-400">Connect with your ride-sharing friends</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading friends...</div>
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-gray-400 mb-4">No friends yet</div>
          <p className="text-gray-500 text-sm">Complete rides and rate your drivers to build your friends list!</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <div key={friend._id || friend.id} className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition">
            <div className="flex items-center gap-4 mb-4">
              <img src={friend.avatar || profileIcon} alt={friend.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-white font-bold">{friend.name}</p>
                <p className="text-sm text-gray-400">Driver</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-400 mb-1">
                  <img src={ratingIcon} alt="Rating" className="w-5 h-5" /> {(friend.rating || 0).toFixed(1)}
                </div>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-400 mb-1">
                  <img src={carIcon} alt="Rides" className="w-5 h-5" /> {friend.rides || 0}
                </div>
                <p className="text-xs text-gray-400">Rides</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                Message
              </button>
              <button 
                onClick={() => handleBookRide(friend)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
              >
                Book Ride
              </button>
              <button 
                onClick={() => handleViewProfile(friend)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition"
              >
                Profile
              </button>
              <button 
                onClick={() => handleDeleteClick(friend)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Delete Friend Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Friend"
        message={selectedFriend ? `Are you sure you want to remove ${selectedFriend.name} from your friends? You can add them again later.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDeleteFriend}
        onCancel={() => {
          setShowDeleteDialog(false)
          setSelectedFriend(null)
        }}
      />

      {/* Book Ride Modal */}
      {showBookingModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Book Ride with {selectedFriend.name}</h2>
            <p className="text-gray-400 text-sm mb-6">⭐ {selectedFriend.rating} • {selectedFriend.rides} rides</p>

            <div className="space-y-4">
              {/* From Location */}
              <div>
                <label className="block text-white font-semibold mb-2">From</label>
                <input
                  type="text"
                  name="from"
                  value={bookingData.from}
                  onChange={handleBookingInputChange}
                  placeholder="Enter pickup location"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* To Location */}
              <div>
                <label className="block text-white font-semibold mb-2">To</label>
                <input
                  type="text"
                  name="to"
                  value={bookingData.to}
                  onChange={handleBookingInputChange}
                  placeholder="Enter destination"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-white font-semibold mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleBookingInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-white font-semibold mb-2">Preferred Time</label>
                <input
                  type="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleBookingInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white font-semibold mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingInputChange}
                  placeholder="Any special requests or notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none h-20"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Request Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBookingConfirm}
        title="Confirm Ride Booking"
        message={selectedFriend ? `Book a ride with ${selectedFriend.name}?\n\nFrom: ${bookingData.from}\nTo: ${bookingData.to}\nDate: ${bookingData.date}` : ''}
        confirmText="Confirm Booking"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmRideBooking}
        onCancel={() => setShowBookingConfirm(false)}
      />

      {/* View Profile Modal */}
      {showProfileModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
              <h2 className="text-2xl font-bold text-white">{selectedFriend.name}</h2>
              <p className="text-green-400 font-medium">{selectedFriend.status}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-white/5 p-4 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-yellow-400 mb-1">
                  <img src={ratingIcon} alt="Rating" className="w-4 h-4" /> {selectedFriend.rating}
                </div>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-400 mb-1">
                  <img src={carIcon} alt="Rides" className="w-4 h-4" /> {selectedFriend.rides}
                </div>
                <p className="text-xs text-gray-400">Rides</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Member Since</p>
                <p className="text-white font-semibold">January 2024</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Preferred Time</p>
                <p className="text-white font-semibold">Morning - 7AM to 10AM</p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
