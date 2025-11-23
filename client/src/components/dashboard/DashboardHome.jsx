import { useState, useEffect } from 'react'
import carIcon from '../../assets/icons8-car-50.png'
import searchIcon from '../../assets/icons8-search-50.png'
import liveIcon from '../../assets/icons8-live-50.png'
import messagesIcon from '../../assets/icons8-messages-50.png'
import mapIcon from '../../assets/icons8-map-50.png'
import wallet from "../../assets/icons8-rupee-50.png"
import safetyIcon from '../../assets/icons8-safety-50.png'
import siren from '../../assets/icons8-siren-50.png'
import api from '../../utils/api'

export default function DashboardHome({ onNavigate }) {
  const [stats, setStats] = useState([
    { icon: carIcon, label: 'Rides Offered', value: '0', color: 'from-green-500 to-green-600' },
    { icon: searchIcon, label: 'Rides Taken', value: '0', color: 'from-green-500 to-green-600' },
    { icon: wallet, label: 'Earnings', value: '00.00', color: 'from-green-500 to-green-600' },
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/stats')
        if (response.data.success) {
          const { ridesOffered, ridesTaken, totalEarnings } = response.data.stats
          setStats([
            { icon: carIcon, label: 'Rides Offered', value: String(ridesOffered), color: 'from-green-500 to-green-600' },
            { icon: searchIcon, label: 'Rides Taken', value: String(ridesTaken), color: 'from-green-500 to-green-600' },
            { icon: wallet, label: 'Earnings', value: `₹${totalEarnings}`, color: 'from-green-500 to-green-600' },
          ])
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
        // Keep loading placeholders on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${stat.color} p-6 md:p-8 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">{stat.label}</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              </div>
              <img src={stat.icon} alt={stat.label} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => onNavigate && onNavigate('offerRide')} className="bg-gradient-to-br from-green-500 to-green-600 text-white py-4 px-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
              <img src={carIcon} alt="Offer Ride" className="w-5 h-5" /> Offer Ride
            </button>
            <button onClick={() => onNavigate && onNavigate('findRide')} className="bg-gradient-to-br from-green-500 to-green-600 text-white py-4 px-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
              <img src={searchIcon} alt="Find Ride" className="w-5 h-5" /> Find Ride
            </button>
            <button onClick={() => onNavigate && onNavigate('map')} className="bg-gradient-to-br from-green-500 to-green-600 text-white py-4 px-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
              <img src={mapIcon} alt="Live Map" className="w-5 h-5" /> Live Map
            </button>
            <button onClick={() => onNavigate && onNavigate('reportSafety')} className="bg-gradient-to-br from-red-500 to-red-600 text-white py-4 px-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
              <img src={siren} alt="Emergency" className="w-5 h-5" />  Emergency
            </button>
          </div>
        </div>


      </div>
    </section>
  )
}
