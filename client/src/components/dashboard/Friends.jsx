import friendsIcon from '../../assets/icons8-friends-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import carIcon from '../../assets/icons8-car-50.png'

export default function Friends() {
  const friends = [
    { name: 'Alice Johnson', rating: 4.9, rides: 23, status: 'Online', avatar: profileIcon },
    { name: 'Bob Smith', rating: 4.7, rides: 18, status: 'Offline', avatar: profileIcon },
    { name: 'Carol Davis', rating: 4.8, rides: 31, status: 'Online', avatar: profileIcon },
    { name: 'David Wilson', rating: 4.6, rides: 12, status: 'Away', avatar: profileIcon },
  ]

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Friends
        </h1>
        <p className="text-gray-400">Connect with your ride-sharing friends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition">
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
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
