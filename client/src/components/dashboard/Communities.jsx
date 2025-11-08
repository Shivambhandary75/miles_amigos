import { useState } from 'react'
import communityIcon from '../../assets/icons8-community-50.png'
import carIcon from '../../assets/icons8-car-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import ConfirmationDialog from '../ConfirmationDialog'

export default function Communities() {
  const [joinedCommunities, setJoinedCommunities] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showMemberProfileModal, setShowMemberProfileModal] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [newCommunityData, setNewCommunityData] = useState({
    name: '',
    category: '',
    selectedFriends: [],
  })

  const allFriends = [
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Carol Davis' },
    { id: 4, name: 'David Wilson' },
    { id: 5, name: 'Emma Brown' },
    { id: 6, name: 'Frank Miller' },
  ]

  const communityMembers = [
    { id: 1, name: 'Alice Johnson', rating: 4.9, rides: 23, avatar: profileIcon, role: 'Admin' },
    { id: 2, name: 'Bob Smith', rating: 4.7, rides: 18, avatar: profileIcon, role: 'Member' },
    { id: 3, name: 'Carol Davis', rating: 4.8, rides: 31, avatar: profileIcon, role: 'Member' },
    { id: 4, name: 'David Wilson', rating: 4.6, rides: 12, avatar: profileIcon, role: 'Member' },
    { id: 5, name: 'Emma Brown', rating: 4.9, rides: 27, avatar: profileIcon, role: 'Moderator' },
  ]

  const communities = [
    { id: 1, name: 'City B Carpoolers', members: 1240, icon: communityIcon, category: 'Location Based' },
    { id: 2, name: 'Weekend Riders', members: 856, icon: communityIcon, category: 'Activity' },
    { id: 3, name: 'Eco Warriors', members: 542, icon: communityIcon, category: 'Eco Friendly' },
    { id: 4, name: 'Office Commute', members: 634, icon: communityIcon, category: 'Commute' },
  ]

  const isJoinedCommunity = (communityId) => joinedCommunities.includes(communityId)

  const handleLeaveCommunity = (community) => {
    setSelectedCommunity(community)
    setShowLeaveDialog(true)
  }

  const confirmLeaveCommunity = () => {
    setJoinedCommunities(joinedCommunities.filter(id => id !== selectedCommunity.id))
    setShowLeaveDialog(false)
    setSelectedCommunity(null)
    alert(`Left ${selectedCommunity.name}`)
  }

  const handleCreateCommunity = () => {
    setShowCreateModal(true)
  }

  const handleViewMembers = (community) => {
    setSelectedCommunity(community)
    setShowMembersModal(true)
  }

  const handleViewMemberProfile = (member) => {
    setSelectedMember(member)
    setShowMemberProfileModal(true)
  }

  const handleAddFriendToCommunity = (friendId) => {
    setNewCommunityData(prev => ({
      ...prev,
      selectedFriends: prev.selectedFriends.includes(friendId)
        ? prev.selectedFriends.filter(id => id !== friendId)
        : [...prev.selectedFriends, friendId]
    }))
  }

  const handleCreateCommunitySubmit = () => {
    if (!newCommunityData.name.trim()) {
      alert('Please enter a community name')
      return
    }
    if (newCommunityData.selectedFriends.length === 0) {
      alert('Please select at least one friend to add')
      return
    }
    
    const newCommunity = {
      id: Math.max(...communities.map(c => c.id), 0) + 1,
      name: newCommunityData.name,
      category: newCommunityData.category || 'Custom',
      members: newCommunityData.selectedFriends.length + 1,
      icon: communityIcon,
    }
    
    alert(`Community "${newCommunityData.name}" created with ${newCommunityData.selectedFriends.length} member(s)!`)
    setJoinedCommunities([...joinedCommunities, newCommunity.id])
    
    setNewCommunityData({
      name: '',
      category: '',
      selectedFriends: [],
    })
    setShowCreateModal(false)
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
           Communities
        </h1>
        <p className="text-gray-400">Join groups and connect with like-minded riders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {communities.map((community) => (
          <div key={community.id} className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-green-400/30 rounded-2xl p-6 hover:border-green-400/60 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img src={community.icon} alt={community.name} className="w-16 h-16 object-contain" />
                <div>
                  <p className="text-white font-bold text-lg">{community.name}</p>
                  <p className="text-orange-300 text-sm font-medium">{community.category}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-white/10">
              <p className="text-gray-400">
                <span className="text-white font-bold text-lg">{community.members}</span> members
              </p>
              <div className="flex gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                  💬 Message
                </button>
                <button 
                  onClick={() => handleViewMembers(community)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Members
                </button>
                <button 
                  onClick={() => handleLeaveCommunity(community)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Community */}
      <div className="mt-8 bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 text-center">
        <p className="text-white font-semibold mb-4">Want to create your own community?</p>
        <button 
          onClick={handleCreateCommunity}
          className="bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-600 text-white px-8 py-3 rounded-lg font-bold transition-all hover:shadow-lg"
        >
          Create Community
        </button>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Community</h2>

            {/* Community Name */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Community Name</label>
              <input
                type="text"
                value={newCommunityData.name}
                onChange={(e) => setNewCommunityData({...newCommunityData, name: e.target.value})}
                placeholder="e.g., Weekend Bike Riders"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Category</label>
              <select
                value={newCommunityData.category}
                onChange={(e) => setNewCommunityData({...newCommunityData, category: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
              >
                <option value="">Select Category</option>
                <option value="Location Based">Location Based</option>
                <option value="Activity">Activity</option>
                <option value="Eco Friendly">Eco Friendly</option>
                <option value="Commute">Commute</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Add Friends */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">Add Friends to Community</label>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
                {allFriends.length === 0 ? (
                  <p className="text-gray-400 text-sm">No friends available</p>
                ) : (
                  allFriends.map(friend => (
                    <label key={friend.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={newCommunityData.selectedFriends.includes(friend.id)}
                        onChange={() => handleAddFriendToCommunity(friend.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-gray-300 text-sm">{friend.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {newCommunityData.selectedFriends.length} friend(s) selected
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewCommunityData({
                    name: '',
                    category: '',
                    selectedFriends: [],
                  })
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunitySubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Community Dialog */}
      <ConfirmationDialog
        isOpen={showLeaveDialog}
        title="Leave Community"
        message={selectedCommunity ? `Are you sure you want to leave "${selectedCommunity.name}"? You can rejoin anytime.` : ''}
        confirmText="Leave"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmLeaveCommunity}
        onCancel={() => {
          setShowLeaveDialog(false)
          setSelectedCommunity(null)
        }}
      />

      {/* View Members Modal */}
      {showMembersModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{selectedCommunity.name} - Members</h2>

            <div className="space-y-3">
              {communityMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{member.name}</p>
                      <p className="text-xs text-blue-400">{member.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewMemberProfile(member)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                  >
                    Profile
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMembersModal(false)}
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* View Member Profile Modal */}
      {showMemberProfileModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
              <h2 className="text-2xl font-bold text-white">{selectedMember.name}</h2>
              <p className="text-blue-400 font-medium text-sm">{selectedMember.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-white/5 p-4 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-yellow-400 mb-1">
                  <img src={ratingIcon} alt="Rating" className="w-4 h-4" /> {selectedMember.rating}
                </div>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-400 mb-1">
                  <img src={carIcon} alt="Rides" className="w-4 h-4" /> {selectedMember.rides}
                </div>
                <p className="text-xs text-gray-400">Rides</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Member Since</p>
                <p className="text-white font-semibold">March 2024</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Community Rides</p>
                <p className="text-white font-semibold">12 rides together</p>
              </div>
            </div>

            <button
              onClick={() => setShowMemberProfileModal(false)}
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

