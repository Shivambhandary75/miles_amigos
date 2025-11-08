import notificationIcon from '../../assets/icons8-notification-50.png'
import carIcon from '../../assets/icons8-car-50.png'
import friendsIcon from '../../assets/icons8-friends-50.png'
import ratingIcon from '../../assets/icons8-rating-50.png'
import rupeeIcon from '../../assets/icons8-rupee-50.png'

export default function Notifications() {
  const notifications = [
    { icon: carIcon, title: 'New ride available', desc: 'Downtown → Airport (₹450)', time: '2 min ago', type: 'ride' },
    { icon: friendsIcon, title: 'Friend joined your ride', desc: 'Alice booked a seat on your 3 PM ride', time: '15 min ago', type: 'friend' },
    { icon: ratingIcon, title: 'New rating received', desc: 'John gave you 5 stars!', time: '1 hour ago', type: 'rating' },
    { icon: rupeeIcon, title: 'Payment received', desc: '₹450 from your last ride', time: '3 hours ago', type: 'payment' },
    { icon: carIcon, title: 'Milestone unlocked', desc: 'You completed 10 rides!', time: '1 day ago', type: 'milestone' },
  ]

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
             Notifications
        </h1>
        <p className="text-gray-400">Stay updated with your ride-sharing activity</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {notifications.map((notif, idx) => (
          <div 
            key={idx} 
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition flex items-start gap-4 cursor-pointer hover:bg-white/10"
          >
            <img src={notif.icon} alt={notif.title} className="w-10 h-10 flex-shrink-0 object-contain" />
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
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 text-center">
        <button className="text-blue-400 hover:text-blue-300 font-semibold transition">
          View all notifications →
        </button>
      </div>
    </section>
  )
}
