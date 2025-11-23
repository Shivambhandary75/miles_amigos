import { useState, useEffect, useContext } from 'react'
import api from '../../utils/api'
import profileIcon from '../../assets/icons8-profile-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import LeafletMapComponent from '../LeafletMapComponent'
import ConfirmationDialog from '../ConfirmationDialog'
import { geocodeAddress, searchLocations } from '../../utils/mapService'
import { useApp } from '../../context/AppContext'
import { getRoute } from "../../utils/getRoute";
import { useNavigate } from 'react-router-dom'; // Import useNavigate


export default function OfferRide() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    datetime: '',
    seats: 1,
    price: '',
    notes: '',
  })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [rideRequests, setRideRequests] = useState([]) // Real ride requests
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [priceData, setPriceData] = useState({ price: 0, isFree: false })
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [startCoords, setStartCoords] = useState(null)
  const [endCoords, setEndCoords] = useState(null)
  const [isGeocodingFrom, setIsGeocodingFrom] = useState(false)
  const [isGeocodingTo, setIsGeocodingTo] = useState(false)
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const { setLiveRides } = useApp(); // Use setLiveRides from AppContext
  const [mapError, setMapError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch ride requests
  useEffect(() => {
    const fetchRideRequests = async () => {
      try {
        const res = await api.get('/rides/requests');
        setRideRequests(res.data);
      } catch (err) {
        console.error('Error fetching ride requests:', err);
      }
    };
    fetchRideRequests();
    const intervalId = setInterval(fetchRideRequests, 15000); // Refresh every 15 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Geocode "from" location
  useEffect(() => {
    if (formData.from.length > 2) {
      setIsGeocodingFrom(true)
      setMapError(null);
      const timer = setTimeout(async () => {
        try {
          const suggestions = await searchLocations(formData.from, { limit: 5 })
          setFromSuggestions(suggestions)
          const result = await geocodeAddress(formData.from)
          if (result) {
            setStartCoords([result.longitude, result.latitude])
          }
        } catch (error) {
          console.error('Error geocoding from location:', error)
          setMapError('Could not fetch location. Please check your connection and try again.');
        } finally {
          setIsGeocodingFrom(false)
        }
      }, 500) // Debounce 500ms
      return () => clearTimeout(timer)
    }
    setFromSuggestions([])
  }, [formData.from])

  // Geocode "to" location
  useEffect(() => {
    if (formData.to.length > 2) {
      setIsGeocodingTo(true)
      setMapError(null);
      const timer = setTimeout(async () => {
        try {
          const suggestions = await searchLocations(formData.to, { limit: 5 })
          setToSuggestions(suggestions)
          const result = await geocodeAddress(formData.to)
          if (result) {
            setEndCoords([result.longitude, result.latitude])
          }
        } catch (error) {
          console.error('Error geocoding to location:', error)
          setMapError('Could not fetch location. Please check your connection and try again.');
        } finally {
          setIsGeocodingTo(false)
        }
      }, 500) // Debounce 500ms
      return () => clearTimeout(timer)
    }
    setToSuggestions([])
  }, [formData.to])

  const handleSelectFrom = (sug) => {
    setFormData(prev => ({ ...prev, from: sug.label }))
    setFromSuggestions([])
    setStartCoords([sug.longitude, sug.latitude])
  }

  const handleSelectTo = (sug) => {
    setFormData(prev => ({ ...prev, to: sug.label }))
    setToSuggestions([])
    setEndCoords([sug.longitude, sug.latitude])
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

const confirmPostRide = async () => {
  if (!startCoords || !endCoords) {
    alert("Please select valid locations.");
    return;
  }

  setIsPosting(true);

  try {
    // 1. Fetch driver route polyline
    const routePolyline = await getRoute(startCoords, endCoords);

    if (!routePolyline) {
      alert("Could not fetch route. Try again.");
      return;
    }

    // 2. Build GeoJSON
    const routeGeoJSON = {
      type: "LineString",
      coordinates: routePolyline
    };

    // 3. Send full ride data to backend
    const res = await api.post('/rides', {
      startLocation: {
        name: formData.from,
        lat: startCoords[1],
        lng: startCoords[0]
      },
      endLocation: {
        name: formData.to,
        lat: endCoords[1],
        lng: endCoords[0]
      },
      departureTime: formData.datetime,
      availableSeats: formData.seats,
      price: formData.price,
      notes: formData.notes,
      routePolyline,
      routeGeoJSON
    });

    if (res.status === 201) {
      // Instead of addRide, re-fetch all live rides to ensure consistency
      const updatedLiveRides = await api.get('/rides');
      setLiveRides(updatedLiveRides.data);

      alert("Ride posted successfully!");

      setFormData({
        from: "",
        to: "",
        datetime: "",
        seats: 1,
        price: "",
        notes: "",
      });
      navigate('/dashboard?section=map'); // Navigate to Live Map section
    }
  } catch (error) {
    console.error(error);
    alert("Failed to post ride.");
  } finally {
    setIsPosting(false);
    setShowConfirmDialog(false);
  }
};


  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setPriceData({ price: 0, isFree: false })
    setShowRequestModal(true)
  }

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    setShowAcceptDialog(true);
  }

  const confirmAcceptRequest = async () => {
    if (!selectedRequest) return;
    setIsPosting(true); // Use isPosting for acceptance loading state
    try {
      await api.put(`/rides/${selectedRequest.rideId}/requests/${selectedRequest.passengerId}/accept`);
      alert(`Ride request from ${selectedRequest.passengerName} accepted!`);
      setShowAcceptDialog(false);
      setShowRequestModal(false);
      // Refresh ride requests
      const res = await api.get('/rides/requests');
      setRideRequests(res.data);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error accepting ride request:', error);
      alert('Failed to accept ride request.');
    } finally {
      setIsPosting(false);
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    setIsPosting(true); // Use isPosting for rejection loading state
    try {
      await api.put(`/rides/${selectedRequest.rideId}/requests/${selectedRequest.passengerId}/reject`);
      alert(`Ride request from ${selectedRequest.passengerName} rejected.`);
      setShowRequestModal(false);
      // Refresh ride requests
      const res = await api.get('/rides/requests');
      setRideRequests(res.data);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting ride request:', error);
      alert('Failed to reject ride request.');
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <section>
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Confirm Post Ride"
        message={`Are you sure you want to post this ride from ${formData.from} to ${formData.to}? Passengers will be able to see and book this ride.`}
        confirmText="Post Ride"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isPosting}
        onConfirm={confirmPostRide}
        onCancel={() => setShowConfirmDialog(false)}
      />
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2"> Offer a Ride</h1>
        <p className="text-gray-400">Share your ride and earn money</p>
      </div>

      {/* Ride Requests Section */}
      {rideRequests.length > 0 && (
        <div className="mb-10 bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">📬 Ride Requests ({rideRequests.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rideRequests.map(request => (
              <div key={request.rideId + request.passengerId} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-400/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={profileIcon} alt={request.passengerName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="text-white font-bold">{request.passengerName}</p>
                      <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <img src={ratingIcon} alt="Rating" className="w-3 h-3" /> {request.passengerRating}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mb-4 text-sm">
                  <p className="text-gray-300"><span className="text-green-400">From:</span> {request.from}</p>
                  <p className="text-gray-300"><span className="text-green-400">To:</span> {request.to}</p>
                  <p className="text-gray-300"><span className="text-green-400">When:</span> {request.date} at {request.time}</p>
                </div>
                <button
                  onClick={() => handleViewRequest(request)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition text-sm"
                >
                  View & Respond
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form - Left Side */}
        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-white font-semibold mb-3">From Location</label>
                <input 
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location" 
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
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
                <label className="block text-white font-semibold mb-3">To Location</label>
                <input 
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  placeholder="Enter destination" 
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
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

            {mapError && <p className="text-red-400 text-sm">{mapError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-3">Date & Time</label>
                <input 
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Available Seats</label>
                <input 
                  type="number"
                  name="seats"
                  min="1" 
                  max="7"
                  value={formData.seats}
                  onChange={handleInputChange}
                  placeholder="1-7 seats" 
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Price per Seat (₹)</label>
              <input 
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add notes (music, pet-friendly, etc.)" 
                rows="4"
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-xl hover:shadow-green-500/50">
               Post Your Ride
            </button>
          </form>
        </div>

        {/* Map Sidebar - Right Side */}
        <div>
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-white mb-4">Route Preview</h3>
            
            <div className="rounded-lg overflow-hidden border border-white/10 mb-4" style={{ height: '400px' }}>
              <LeafletMapComponent
                startLocation={startCoords || null}
                endLocation={endCoords || null}
                showRoute={Boolean(startCoords && endCoords)}
                zoom={13}
              />
            </div>

            {/* Ride Details */}
            {formData.from && formData.to && (
              <div className="bg-white/5 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <p className="text-white font-semibold text-sm">{formData.from}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <p className="text-white font-semibold text-sm">{formData.to}</p>
                </div>
                {formData.datetime && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">When</p>
                    <p className="text-white font-semibold text-sm">{formData.datetime}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Seats & Price</p>
                  <p className="text-white font-semibold text-sm">{formData.seats} seats @ ₹{formData.price || '0'}</p>
                </div>
              </div>
            )}

            {!formData.from && !formData.to && (
              <div className="bg-green-500/10 border border-green-400/30 p-4 rounded-lg">
                <p className="text-sm text-green-300"> Fill pickup and destination above to see the route.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <img src={profileIcon} alt={selectedRequest.passengerName} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
              <h2 className="text-2xl font-bold text-white">{selectedRequest.passengerName}</h2>
              <p className="text-yellow-400 text-sm flex items-center justify-center gap-1">
                <img src={ratingIcon} alt="Rating" className="w-4 h-4" /> {selectedRequest.passengerRating} rating
              </p>
            </div>

            <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-lg">
              <div>
                <p className="text-gray-400 text-xs mb-1">From</p>
                <p className="text-white font-semibold">{selectedRequest.from}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">To</p>
                <p className="text-white font-semibold">{selectedRequest.to}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Requested Date & Time</p>
                <p className="text-white font-semibold">{selectedRequest.date} at {selectedRequest.time}</p>
              </div>
            </div>

            {/* Pricing Section - Removed as price is set by driver when offering ride */}
            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleAcceptRequest}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
              >
                ✓ Accept Request
              </button>
              <button
                onClick={handleRejectRequest}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
              >
                ✗ Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showAcceptDialog}
        title="Accept Ride Request"
        message={selectedRequest ? `Accept ride request from ${selectedRequest.passengerName}?\n\n${selectedRequest.from} → ${selectedRequest.to}` : ''}
        confirmText="Accept"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isPosting}
        onConfirm={confirmAcceptRequest}
        onCancel={() => setShowAcceptDialog(false)}
      />
    </section>
  )
}

