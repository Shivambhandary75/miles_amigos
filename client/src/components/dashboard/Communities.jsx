import communityIcon from '../../assets/icons8-community-50.png'
import carIcon from '../../assets/icons8-car-50.png'

export default function Communities() {
  const communities = [
    { name: 'City B Carpoolers', members: 1240, icon: communityIcon, category: 'Location Based' },
    { name: 'Weekend Riders', members: 856, icon: communityIcon, category: 'Activity' },
    { name: 'Eco Warriors', members: 542, icon: communityIcon, category: 'Eco Friendly' },
    { name: 'Office Commute', members: 634, icon: communityIcon, category: 'Commute' },
  ]

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
           Communities
        </h1>
        <p className="text-gray-400">Join groups and connect with like-minded riders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {communities.map((community, idx) => (
          <div key={idx} className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-green-400/30 rounded-2xl p-6 hover:border-green-400/60 transition">
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
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Community */}
      <div className="mt-8 bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 text-center">
        <p className="text-white font-semibold mb-4">Want to create your own community?</p>
        <button className="bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-600 text-white px-8 py-3 rounded-lg font-bold transition-all hover:shadow-lg">
          Create Community
        </button>
      </div>
    </section>
  )
}
