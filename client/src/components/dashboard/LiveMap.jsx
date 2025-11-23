import { useState, useEffect } from 'react'
import LeafletMapComponent from '../LeafletMapComponent'
import api from '../../utils/api'
import { geocodeAddress } from '../../utils/mapService'
import carIcon from '../../assets/icons8-car-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'

export default function LiveMap() {
  const [selectedRide, setSelectedRide] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rides/history');
      
      if (res.data && res.data.rides && res.data.rides.length > 0) {
        // Get the first active ride (scheduled or in-progress)
        const activeRide = res.data.rides.find(r => r.status === 'scheduled' || r.status === 'in-progress');
        
        if (activeRide) {
          setSelectedRide(activeRide);
          
          // Get coordinates for the ride
          const getCoords = async (location) => {
            if (location?.lat && location?.lng) {
              return [location.lng, location.lat];
            } else if (location?.name) {
              const result = await geocodeAddress(location.name);
              return result ? [result.longitude, result.latitude] : null;
            }
            return null;
          };

          // Determine start and end locations based on user role
          let startLocation, endLocation;
          if (activeRide.role === 'driver') {
            startLocation = activeRide.from;
            endLocation = activeRide.to;
          } else {
            startLocation = activeRide.startLocation;
            endLocation = activeRide.endLocation;
          }

          const sCoords = await getCoords(startLocation);
          const eCoords = await getCoords(endLocation);

          setStartCoords(sCoords);
          setEndCoords(eCoords);
          if (sCoords) setMapCenter(sCoords);
        }
      }
    } catch (err) {
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedRide(null)
  }

  if (loading) {
    return (
      <section>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Live Map</h1>
          <p className="text-gray-400">Loading your recent ride...</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Live Map</h1>
        <p className="text-gray-400">Your most recently booked ride</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-4"> {/* Map takes full width */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10" style={{ height: '600px' }}>
            {selectedRide && startCoords && endCoords ? (
              <LeafletMapComponent
                startLocation={startCoords}
                endLocation={endCoords}
                showRoute={true}
                zoom={13}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <p className="text-gray-400">No recent booked ride to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ride Details Panel */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full lg:w-96 bg-gray-900 border-t border-white/10 rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Ride Details</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Driver Info */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Driver</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <img src={carIcon} alt="Driver" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {selectedRide.role === 'driver' ? 'You' : (selectedRide.driver?.name || 'Unknown')}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <img src={ratingIcon} alt="Rating" className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedRide.role === 'driver' 
                          ? selectedRide.rating || 0
                          : selectedRide.driver?.Rating || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm mb-3">Route</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-xs">From</p>
                    <p className="text-white truncate">
                      {selectedRide.role === 'driver'
                        ? (typeof selectedRide.from === 'string' ? selectedRide.from : selectedRide.from?.name || 'Unknown')
                        : (typeof selectedRide.startLocation === 'string' ? selectedRide.startLocation : selectedRide.startLocation?.name || 'Unknown')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">To</p>
                    <p className="text-white truncate">
                      {selectedRide.role === 'driver'
                        ? (typeof selectedRide.to === 'string' ? selectedRide.to : selectedRide.to?.name || 'Unknown')
                        : (typeof selectedRide.endLocation === 'string' ? selectedRide.endLocation : selectedRide.endLocation?.name || 'Unknown')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ride Info */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-400 text-xs">Price</p>
                    <p className="text-white font-bold text-lg">₹{selectedRide.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Available Seats</p>
                    <p className="text-white font-bold text-lg">{selectedRide.availableSeats || selectedRide.seats}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Departure</p>
                    <p className="text-white text-sm">
                      {selectedRide.departureTime
                        ? new Date(selectedRide.departureTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Status</p>
                    <p className="text-white text-sm capitalize">{selectedRide.status}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedRide.notes && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Notes</p>
                  <p className="text-white text-sm">{selectedRide.notes}</p>
                </div>
              )}

              {/* Start Ride Button - Show only for drivers */}
              {selectedRide.role === 'driver' && selectedRide.status === 'scheduled' && (
              <button 
                onClick={async () => {
                  try {
                    await api.post(`/rides/${selectedRide._id || selectedRide.id}/start`)
                    alert('Ride started! Notifying passengers...')
                    handleCloseDetails()
                    fetchRides() // Refresh rides
                  } catch (err) {
                    console.error('Error starting ride:', err)
                    alert('Failed to start ride: ' + (err.response?.data?.message || err.message))
                  }
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-bold transition-all hover:shadow-xl hover:shadow-green-500/50 flex items-center justify-center gap-2"
              >
                ▶ Start Ride
              </button>
              )}

              {/* Passenger Message */}
              {selectedRide.role === 'passenger' && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center">
                <p className="text-blue-200 text-sm">
                  You are a passenger on this ride. Waiting for driver to start.
                </p>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </section>
  )
}
