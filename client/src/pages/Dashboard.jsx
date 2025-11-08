import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardHome from '../components/dashboard/DashboardHome'
import OfferRide from '../components/dashboard/OfferRide'
import FindRide from '../components/dashboard/FindRide'
import LiveRides from '../components/dashboard/LiveRides'
import Messages from '../components/dashboard/Messages'
import Friends from '../components/dashboard/Friends'
import Communities from '../components/dashboard/Communities'
import Notifications from '../components/dashboard/Notifications'
import Settings from '../components/dashboard/Settings'
import SafetyHelp from '../components/dashboard/SafetyHelp'
import RideHistory from '../components/dashboard/RideHistory'
import LiveMap from '../components/dashboard/LiveMap'
import EditProfile from '../components/dashboard/EditProfile'
import dashboardIcon from '../assets/icons8-dashboard-50.png'
import profileIcon from '../assets/icons8-profile-50.png'
import carIcon from '../assets/icons8-car-50.png'
import searchIcon from '../assets/icons8-search-50.png'
import mapIcon from '../assets/icons8-map-50.png'
import liveIcon from '../assets/icons8-live-50.png'
import historyIcon from '../assets/icons8-history-50.png'
import messagesIcon from '../assets/icons8-messages-50.png'
import friendsIcon from '../assets/icons8-friends-50.png'
import communityIcon from '../assets/icons8-community-50.png'
import notificationIcon from '../assets/icons8-notification-50.png'
import settingsIcon from '../assets/icons8-settings-50.png'
import safetyIcon from '../assets/icons8-safety-50.png'
import logoutIcon from "../assets/icons8-exit-50.png"
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-green-700 to-green-800 text-white min-h-screen py-8 px-6 flex flex-col gap-1 shadow-2xl border-r border-green-600/30">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent"> MilesAmigos</h2>
          
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarButton 
            icon={dashboardIcon} 
            label="Dashboard" 
            active={activeSection === 'dashboard'} 
            onClick={() => setActiveSection('dashboard')} 
          />
          <SidebarButton 
            icon={profileIcon} 
            label="Profile" 
            active={activeSection === 'editProfile'} 
            onClick={() => setActiveSection('editProfile')} 
          />
          <SidebarButton 
            icon={carIcon} 
            label="Offer Ride" 
            active={activeSection === 'offerRide'} 
            onClick={() => setActiveSection('offerRide')} 
          />
          <SidebarButton 
            icon={searchIcon} 
            label="Find Ride" 
            active={activeSection === 'findRide'} 
            onClick={() => setActiveSection('findRide')} 
          />
          <SidebarButton 
            icon={mapIcon} 
            label="Live Map" 
            active={activeSection === 'map'} 
            onClick={() => setActiveSection('map')} 
          />
          <SidebarButton 
            icon={liveIcon} 
            label="Live Rides" 
            active={activeSection === 'rideFeed'} 
            onClick={() => setActiveSection('rideFeed')} 
          />
          <SidebarButton 
            icon={historyIcon} 
            label="Ride History" 
            active={activeSection === 'rideHistory'} 
            onClick={() => setActiveSection('rideHistory')} 
          />
          <SidebarButton 
            icon={messagesIcon} 
            label="Messages" 
            active={activeSection === 'messages'} 
            onClick={() => setActiveSection('messages')} 
          />
          <SidebarButton 
            icon={friendsIcon} 
            label="Friends" 
            active={activeSection === 'friends'} 
            onClick={() => setActiveSection('friends')} 
          />
          <SidebarButton 
            icon={communityIcon} 
            label="Communities" 
            active={activeSection === 'communities'} 
            onClick={() => setActiveSection('communities')} 
          />
          <SidebarButton 
            icon={notificationIcon} 
            label="Notifications" 
            active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')} 
          />
          <SidebarButton 
            icon={settingsIcon} 
            label="Settings" 
            active={activeSection === 'settings'} 
            onClick={() => setActiveSection('settings')} 
          />
          <SidebarButton 
            icon={safetyIcon} 
            label="Safety" 
            active={activeSection === 'reportSafety'} 
            onClick={() => setActiveSection('reportSafety')} 
          />
        </nav>

        <button
  onClick={handleLogout}
  className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold 
             transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
>
  <img src={logoutIcon} alt="logout icon" className="w-5 h-5" />
  Logout
</button>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'dashboard' && <DashboardHome />}
            {activeSection === 'offerRide' && <OfferRide />}
            {activeSection === 'findRide' && <FindRide />}
            {activeSection === 'rideFeed' && <LiveRides />}
            {activeSection === 'messages' && <Messages />}
            {activeSection === 'friends' && <Friends />}
            {activeSection === 'communities' && <Communities />}
            {activeSection === 'notifications' && <Notifications />}
            {activeSection === 'settings' && <Settings />}
            {activeSection === 'reportSafety' && <SafetyHelp />}
            {activeSection === 'rideHistory' && <RideHistory />}
            {activeSection === 'map' && <LiveMap />}
            {activeSection === 'editProfile' && <EditProfile />}
          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
        active
          ? 'bg-green-600 text-white shadow-lg scale-105'
          : 'text-green-100 hover:bg-green-600/30 hover:text-white'
      }`}
    >
      <img src={icon} alt={label} className="w-5 h-5 object-contain" />
      <span>{label}</span>
    </button>
  )
}
