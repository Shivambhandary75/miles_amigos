import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmationDialog from '../components/ConfirmationDialog'
import DashboardHome from '../components/dashboard/DashboardHome'
import OfferRide from '../components/dashboard/OfferRide'
import FindRide from '../components/dashboard/FindRide'
import InProgressRide from '../components/dashboard/InProgressRide' // Import InProgressRide
// import Messages from '../components/dashboard/Messages'
import Friends from '../components/dashboard/Friends'
// import Communities from '../components/dashboard/Communities'
import Notifications from '../components/dashboard/Notifications'
// import Settings from '../components/dashboard/Settings'
import SafetyHelp from '../components/dashboard/SafetyHelp'
import RideHistory from '../components/dashboard/RideHistory'
import LiveMap from '../components/dashboard/LiveMapNew'
import EditProfile from '../components/dashboard/EditProfile'
import UpcomingRides from '../components/dashboard/UpcomingRides'
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
import api from '../utils/api' // Import api utility

import { motion } from 'framer-motion'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inProgressRide, setInProgressRide] = useState(null) // New state for in-progress ride
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInProgressRide = async () => {
      try {
        const res = await api.get('/rides/in-progress');
        if (res.data && res.data.message !== 'No in-progress ride found for this driver.') {
          setInProgressRide(res.data);
        } else {
          setInProgressRide(null);
        }
      } catch (err) {
        console.error('Error fetching in-progress ride:', err);
        setInProgressRide(null);
      }
    };

    fetchInProgressRide();
    // Optionally, refresh in-progress ride status periodically
    const intervalId = setInterval(fetchInProgressRide, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, []);

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
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-green-500/30">
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={`fixed md:relative w-72 bg-[#1e293b]/50 backdrop-blur-xl border-r border-white/5 min-h-screen py-8 px-4 flex flex-col gap-2 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="mb-10 px-2 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            MilesAmigos
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            icon={notificationIcon}
            label="Upcoming Rides"
            active={activeSection === 'upcomingRides'}
            onClick={() => handleNavigation('upcomingRides')}
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
          {/* <SidebarButton
            icon={messagesIcon}
            label="Messages"
            active={activeSection === 'messages'}
            onClick={() => handleNavigation('messages')}
          /> */}
          <SidebarButton
            icon={friendsIcon}
            label="Friends"
            active={activeSection === 'friends'}
            onClick={() => handleNavigation('friends')}
          />
          {/* <SidebarButton
            icon={communityIcon}
            label="Communities"
            active={activeSection === 'communities'}
            onClick={() => handleNavigation('communities')}
          /> */}
          <SidebarButton
            icon={notificationIcon}
            label="Notifications"
            active={activeSection === 'notifications'}
            onClick={() => handleNavigation('notifications')}
          />
          {/* <SidebarButton
            icon={settingsIcon}
            label="Settings"
            active={activeSection === 'settings'}
            onClick={() => handleNavigation('settings')}
          /> */}
          <SidebarButton
            icon={safetyIcon}
            label="Safety"
            active={activeSection === 'reportSafety'}
            onClick={() => handleNavigation('reportSafety')}
          />
        </nav>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full mt-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-semibold 
                     transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <img src={logoutIcon} alt="logout icon" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          Logout
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-[#0f172a] to-[#0f172a] -z-10 pointer-events-none" />

        {/* Hamburger Menu Button */}
        <div className="md:hidden sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition"
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
          <h1 className="text-white font-bold text-lg">MilesAmigos</h1>
        </div>

        <div className="p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Show In-Progress Ride as overlay/banner if exists */}
            {inProgressRide && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 font-semibold flex items-center gap-2">
                      <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
                      Active Ride In Progress
                    </p>
                    <p className="text-sm text-green-200/70 mt-1">You have an active ride. Complete payment to finish.</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('map')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition shadow-lg shadow-green-900/20"
                  >
                    Go to Live Map
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'dashboard' && <DashboardHome onNavigate={setActiveSection} />}
            {activeSection === 'offerRide' && <OfferRide />}
            {activeSection === 'findRide' && <FindRide />}
            {activeSection === 'upcomingRides' && <UpcomingRides />}
            {/* {activeSection === 'messages' && <Messages />} */}
            {activeSection === 'friends' && <Friends />}
            {/* {activeSection === 'communities' && <Communities onNavigate={setActiveSection} />} */}
            {activeSection === 'notifications' && <Notifications />}
            {/* {activeSection === 'settings' && <Settings />} */}
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
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active
        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/20'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <img src={icon} alt={label} className={`w-5 h-5 object-contain transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`} />
      <span>{label}</span>
    </motion.button>
  )
}
