import { useState } from 'react'
import mapIcon from '../../assets/icons8-map-50.png'
import carIcon from '../../assets/icons8-car-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import searchIcon from '../../assets/icons8-search-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import alarm from '../../assets/icons8-alarm-50.png'
import location from '../../assets/icons8-location-50.png';
export default function LiveMap() {
  const [currentRide, setCurrentRide] = useState({
    from: 'Downtown Station',
    to: 'Airport Terminal',
    driver: 'Sarah Johnson',
    status: 'On the way',
    progress: 65,
    rating: 4.8,
    eta: '12 min',
  })

  const nearbyRides = [
    { id: 1, from: 'Mall District', to: 'Beach Road', seats: 2, rating: 4.7, distance: '0.5 km away' },
    { id: 2, from: 'Tech Park', to: 'Downtown', seats: 1, rating: 4.9, distance: '1.2 km away' },
    { id: 3, from: 'Airport', to: 'City Center', seats: 3, rating: 4.5, distance: '0.8 km away' },
  ]

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Live Map
        </h1>
        <p className="text-gray-400">Track rides and discover nearby riders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 bg-white/5 h-[500px]">
            {/* Embedded Map */}
            <iframe 
              className="w-full h-full"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.02%2C40.70%2C-74.00%2C40.72&layer=mapnik"
              frameBorder="0"
              allowFullScreen
              style={{ filter: 'invert(0.93) hue-rotate(200deg)' }}
            />

            {/* Map Overlay - Current Ride */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="animate-pulse">
                <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
              </div>
            </div>

            {/* Current Ride Card */}
            <div className="absolute top-4 right-4 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/20 w-80 pointer-events-auto z-10">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <img src={carIcon} alt="Ride" className="w-5 h-5" /> Current Ride
              </h4>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="text-sm font-bold text-green-400">{currentRide.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
                    style={{ width: `${currentRide.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <img src={location} alt="From" className="w-4 h-4" /> From
                  </span>
                  <span className="text-white font-semibold text-sm">{currentRide.from}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <img src={location} alt="To" className="w-4 h-4" /> To
                  </span>
                  <span className="text-white font-semibold text-sm">{currentRide.to}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <img src={profileIcon} alt="Driver" className="w-4 h-4" /> Driver
                  </span>
                  <span className="text-white font-semibold text-sm">{currentRide.driver}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                    <img src={alarm} alt="ETA" className="w-4 h-4" /> ETA
                  </span>
                  <span className="text-green-400 font-bold text-sm">{currentRide.eta}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-lg font-semibold transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                Contact Driver
              </button>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-auto">
              <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg backdrop-blur-lg border border-white/20 transition">
                <img src={searchIcon} alt="Zoom" className="w-5 h-5" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg backdrop-blur-lg border border-white/20 transition">
                <img src={searchIcon} alt="Locate" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nearby Rides Sidebar */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <img src={carIcon} alt="Rides" className="w-5 h-5" /> Nearby Rides
          </h3>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
            {nearbyRides.map(ride => (
              <div 
                key={ride.id}
                className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                      {ride.from}
                    </p>
                    <p className="text-xs text-gray-500">to {ride.to}</p>
                  </div>
                  <span className="text-yellow-400 text-xs font-bold flex items-center gap-1">
                    <img src={ratingIcon} alt="Rating" className="w-4 h-4" /> {ride.rating}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{ride.distance}</span>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded flex items-center gap-1">
                    <span className="text-green-400 font-bold">{ride.seats}</span> seats
                  </span>
                </div>

                <button className="w-full mt-3 text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 py-2 rounded transition font-semibold">
                  Book
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Active Rides</p>
              <p className="text-2xl font-bold text-white">42</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                4.7 <img src={ratingIcon} alt="Rating" className="w-5 h-5" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
