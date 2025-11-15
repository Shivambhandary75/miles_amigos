import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmationDialog from '../components/ConfirmationDialog'
import DashboardHome from '../components/dashboard/DashboardHome'
import OfferRide from '../components/dashboard/OfferRide'
import FindRide from '../components/dashboard/FindRide'
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = async () => {
    setLogoutLoading(true)
    // Simulate logout delay
    setTimeout(() => {
      localStorage.removeItem('token')
      setLogoutLoading(false)
      navigate('/')
    }, 500)
  }

  const handleNavigation = (section) => {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ConfirmationDialog
        isOpen={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to logout from your account? You'll need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={logoutLoading}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={`fixed md:relative w-72 bg-gradient-to-b from-green-700 to-green-800 text-white min-h-screen py-8 px-6 flex flex-col gap-1 shadow-2xl border-r border-green-600/30 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            MilesAmigos
          </h2>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarButton
            icon={dashboardIcon}
            label="Dashboard"
            active={activeSection === 'dashboard'}
            onClick={() => handleNavigation('dashboard')}
          />
          <SidebarButton
            icon={profileIcon}
            label="Profile"
            active={activeSection === 'editProfile'}
            onClick={() => handleNavigation('editProfile')}
          />
          <SidebarButton
            icon={carIcon}
            label="Offer Ride"
            active={activeSection === 'offerRide'}
            onClick={() => handleNavigation('offerRide')}
          />
          <SidebarButton
            icon={searchIcon}
            label="Find Ride"
            active={activeSection === 'findRide'}
            onClick={() => handleNavigation('findRide')}
          />
          <SidebarButton
            icon={mapIcon}
            label="Live Map"
            active={activeSection === 'map'}
            onClick={() => handleNavigation('map')}
          />
          <SidebarButton
            icon={historyIcon}
            label="Ride History"
            active={activeSection === 'rideHistory'}
            onClick={() => handleNavigation('rideHistory')}
          />
          <SidebarButton
            icon={messagesIcon}
            label="Messages"
            active={activeSection === 'messages'}
            onClick={() => handleNavigation('messages')}
          />
          <SidebarButton
            icon={friendsIcon}
            label="Friends"
            active={activeSection === 'friends'}
            onClick={() => handleNavigation('friends')}
          />
          <SidebarButton
            icon={communityIcon}
            label="Communities"
            active={activeSection === 'communities'}
            onClick={() => handleNavigation('communities')}
          />
          <SidebarButton
            icon={notificationIcon}
            label="Notifications"
            active={activeSection === 'notifications'}
            onClick={() => handleNavigation('notifications')}
          />
          <SidebarButton
            icon={settingsIcon}
            label="Settings"
            active={activeSection === 'settings'}
            onClick={() => handleNavigation('settings')}
          />
          <SidebarButton
            icon={safetyIcon}
            label="Safety"
            active={activeSection === 'reportSafety'}
            onClick={() => handleNavigation('reportSafety')}
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
        {/* Hamburger Menu Button */}
        <div className="md:hidden sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-white font-bold">MilesAmigos</h1>
        </div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'dashboard' && <DashboardHome onNavigate={setActiveSection} />}
            {activeSection === 'offerRide' && <OfferRide />}
            {activeSection === 'findRide' && <FindRide />}
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
