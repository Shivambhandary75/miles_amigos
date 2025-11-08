import { useState } from 'react'
import friendsIcon from '../../assets/icons8-friends-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import carIcon from '../../assets/icons8-car-50.png'
import ConfirmationDialog from '../ConfirmationDialog'

export default function Friends() {
  const [friends, setFriends] = useState([
    { id: 1, name: 'Alice Johnson', rating: 4.9, rides: 23, status: 'Online', avatar: profileIcon },
    { id: 2, name: 'Bob Smith', rating: 4.7, rides: 18, status: 'Offline', avatar: profileIcon },
    { id: 3, name: 'Carol Davis', rating: 4.8, rides: 31, status: 'Online', avatar: profileIcon },
    { id: 4, name: 'David Wilson', rating: 4.6, rides: 12, status: 'Away', avatar: profileIcon },
  ])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)

  const handleDeleteClick = (friend) => {
    setSelectedFriend(friend)
    setShowDeleteDialog(true)
  }

  const handleViewProfile = (friend) => {
    setSelectedFriend(friend)
    setShowProfileModal(true)
  }

  const confirmDeleteFriend = () => {
    setFriends(friends.filter(f => f.id !== selectedFriend.id))
    setShowDeleteDialog(false)
    alert(`${selectedFriend.name} has been removed from your friends`)
    setSelectedFriend(null)
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Friends
        </h1>
        <p className="text-gray-400">Connect with your ride-sharing friends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <div key={friend.id} className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition">
            <div className="flex items-center gap-4 mb-4">
              <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-white font-bold">{friend.name}</p>
                <p className="text-sm text-gray-400">{friend.status}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-400 mb-1">
                  <img src={ratingIcon} alt="Rating" className="w-5 h-5" /> {friend.rating}
                </div>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-400 mb-1">
                  <img src={carIcon} alt="Rides" className="w-5 h-5" /> {friend.rides}
                </div>
                <p className="text-xs text-gray-400">Rides</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                Message
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition">
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
