import { useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import MapLibreMap from '../MapLibreMap'
import searchIcon from '../../assets/icons8-search-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'

export default function FindRide() {
  const mockRides = [
    { id: 1, from: 'Downtown', to: 'Airport', seats: 3, price: '₹450', driver: 'John', rating: 4.8 },
    { id: 2, from: 'Mall', to: 'Station', seats: 2, price: '₹120', driver: 'Sarah', rating: 4.9 },
    { id: 3, from: 'Office', to: 'Gym', seats: 1, price: '₹80', driver: 'Mike', rating: 4.7 },
  ]

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [notes, setNotes] = useState('')
  const [results, setResults] = useState(mockRides)
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [isBooking, setIsBooking] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    // Simple client-side filter (matches either from or to substrings)
    const qFrom = from.trim().toLowerCase()
    const qTo = to.trim().toLowerCase()
    const filtered = mockRides.filter(r => {
      const matchesFrom = !qFrom || r.from.toLowerCase().includes(qFrom)
      const matchesTo = !qTo || r.to.toLowerCase().includes(qTo)
      return matchesFrom && matchesTo
    })
    setResults(filtered)
    console.log('Searching rides with', { from, to, date, passengers, notes })
  }

  const handleBookClick = (ride) => {
    setSelectedRide(ride)
    setShowBookDialog(true)
  }

  const confirmBookRide = () => {
    setIsBooking(true)
    setTimeout(() => {
      setIsBooking(false)
      setShowBookDialog(false)
      console.log('Ride booked:', selectedRide)
      alert(`Booking confirmed with ${selectedRide.driver}!`)
      setSelectedRide(null)
    }, 1000)
  }

  return (
    <section>
      <ConfirmationDialog
        isOpen={showBookDialog}
        title="Confirm Booking"
        message={selectedRide ? `Book ride with ${selectedRide.driver} from ${selectedRide.from} to ${selectedRide.to} for ₹${selectedRide.price}?` : ''}
        confirmText="Book Now"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isBooking}
        onConfirm={confirmBookRide}
        onCancel={() => setShowBookDialog(false)}
      />
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Find a Ride</h1>
        <p className="text-gray-400">Search and book available rides</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Form - Left Side */}
        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
          <form className="flex flex-col gap-6" onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-3">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">To</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white font-semibold mb-3">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Passengers</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  placeholder="1-7 passengers"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes (e.g., luggage, stops)"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/50 flex items-center justify-center gap-2">
              <img src={searchIcon} alt="Search" className="w-5 h-5" /> Search Rides
            </button>
          </form>
        </div>

        {/* Map Sidebar - Right Side */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-white mb-4"> Route Preview</h3>
            
            <div className="rounded-lg overflow-hidden border border-white/10 mb-4" style={{ height: '400px' }}>
              <MapLibreMap
                startLocation={[77.5946, 12.9716]}
                endLocation={[77.7099, 13.1939]}
                showRoute={from && to}
                zoom={12}
              />
            </div>

            {/* Location Info */}
            {from && to && (
              <div className="bg-white/5 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <p className="text-white font-semibold text-sm">{from}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <p className="text-white font-semibold text-sm">{to}</p>
                </div>
                {date && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <p className="text-white font-semibold text-sm">{date}</p>
                  </div>
                )}
              </div>
            )}

            {!from && !to && (
              <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg">
                <p className="text-sm text-blue-300"> Enter pickup and destination above to see the route on the map.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Rides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((ride, idx) => (
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
                <button onClick={() => handleBookClick(ride)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Book</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
