import { useState, useEffect } from 'react';
import LeafletMapComponent from '../LeafletMapComponent';
import ConfirmationDialog from '../ConfirmationDialog';
import api from '../../utils/api';

// Get current user ID from localStorage or auth context
const getCurrentUserId = () => {
    // You might want to get this from context or decode JWT token
    try {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Decode JWT to get user ID (base64 decode the payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.userId;
        }
    } catch (e) {
        console.error('Could not decode token:', e);
    }
    return null;
};

export default function InProgressRide({ ride }) {
    const [isDriver, setIsDriver] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // null, 'confirming', 'checking', 'completed'
    const [locationData, setLocationData] = useState(null);
    const [distance, setDistance] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const userId = getCurrentUserId();
        setIsDriver(ride.driver._id === userId);
    }, [ride]);

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const handleConfirmPayment = async () => {
        setPaymentStatus('confirming');
        setErrorMsg(null);

        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser');
            setPaymentStatus(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const driverLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                setLocationData(driverLocation);
                setPaymentStatus('checking');

                // Calculate distance to destination
                const dist = calculateDistance(
                    driverLocation.lat,
                    driverLocation.lng,
                    ride.endLocation.lat,
                    ride.endLocation.lng
                );
                
                setDistance(dist);
                console.log(`Distance to destination: ${dist.toFixed(2)} km`);

                try {
                    const res = await api.post(`/rides/${ride._id}/confirm-payment`, { driverLocation });
                    console.log('Payment confirmation response:', res.data);
                    
                    setPaymentStatus('completed');
                    setErrorMsg(null);
                    
                    // Show success message
                    setTimeout(() => {
                        alert(`✅ Payment confirmed!\n\nDistance to destination: ${dist.toFixed(2)} km\n\n${res.data.message}`);
                        setPaymentStatus(null);
                        setLocationData(null);
                        setDistance(null);
                    }, 1000);
                } catch (err) {
                    console.error('Error confirming payment:', err);
                    setErrorMsg(err.response?.data?.message || 'Failed to confirm payment');
                    setPaymentStatus(null);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setErrorMsg('Unable to retrieve your location. Please enable location access.');
                setPaymentStatus(null);
            }
        );
    };

    const handlePassengerConfirm = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const res = await api.post(`/rides/${ride._id}/passenger-confirm-completion`);
            console.log('Ride completion confirmed:', res.data);
            alert(`✅ ${res.data.message}`);
            setIsConfirming(false);
            // The parent component should handle the state update
        } catch (err) {
            console.error('Error completing ride:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to complete ride');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section>
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">🚗 Ride in Progress</h1>
                <p className="text-gray-400">From {ride.startLocation.name} to {ride.endLocation.name}</p>
            </div>

            {errorMsg && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl shadow-green-500/20 border border-white/10" style={{ height: '600px' }}>
                        <LeafletMapComponent
                            startLocation={[ride.startLocation.lng, ride.startLocation.lat]}
                            endLocation={[ride.endLocation.lng, ride.endLocation.lat]}
                            showRoute={true}
                            zoom={13}
                        />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 h-full flex flex-col justify-between">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold text-lg mb-4">Ride Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Driver</p>
                                        <p className="text-white font-medium">{ride.driver.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Passengers</p>
                                        <p className="text-white font-medium">{ride.passengers?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Price</p>
                                        <p className="text-green-400 font-bold text-xl">₹{ride.price}</p>
                                    </div>
                                </div>
                            </div>

                            {paymentStatus === 'checking' && locationData && distance !== null && (
                                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                                    <p className="text-blue-200 text-sm mb-2">📍 Location Check</p>
                                    <p className="text-white font-semibold">{distance.toFixed(2)} km</p>
                                    <p className="text-gray-300 text-xs mt-2">from destination</p>
                                </div>
                            )}

                            {paymentStatus === 'completed' && (
                                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 animate-pulse">
                                    <p className="text-green-200 text-sm">✅ Payment Confirmed!</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mt-6">
                            {isDriver ? (
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={paymentStatus !== null}
                                    className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                                        paymentStatus === null
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : paymentStatus === 'confirming' || paymentStatus === 'checking'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-gray-600 text-gray-300'
                                    }`}
                                >
                                    {paymentStatus === null && '💰 Confirm Payment & Check Location'}
                                    {paymentStatus === 'confirming' && '📍 Getting location...'}
                                    {paymentStatus === 'checking' && '✓ Processing...'}
                                    {paymentStatus === 'completed' && '✅ Completed'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsConfirming(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all"
                                >
                                    ✓ Verify Ride Completion
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isConfirming}
                title="Confirm Ride Completion"
                message="Has your ride with the driver ended? Please confirm to complete the trip."
                confirmText="Yes, Ride Ended"
                cancelText="No, Not Yet"
                onConfirm={handlePassengerConfirm}
                onCancel={() => setIsConfirming(false)}
                isLoading={isLoading}
                isDangerous={false}
            />
        </section>
    );
}
