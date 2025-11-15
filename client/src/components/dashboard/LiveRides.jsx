import { useState, useEffect } from 'react'
import chairIcon from '../../assets/icons8-spectators-on-seats-50.png'
import MapLibreMap from '../MapLibreMap'
import ConfirmationDialog from '../ConfirmationDialog'

export default function LiveRides() {
  const [rides, setRides] = useState([])
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const cities = ['City A', 'City B', 'City C', 'City D', 'City E']
      const from = cities[Math.floor(Math.random() * cities.length)]
      let to
      do { to = cities[Math.floor(Math.random() * cities.length)] } while (to === from)
      const seats = Math.floor(Math.random() * 4) + 1
      
      setRides(prev => [
        { from, to, seats, id: Date.now() },
        ...prev
      ].slice(0, 10))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleBookClick = (ride) => {
    setSelectedRide(ride)
    setShowBookDialog(true)
  }

  const confirmBookRide = () => {
    setIsBooking(true)
    setTimeout(() => {
      setIsBooking(false)
      setShowBookDialog(false)
      alert(`Ride booked from ${selectedRide.from} to ${selectedRide.to}!`)
      setSelectedRide(null)
    }, 1000)
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2"> Live Ride Feed</h1>
      </div>

      {/* Map View - Shows all active rides */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg" style={{ height: '450px' }}>
        <MapLibreMap
          startLocation={[77.5946, 12.9716]} // Bangalore center
          endLocation={[77.7099, 13.1939]}   // Bangalore airport
          showRoute={true}
          zoom={12}
          markers={rides.map(ride => ({
            title: `${ride.from} → ${ride.to}`,
            description: `${ride.seats} seats available`,
            latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
            longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rides.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">Waiting for live rides...</p>
          </div>
        ) : (
          rides.map(ride => (
            <div 
              key={ride.id} 
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-5 hover:border-green-400/60 transition-all hover:shadow-lg hover:shadow-green-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{ride.from}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <span>→</span> {ride.to}
                  </p>
                </div>
                <div className="text-center">
                  <span className="bg-green-500/20 border border-green-400 text-green-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit">
                    {ride.seats} <img src={chairIcon} alt="Seats" className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <button onClick={() => handleBookClick(ride)} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmationDialog
        isOpen={showBookDialog}
        title="Confirm Ride Booking"
        message={selectedRide ? `Book a ride from ${selectedRide.from} to ${selectedRide.to} with ${selectedRide.seats} available seat(s)?` : ''}
        confirmText="Confirm Booking"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isBooking}
        onConfirm={confirmBookRide}
        onCancel={() => setShowBookDialog(false)}
      />
    </section>
  )
}
