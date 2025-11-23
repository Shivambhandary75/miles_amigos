import { useState, useEffect } from 'react'
import api from '../../utils/api'
import ConfirmationDialog from '../ConfirmationDialog'

export default function UpcomingRides() {
  const [upcomingRides, setUpcomingRides] = useState([])
  const [acceptedRides, setAcceptedRides] = useState([])
  const [passengerRides, setPassengerRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRide, setSelectedRide] = useState(null)
  const [action, setAction] = useState(null) // 'accept', 'decline', 'start', or 'verify'
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUpcomingRides()
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchUpcomingRides, 30000)
    return () => clearInterval(intervalId)
  }, [])

  const fetchUpcomingRides = async () => {
    try {
      setLoading(true)
      const res = await api.get('/rides/requests')
      console.log('Fetched upcoming rides:', res.data)
      setUpcomingRides(res.data || [])
      
      // Also fetch user's rides to show accepted rides
      const historyRes = await api.get('/rides/history')
      console.log('🔍 Fetched history rides:', historyRes.data)
      if (historyRes.data && historyRes.data.rides) {
        console.log('📊 All rides:', historyRes.data.rides)
        // Find rides where user is driver and has accepted passengers
        const accepted = historyRes.data.rides.filter(ride => {
          const isDriver = ride.role === 'driver'
          const isScheduled = ride.status === 'scheduled'
          const hasAccepted = ride.passengers && ride.passengers.some(p => p.status === 'accepted')
          console.log(`📌 Ride: ${isDriver ? 'driver' : 'passenger'}, status=${ride.status}, hasAccepted=${hasAccepted}`, ride)
          return isDriver && isScheduled && hasAccepted
        })
        console.log('✅ Filtered accepted rides:', accepted)
        setAcceptedRides(accepted)

        // Find rides where user is passenger and has accepted the ride (status = 'scheduled' or 'in-progress')
        const passenger = historyRes.data.rides.filter(ride => {
          const isPassenger = ride.role === 'passenger'
          const isActive = ride.status === 'scheduled' || ride.status === 'in-progress'
          console.log(`👤 Passenger Ride: status=${ride.status}, active=${isActive}`, ride)
          return isPassenger && isActive
        })
        console.log('✅ Passenger rides:', passenger)
        setPassengerRides(passenger)
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching upcoming rides:', err)
      setError('Failed to load upcoming ride requests')
      setUpcomingRides([])
      setAcceptedRides([])
      setPassengerRides([])
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (ride, actionType) => {
    setSelectedRide(ride)
    setAction(actionType)
    setConfirmDialog(true)
  }

  const confirmAction = async () => {
    if (!selectedRide || !action) return

    setActionLoading(true)
    try {
      if (action === 'accept') {
        const rideId = selectedRide.rideId || selectedRide.id
        const passengerId = selectedRide.passengerId
        console.log(`Accepting: ride=${rideId}, passenger=${passengerId}`)
        await api.put(
          `/rides/${rideId}/requests/${passengerId}/accept`
        )
      } else if (action === 'decline') {
        const rideId = selectedRide.rideId || selectedRide.id
        const passengerId = selectedRide.passengerId
        await api.put(
          `/rides/${rideId}/requests/${passengerId}/reject`
        )
      } else if (action === 'start') {
        const rideId = selectedRide.rideId || selectedRide.id
        console.log(`Starting ride: ${rideId}`)
        await api.post(`/rides/${rideId}/start`)
      } else if (action === 'verify') {
        // Passenger verifying the ride (confirming they are ready for the ride)
        const rideId = selectedRide._id
        console.log(`Verifying passenger ride: ${rideId}`)
        // This is just a confirmation that passenger is ready, could add a status to track this
        alert('Ride verified! You are ready for this ride.')
      }
      
      setConfirmDialog(false)
      setSelectedRide(null)
      setAction(null)
      setError(null)
      
      // Remove the ride from the list immediately (optimistic update)
      setUpcomingRides(prevRides => 
        prevRides.filter(ride => !(ride.rideId === selectedRide.rideId && ride.passengerId === selectedRide.passengerId))
      )
      
      // Then refresh to ensure data is in sync
      setTimeout(() => {
        fetchUpcomingRides()
      }, 500)
    } catch (err) {
      console.error(`Error ${action}ing request:`, err)
      console.error('Error details:', err.response?.data)
      setError(`Failed to ${action} ride request: ${err.response?.data?.message || err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartRide = (ride) => {
    setSelectedRide(ride)
    setAction('start')
    setConfirmDialog(true)
  }

  const handleVerifyPassengerRide = (ride) => {
    setSelectedRide(ride)
    setAction('verify')
    setConfirmDialog(true)
  }



  return (
    <div className="space-y-4">
      <ConfirmationDialog
        isOpen={confirmDialog}
        title={
          action === 'accept' ? 'Accept Ride Request' : 
          action === 'decline' ? 'Decline Ride Request' :
          action === 'start' ? 'Start Ride' :
          'Verify Ride'
        }
        message={
          action === 'accept'
            ? `Accept ride request from ${selectedRide?.passengerName}?`
            : action === 'decline'
            ? `Decline ride request from ${selectedRide?.passengerName}?`
            : action === 'start'
            ? `Start your ride? This will notify all accepted passengers.`
            : `Confirm you are ready for this ride from ${selectedRide?.driver?.name || 'Driver'}?`
        }
        confirmText={action === 'accept' ? 'Accept' : action === 'decline' ? 'Decline' : action === 'start' ? 'Start Ride' : 'Verify'}
        cancelText="Cancel"
        isDangerous={action === 'decline'}
        isLoading={actionLoading}
        onConfirm={confirmAction}
        onCancel={() => setConfirmDialog(false)}
      />

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={fetchUpcomingRides}
            className="text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Upcoming Ride Requests ({upcomingRides.length})</h2>
        <button
          onClick={fetchUpcomingRides}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Section 1: Pending Requests to Accept/Decline */}
      {upcomingRides.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingRides.map((ride) => (
              <div
                key={`${ride.rideId}-${ride.passengerId}`}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-green-500/30 p-6 hover:border-green-500/60 transition-all duration-300 shadow-lg"
              >
            {/* Passenger Info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{ride.passengerName}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-300">{ride.passengerRating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{ride.date}</p>
                <p className="text-lg font-semibold text-green-400">{ride.time}</p>
              </div>
            </div>

            {/* Route Info */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="w-0.5 h-8 bg-gray-600 my-1"></div>
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">From</p>
                    <p className="text-white font-medium">{ride.from}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">To</p>
                    <p className="text-white font-medium">{ride.to}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleActionClick(ride, 'accept')}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Accept
              </button>
              <button
                onClick={() => handleActionClick(ride, 'decline')}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Decline
              </button>
            </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Rides Ready to Start */}
      {acceptedRides.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 mt-8">Ready to Start</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {acceptedRides.map((ride, idx) => {
              const acceptedCount = ride.passengers?.filter(p => p.status === 'accepted').length || 0
              return (
                <div
                  key={`${ride._id}-${idx}`}
                  className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg border border-blue-500/50 p-6 hover:border-blue-500/80 transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Ready to Start</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-blue-300">👥</span>
                        <span className="text-blue-200">{acceptedCount} passenger{acceptedCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Ready</span>
                  </div>

                  {/* Route Info */}
                  <div className="bg-blue-900/50 rounded-lg p-4 mb-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                        <div className="w-0.5 h-8 bg-blue-600 my-1"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-4">
                          <p className="text-xs text-blue-300 uppercase tracking-wider">From</p>
                          <p className="text-white font-medium">{ride.from?.name || ride.from}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-300 uppercase tracking-wider">To</p>
                          <p className="text-white font-medium">{ride.to?.name || ride.to}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-blue-200 mb-4">
                    <p>🕐 {ride.time || 'Scheduled'}</p>
                    <p>💰 ₹{ride.fare || ride.price || 'TBD'}</p>
                  </div>

                  {/* Start Ride Button */}
                  <button
                    onClick={() => handleStartRide(ride)}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    ▶ Start Ride
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Section 3: Your Booked Rides as Passenger */}
      {passengerRides.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 mt-8">Your Booked Rides</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {passengerRides.map((ride, idx) => (
              <div
                key={`passenger-${ride._id}-${idx}`}
                className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg border border-purple-500/50 p-6 hover:border-purple-500/80 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Booked as Passenger</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ride.status === 'in-progress' 
                          ? 'bg-orange-500/30 text-orange-200' 
                          : 'bg-purple-500/30 text-purple-200'
                      }`}>
                        {ride.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Driver</p>
                    <p className="text-white font-semibold">{ride.driver?.name || 'Unknown'}</p>
                  </div>
                </div>

                {/* Route Info */}
                <div className="bg-purple-900/50 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                      <div className="w-0.5 h-8 bg-purple-600 my-1"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-4">
                        <p className="text-xs text-purple-300 uppercase tracking-wider">From</p>
                        <p className="text-white font-medium">{ride.startLocation?.name || 'Start'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-300 uppercase tracking-wider">To</p>
                        <p className="text-white font-medium">{ride.endLocation?.name || 'End'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-purple-200 mb-4">
                  <p>🕐 {new Date(ride.departureTime).toLocaleTimeString()}</p>
                  <p>💰 ₹{ride.price || 'TBD'}</p>
                </div>

                {/* Verify Button */}
                <button
                  onClick={() => handleVerifyPassengerRide(ride)}
                  disabled={actionLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  ✓ Ready for Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingRides.length === 0 && acceptedRides.length === 0 && passengerRides.length === 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 text-center border border-white/10 mt-6">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-white font-semibold mb-2">No Pending Ride Requests</h3>
          <p className="text-gray-400">You don't have any pending ride requests at the moment.</p>
          <p className="text-gray-500 text-sm mt-4">Passengers will see your rides when you offer them. They can request to join, and you'll see the requests here.</p>
        </div>
      )}
    </div>
  )
}
