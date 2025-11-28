import React, { useState, useEffect } from 'react'

// Simple error boundary for ride grid
function RideGridErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-6 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong rendering your rides.</h2>
        <p>{error.message}</p>
        <p className="text-sm mt-2">Try refreshing the page or check your ride data.</p>
      </div>
    );
  }
  return (
    <ErrorCatcher setError={setError}>{children}</ErrorCatcher>
  );
}

class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    if (this.props.setError) this.props.setError(error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
import api from '../../utils/api'
import info from '../../assets/icons8-info-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import MapLibreMap from '../MapLibreMap'

export default function RideHistory() {
  const [filter, setFilter] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')

  const [rides, setRides] = useState([])
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/rides/history')
        setRides(res.data.rides || [])
      } catch (err) {
        console.error('Error fetching ride history:', err)
      }
    }
    fetchHistory()
  }, [])

  const filteredRides = filter === 'all'
    ? rides
    : rides.filter(r => r.status === filter)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 border-green-500/30 text-green-400'
      case 'cancelled': return 'bg-red-500/10 border-red-500/30 text-red-400'
      default: return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓'
      case 'cancelled': return '✗'
      default: return '⏳'
    }
  }

  const getRoleColor = (role) => {
    return role === 'driver'
      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
  }

  const getRoleLabel = (role) => {
    return role === 'driver' ? 'Driver' : 'Passenger'
  }

  const handleViewDetails = (ride) => {
    setSelectedRide(ride)
    setShowDetailsModal(true)
  }

  const [passengersToRate, setPassengersToRate] = useState([])
  const [selectedPassengerId, setSelectedPassengerId] = useState(null)

  const handleRateClick = (ride) => {
    setSelectedRide(ride)
    setUserRating(0)
    setRatingComment('')
    setSelectedPassengerId(null)

    if (ride.role === 'driver') {
      // Filter passengers that are accepted
      const acceptedPassengers = ride.passengers.filter(p => p.status === 'accepted');
      setPassengersToRate(acceptedPassengers);
      if (acceptedPassengers.length === 0) {
        alert("No accepted passengers to rate.");
        return;
      }
    }

    setShowRatingModal(true)
  }

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      if (selectedRide.role === 'passenger') {
        // Passenger rating driver
        await api.post(`/rides/${selectedRide._id || selectedRide.id}/rate`, {
          rating: userRating,
          comment: ratingComment
        })

        // Add driver as friend if they're not already
        if (selectedRide.driver) {
          try {
            await api.post('/users/add-friend', {
              friendId: selectedRide.driver.id
            })
            console.log('Driver added as friend')
          } catch (err) {
            console.log('Could not add driver as friend:', err)
          }
        }
        alert(`Ride rated ${userRating} stars!\nDriver added to your friends list.`)
      } else {
        // Driver rating passenger
        if (!selectedPassengerId) {
          alert("Please select a passenger to rate.");
          return;
        }
        await api.post(`/rides/${selectedRide._id || selectedRide.id}/rate-passenger/${selectedPassengerId}`, {
          rating: userRating
        })
        alert(`Passenger rated ${userRating} stars!`)
      }

      setShowRatingModal(false)
      setSelectedRide(null)
      setUserRating(0)
      setRatingComment('')
      setSelectedPassengerId(null)
    } catch (err) {
      console.error('Error submitting rating:', err)
      alert('Failed to submit rating: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Ride History
        </h1>
        <p className="text-gray-400">View all your past and upcoming rides</p>
      </div>

      {/* Filter */}
      <div className="mb-8 flex gap-3 flex-wrap">
        {['all', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${filter === f
                ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Map View of Selected Ride */}
      {selectedRide && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg" style={{ height: '400px' }}>
          <MapLibreMap
            startLocation={[selectedRide.from.lng, selectedRide.from.lat]}
            endLocation={[selectedRide.to.lng, selectedRide.to.lat]}
            showRoute={true}
            zoom={12}
          />
        </div>
      )}

      {/* Rides Grid with Error Boundary */}
      <RideGridErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRides.map(ride => {
            // Safe fallbacks for all ride properties
            // If from/to are objects (e.g., {name, lat, lng}), use their name or stringify
            let from = ride?.from || 'Unknown';
            let to = ride?.to || 'Unknown';
            if (typeof from === 'object' && from !== null) {
              from = from.name || JSON.stringify(from);
            }
            if (typeof to === 'object' && to !== null) {
              to = to.name || JSON.stringify(to);
            }
            const date = ride?.date || 'N/A';
            const time = ride?.time || 'N/A';
            const status = ride?.status || 'pending';
            const role = ride?.role || 'passenger';
            const driver = ride?.driver?.name || 'Unknown';
            const rating = ride?.driver?.rating ?? 'N/A';
            const seats = typeof ride?.seats === 'number' ? ride.seats : 'N/A';
            const fare = ride?.fare || 'N/A'; // Fare can be a string like '₹100'
            const id = ride?.id || ride?._id || Math.random();

            return (
              <div
                key={id}
                className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition group"
              >
                {/* Header with status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">
                      {from} → {to}
                    </h4>
                    <p className="text-sm text-gray-400">{date} at {time}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
                      {getStatusIcon(status)} {status}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRoleColor(role)}`}>
                      {getRoleLabel(role)}
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="bg-white/5 p-3 rounded-lg mb-4">
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-white font-semibold">{driver}</span> ·
                    <img src={ratingIcon} alt="Rating" className="w-4 h-4" /> {rating}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Seats</p>
                    <p className="text-white font-bold">{seats}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Fare</p>
                    <p className="text-white font-bold">{fare}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p className="text-white font-bold text-sm capitalize">{status}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(ride)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <img src={info} alt="Details" className="w-4 h-4" /> Details
                  </button>
                  {status === 'completed' && (
                    <button
                      onClick={() => handleRateClick(ride)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <img src={ratingIcon} alt="Rate" className="w-4 h-4" /> {role === 'driver' ? 'Rate Pax' : 'Rate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </RideGridErrorBoundary>

      {filteredRides.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">No rides found</p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition flex items-center justify-center gap-2">
            <img src={ratingIcon} alt="Ride" className="w-5 h-5" /> Book a Ride
          </button>
        </div>
      )}

      {/* Ride Details Modal */}
      {showDetailsModal && selectedRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Ride Details</h2>

            <div className="space-y-4">
              {/* Route */}
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-xs mb-2">Route</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-500 text-xs">From</p>
                    <p className="text-white font-semibold">{selectedRide.from.name}</p>
                  </div>
                  <div className="text-green-400 text-center">↓</div>
                  <div>
                    <p className="text-gray-500 text-xs">To</p>
                    <p className="text-white font-semibold">{selectedRide.to.name}</p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Date</p>
                  <p className="text-white font-semibold text-sm">{selectedRide.date}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Time</p>
                  <p className="text-white font-semibold text-sm">{selectedRide.time}</p>
                </div>
              </div>

              {/* Driver/Passenger Info */}
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-xs mb-2">Driver</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  {selectedRide.driver.name}
                  <img src={ratingIcon} alt="Rating" className="w-4 h-4" />
                  {selectedRide.driver.rating}
                </p>
              </div>

              {/* Fare & Seats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Fare</p>
                  <p className="text-white font-semibold">{selectedRide.fare}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Seats</p>
                  <p className="text-white font-semibold">{selectedRide.seats}</p>
                </div>
              </div>

              {/* Status & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <p className={`text-sm font-semibold capitalize ${selectedRide.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedRide.status}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <p className="text-gray-400 text-xs mb-1">Role</p>
                  <p className={`text-sm font-semibold ${selectedRide.role === 'driver' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {getRoleLabel(selectedRide.role)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedRide.role === 'driver' ? 'Rate Passenger' : 'Rate this Ride'}
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              {selectedRide.role === 'driver'
                ? 'Select a passenger to rate:'
                : `How was your experience with ${selectedRide.driver.name}?`
              }
            </p>

            {/* Passenger Selection for Driver */}
            {selectedRide.role === 'driver' && (
              <div className="mb-6 space-y-2">
                {passengersToRate.map(p => (
                  <button
                    key={p.user._id}
                    onClick={() => setSelectedPassengerId(p.user._id)}
                    className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition ${selectedPassengerId === p.user._id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                  >
                    <span>{p.user.name || 'Passenger'}</span>
                    {p.driverRating && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Rated: {p.driverRating}★</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Star Rating */}
            <div className="bg-white/5 p-6 rounded-lg mb-6 text-center">
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`text-4xl transition transform hover:scale-110 ${star <= userRating ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-white font-semibold">
                {userRating > 0 ? `${userRating} out of 5 stars` : 'Select a rating'}
              </p>
            </div>

            {/* Comment Section (Only for Passenger rating Driver for now) */}
            {selectedRide.role === 'passenger' && (
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Add a Comment (Optional)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows="3"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

