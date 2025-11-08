import { useState } from 'react'
import settingsIcon from '../../assets/icons8-settings-50.png'
import notificationIcon from '../../assets/icons8-notification-50.png'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: false,
    darkMode: true,
    sms: true,
  })

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
           Settings
        </h1>
        <p className="text-gray-400">Manage your preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Notifications */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                     Notifications
          </h3>
          <div className="space-y-4">
            {[
              { key: 'notifications', label: 'Push Notifications' },
              { key: 'sms', label: 'SMS Alerts' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <label className="text-white cursor-pointer">{item.label}</label>
                <button
                  onClick={() => toggleSetting(item.key)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    settings[item.key] ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span></span> Privacy & Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <label className="text-white">Profile Visibility</label>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Public
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <label className="text-white">Two-Factor Auth</label>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <label className="text-white cursor-pointer">Privacy Mode</label>
              <button
                onClick={() => toggleSetting('privacy')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  settings.privacy ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.privacy ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-500/10 backdrop-blur-lg p-6 rounded-2xl border border-red-500/30 max-w-2xl">
        <h3 className="text-xl font-bold text-red-400 mb-4"> Danger Zone</h3>
        <p className="text-gray-400 mb-4">These actions are irreversible. Please proceed with caution.</p>
        <div className="flex gap-3">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            Reset Password
          </button>
          <button className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold transition">
            Delete Account
          </button>
        </div>
      </div>
    </section>
  )
}
