
import notificationIcon from '../../assets/icons8-notification-50.png';
import carIcon from '../../assets/icons8-car-50.png';
import friendsIcon from '../../assets/icons8-friends-50.png';
import ratingIcon from '../../assets/icons8-rating-50.png';
import rupeeIcon from '../../assets/icons8-rupee-50.png';
import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
   
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      console.log(res.data)
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleConfirmRideCompletion = async (rideId) => {
    try {
      await api.post(`/rides/${rideId}/passenger-confirm-completion`);
      // Refresh notifications after confirmation
      fetchNotifications();
      alert('Ride completion confirmed!');
    } catch (err) {
      console.error('Error confirming ride completion:', err);
      alert('Failed to confirm ride completion.');
    }
  };

  const handleDeclineRideCompletion = async (rideId) => {
    try {
      // For now, just remove the notification by refreshing
      // In future, you might want to send a separate endpoint to decline
      fetchNotifications();
      alert('You can request a review of this ride.');
    } catch (err) {
      console.error('Error declining ride completion:', err);
    }
  };

  // Map icon string to imported icon
  const iconMap = {
    car: carIcon,
    friends: friendsIcon,
    rating: ratingIcon,
    rupee: rupeeIcon,
    notification: notificationIcon
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
             Notifications
        </h1>
        <p className="text-gray-400">Stay updated with your ride-sharing activity</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {notifications.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No notifications yet.</div>
        ) : (
          notifications.map((notif, idx) => (
            <div 
              key={idx} 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition flex items-start gap-4 cursor-pointer hover:bg-white/10"
            >
              <img src={iconMap[notif.icon] || notificationIcon} alt={notif.title} className="w-10 h-10 flex-shrink-0 object-contain" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">{notif.title}</p>
                <p className="text-gray-400 text-sm">{notif.desc}</p>
                <p className="text-gray-500 text-xs mt-2">{notif.time}</p>
              </div>
              {notif.type === 'ride' && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex-shrink-0 transition">
                  Book
                </button>
              )}
              {notif.type === 'ride-confirmation' && notif.rideId && (
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleConfirmRideCompletion(notif.rideId)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleDeclineRideCompletion(notif.rideId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-8 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 text-center">
        <button className="text-blue-400 hover:text-blue-300 font-semibold transition">
          View all notifications →
        </button>
      </div>
    </section>
  )
}
