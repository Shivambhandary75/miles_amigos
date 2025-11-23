import { useState, useEffect } from 'react'
import chairIcon from '../../assets/icons8-spectators-on-seats-50.png'
import MapLibreMap from '../MapLibreMap'
import api from '../../utils/api'
import { useApp } from '../../context/AppContext'

export default function LiveRides() {
  const { liveRides, setLiveRides, setLastBookedRide } = useApp()
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [isBooking, setIsBooking] = useState(false)

  // New state for passenger's start and end locations
  const [passengerStart, setPassengerStart] = useState('');
  const [passengerEnd, setPassengerEnd] = useState('');


  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/rides');
        setLiveRides(response.data);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };

    fetchRides();
    const intervalId = setInterval(fetchRides, 30000);
    return () => clearInterval(intervalId);
  }, [setLiveRides]);


  const handleBookClick = (ride) => {
    setSelectedRide(ride)
    setShowBookDialog(true)
    // Pre-fill passenger locations with ride's locations as a default
    setPassengerStart(ride.startLocation.name);
    setPassengerEnd(ride.endLocation.name);
  }

  const handleBookRide = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      // 1. Geocode start and end locations
      const [startResponse, endResponse] = await Promise.all([
        api.get(`/geocode/search?q=${passengerStart}`),
        api.get(`/geocode/search?q=${passengerEnd}`)
      ]);

      if (startResponse.data.length === 0 || endResponse.data.length === 0) {
        alert('Could not find one or both locations. Please be more specific.');
        setIsBooking(false);
        return;
      }

      const startLocationData = startResponse.data[0];
      const endLocationData = endResponse.data[0];

      const startLocation = {
        name: startLocationData.display_name,
        lat: parseFloat(startLocationData.lat),
        lng: parseFloat(startLocationData.lon)
      };

      const endLocation = {
        name: endLocationData.display_name,
        lat: parseFloat(endLocationData.lat),
        lng: parseFloat(endLocationData.lon)
      };

      // 2. Join the ride with geocoded data
      const res = await api.post(`/rides/${selectedRide._id}/join`, {
        startLocation,
        endLocation
      });
      
      setLastBookedRide(res.data);

      alert(`Ride booked from ${startLocation.name} to ${endLocation.name}!`);
      setShowBookDialog(false);
      setSelectedRide(null);
      setPassengerStart('');
      setPassengerEnd('');
      
      // 3. Refresh the rides list
      const response = await api.get('/rides');
      setLiveRides(response.data);

    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2"> Live Ride Feed</h1>
      </div>

      {/* Map View */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg" style={{ height: '450px' }}>
        <MapLibreMap
          startLocation={[77.5946, 12.9716]} // Bangalore center
          endLocation={[77.7099, 13.1939]}   // Bangalore airport
          showRoute={true}
          zoom={12}
          markers={liveRides.map(ride => ({
            title: `${ride.startLocation.name} → ${ride.endLocation.name}`,
            description: `${ride.availableSeats} seats available`,
            latitude: ride.startLocation.lat,
            longitude: ride.startLocation.lng,
          }))}
        />
      </div>

      {/* Ride List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveRides.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">Waiting for live rides...</p>
          </div>
        ) : (
          liveRides.map(ride => (
            <div 
              key={ride._id} 
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-5 hover:border-green-400/60 transition-all hover:shadow-lg hover:shadow-green-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{ride.startLocation.name}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <span>→</span> {ride.endLocation.name}
                  </p>
                </div>
                <div className="text-center">
                  <span className="bg-green-500/20 border border-green-400 text-green-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit">
                    {ride.availableSeats} <img src={chairIcon} alt="Seats" className="w-4 h-4" />
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

      {/* Booking Dialog */}
      {showBookDialog && selectedRide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Book Your Seat</h2>
            <p className="text-gray-400 mb-2">
              You're booking a seat in a ride from <span className="font-semibold text-white">{selectedRide.startLocation.name}</span> to <span className="font-semibold text-white">{selectedRide.endLocation.name}</span>.
            </p>
            <p className="text-gray-400 mb-6">
              Please specify your pickup and drop-off locations.
            </p>
            
            <form onSubmit={handleBookRide}>
              <div className="mb-4">
                <label htmlFor="startLocation" className="block text-gray-300 text-sm font-medium mb-2">Pickup Location</label>
                <input
                  type="text"
                  id="startLocation"
                  value={passengerStart}
                  onChange={(e) => setPassengerStart(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="endLocation" className="block text-gray-300 text-sm font-medium mb-2">Drop-off Location</label>
                <input
                  type="text"
                  id="endLocation"
                  value={passengerEnd}
                  onChange={(e) => setPassengerEnd(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookDialog(false)}
                  disabled={isBooking}
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {isBooking && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
