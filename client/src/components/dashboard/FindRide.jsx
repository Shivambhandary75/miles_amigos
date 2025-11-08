import searchIcon from '../../assets/icons8-search-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'

export default function FindRide() {
  const mockRides = [
    { from: 'Downtown', to: 'Airport', seats: 3, price: '₹450', driver: 'John', rating: 4.8 },
    { from: 'Mall', to: 'Station', seats: 2, price: '₹120', driver: 'Sarah', rating: 4.9 },
    { from: 'Office', to: 'Gym', seats: 1, price: '₹80', driver: 'Mike', rating: 4.7 },
  ]

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
           Find a Ride
        </h1>
        <p className="text-gray-400">Search and book available rides</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 mb-8 max-w-2xl">
        <form className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">From</label>
              <input 
                type="text" 
                placeholder="Enter pickup location" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3">To</label>
              <input 
                type="text" 
                placeholder="Enter destination" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3">Passengers</label>
              <input 
                type="number" 
                min="1" 
                max="7"
                placeholder="1-7 passengers" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
              />
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/50 flex items-center justify-center gap-2">
            <img src={searchIcon} alt="Search" className="w-5 h-5" /> Search Rides
          </button>
        </form>
      </div>

      {/* Rides List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Rides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRides.map((ride, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 hover:border-blue-500/30 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-bold text-white">{ride.from} → {ride.to}</p>
                  <p className="text-gray-400 text-sm">Driver: {ride.driver}</p>
                </div>
                <span className="text-2xl flex items-center gap-1">
                  <img src={ratingIcon} alt="Rating" className="w-6 h-6" /> {ride.rating}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-white/10">
                <div className="flex gap-4">
                  <span className="text-green-400 font-bold">{ride.price}</span>
                  <span className="text-gray-400">{ride.seats} seats</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
