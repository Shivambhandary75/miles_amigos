import { useState, useEffect } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import LeafletMapComponent from '../LeafletMapComponent'
import searchIcon from '../../assets/icons8-search-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import { geocodeAddress, searchLocations, haversineDistance } from '../../utils/mapService'
import api from '../../utils/api'

export default function FindRide() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [notes, setNotes] = useState('')
  const [results, setResults] = useState([])
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [isBooking, setIsBooking] = useState(false)
  const [startCoords, setStartCoords] = useState(null)
  const [endCoords, setEndCoords] = useState(null)
  const [isGeocodingFrom, setIsGeocodingFrom] = useState(false)
  const [isGeocodingTo, setIsGeocodingTo] = useState(false)
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])

  // Fetch all rides from backend on mount
  // Rides fetched from backend
  // const [allRides, setAllRides] = useState([]) // No longer needed

  // Remove initial fetch
  // useEffect(() => { ... }, [])

  // Geocode "from" location
  useEffect(() => {
    if (from.length > 2) {
      setIsGeocodingFrom(true)
      const timer = setTimeout(async () => {
        try {
          // fetch suggestions for autocomplete
          const suggestions = await searchLocations(from, { limit: 5 })
          setFromSuggestions(suggestions)
          const result = await geocodeAddress(from)
          if (result) {
            setStartCoords([result.longitude, result.latitude])
          }
        } catch (error) {
          console.error('Error geocoding from location:', error)
        } finally {
          setIsGeocodingFrom(false)
        }
      }, 500) // Debounce 500ms
      return () => clearTimeout(timer)
    }
    setFromSuggestions([])
  }, [from])

  // Geocode "to" location
  useEffect(() => {
    if (to.length > 2) {
      setIsGeocodingTo(true)
      const timer = setTimeout(async () => {
        try {
          const suggestions = await searchLocations(to, { limit: 5 })
          setToSuggestions(suggestions)
          const result = await geocodeAddress(to)
          if (result) {
            setEndCoords([result.longitude, result.latitude])
          }
        } catch (error) {
          console.error('Error geocoding to location:', error)
        } finally {
          setIsGeocodingTo(false)
        }
      }, 500) // Debounce 500ms
      return () => clearTimeout(timer)
    }
    setToSuggestions([])
  }, [to])

  const handleSelectFrom = (sug) => {
    setFrom(sug.label)
    setFromSuggestions([])
    setStartCoords([sug.longitude, sug.latitude])
  }

  const handleSelectTo = (sug) => {
    setTo(sug.label)
    setToSuggestions([])
    setEndCoords([sug.longitude, sug.latitude])
  }

  // Filter rides by matching route (start/end within 2km)
  const handleSearch = async (e) => {
    e.preventDefault();

    console.log('\n========================================');
    console.log('🔍 [FIND RIDE] Starting search...');
    console.log('========================================');

    if (!startCoords || !endCoords) {
      console.error('❌ [FIND RIDE] Missing coordinates');
      alert("Please enter valid pickup and drop locations.");
      return;
    }

    console.log('📍 [FIND RIDE] Search parameters:');
    console.log(`  From: ${from}`);
    console.log(`  From Coords: [${startCoords[0]}, ${startCoords[1]}]`);
    console.log(`  To: ${to}`);
    console.log(`  To Coords: [${endCoords[0]}, ${endCoords[1]}]`);

    try {
      console.log('📤 [FIND RIDE] Sending search request to server...');
      const res = await api.post('/rides/search', {
        pickup: {
          lat: startCoords[1],
          lng: startCoords[0]
        },
        drop: {
          lat: endCoords[1],
          lng: endCoords[0]
        },
        date: date // Add date to payload
      });

      console.log('✅ [FIND RIDE] Response received:');
      console.log(`  Status: ${res.status}`);
      console.log(`  Total matches: ${res.data.matches?.length || 0}`);
      console.log(`  Full response:`, res.data);

      if (res.data.matches && res.data.matches.length > 0) {
        console.log('🚗 [FIND RIDE] Matched rides:');
        res.data.matches.forEach((ride, idx) => {
          console.log(`  ${idx + 1}. Ride ID: ${ride._id || ride.rideId}`);
          console.log(`     Driver: ${ride.driver?.name}`);
          console.log(`     From: ${ride.startLocation?.name} [${ride.startLocation?.lng}, ${ride.startLocation?.lat}]`);
          console.log(`     To: ${ride.endLocation?.name} [${ride.endLocation?.lng}, ${ride.endLocation?.lat}]`);
          console.log(`     Seats: ${ride.availableSeats}`);
          console.log(`     Price: ₹${ride.price}`);
        });
      } else {
        console.log('⚠️  [FIND RIDE] No rides found matching search criteria');
        console.log('   Server response:', JSON.stringify(res.data, null, 2));
      }

      setResults(res.data.matches || []);
      console.log('========================================\n');
    } catch (err) {
      console.error('❌ [FIND RIDE] Error searching rides:');
      console.error('  Error:', err.message);
      console.error('  Status:', err.response?.status);
      console.error('  Response data:', err.response?.data);
      console.error('  Full error:', err);
      alert("Failed to search rides. Try again.");
    }
  };

  const handleBookClick = (ride) => {
    console.log('\n========================================');
    console.log('📋 [BOOK RIDE] Ride selected for booking');
    console.log('========================================');
    console.log('Ride Object:');
    console.log(JSON.stringify(ride, null, 2));
    console.log('Ride IDs:', {
      '_id': ride._id,
      'rideId': ride.rideId,
      'id': ride.id
    });
    setSelectedRide(ride)
    setShowBookDialog(true)
  }

  const confirmBookRide = async () => {
    if (!selectedRide) return;
    console.log("selected ride ", selectedRide);
    // Validate that coordinates are available
    if (!startCoords || !endCoords) {
      alert('Please enter valid pickup and drop locations.');
      return;
    }

    // Get the ride ID (Mongoose uses _id by default)
    const rideId = selectedRide.rideId;
    console.log("ride id is ", rideId);
    if (!rideId) {
      alert('Ride ID not found. Please try again.');
      return;
    }

    setIsBooking(true);
    try {
      // Send booking request to backend
      const payload = {
        startLocation: {
          name: from,
          lat: startCoords[1],
          lng: startCoords[0]
        },
        endLocation: {
          name: to,
          lat: endCoords[1],
          lng: endCoords[0]
        }
      };
      console.log('Sending booking payload:', payload);
      const res = await api.post(`/rides/${rideId}/join`, payload);
      setIsBooking(false);
      setShowBookDialog(false);
      console.log('Ride booked:', res.data);
      alert(`Booking confirmed with ${selectedRide.driver?.name || 'driver'}!`);
      setSelectedRide(null);
    } catch (err) {
      setIsBooking(false);
      console.error('Booking error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to book ride. Please try again.';
      alert(errorMsg);
    }
  }

  return (
    <section>
      <ConfirmationDialog
        isOpen={showBookDialog}
        title="Confirm Booking"
        message={selectedRide ? `Book ride with ${selectedRide.driver?.name} from "${from}" to "${to}" for ₹${selectedRide.estimatedPrice || selectedRide.price}?` : ''}
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
              <div className="relative">
                <label className="block text-white font-semibold mb-3">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {fromSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/10 rounded-lg max-h-56 overflow-auto">
                    {fromSuggestions.map((s, i) => (
                      <li key={i}>
                        <button type="button" onClick={() => handleSelectFrom(s)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-white">
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className="block text-white font-semibold mb-3">To</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {toSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/10 rounded-lg max-h-56 overflow-auto">
                    {toSuggestions.map((s, i) => (
                      <li key={i}>
                        <button type="button" onClick={() => handleSelectTo(s)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-white">
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
              <LeafletMapComponent
                startLocation={startCoords || null}
                endLocation={endCoords || null}
                showRoute={Boolean(startCoords && endCoords)}
                zoom={13}
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
          {results.map((ride, idx) => {
            // Calculate estimated price if search coords are available
            let displayPrice = ride.price;
            let priceLabel = "Base Rate";

            if (startCoords && endCoords) {
              const dist = haversineDistance(
                [startCoords[1], startCoords[0]],
                [endCoords[1], endCoords[0]]
              );
              displayPrice = Math.ceil(dist * 15);
              priceLabel = `Est. for ${dist.toFixed(1)} km`;
            } else {
              displayPrice = "15/km";
              priceLabel = "Rate";
            }

            return (
              <div key={idx} className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 hover:border-blue-500/30 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {ride.driver?.name}'s Ride
                    </p>
                    <p className="text-gray-400 text-sm">
                      Seats: {ride.availableSeats}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Departure: {new Date(ride.departureTime).toLocaleString()}
                    </p>
                  </div>

                  <span className="text-2xl flex items-center gap-1">
                    <img src={ratingIcon} alt="Rating" className="w-6 h-6" />
                    {ride.driver?.Rating || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-green-400 font-bold text-xl">₹{displayPrice}</span>
                    <span className="text-gray-500 text-xs">{priceLabel}</span>
                  </div>

                  <button
                    onClick={() => handleBookClick({ ...ride, estimatedPrice: displayPrice })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
